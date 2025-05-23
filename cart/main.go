package main

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// CartItem represents an item in the shopping cart
type CartItem struct {
	ID          string  `json:"id"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	TotalPrice  float64 `json:"total_price"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Image       string  `json:"image"`
}

// Cart represents the shopping cart
type Cart struct {
	ID        string              `json:"id"`
	UserID    string              `json:"user_id"`
	Items     map[string]CartItem `json:"items"`
	Total     float64             `json:"total"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
	ExpiresAt time.Time           `json:"expires_at"`
}

var ctx = context.Background()
var rdb *redis.Client

const (
	cartPrefix = "cart:"
	cartExpiry = 48 * time.Hour // 2 days
)

func main() {
	// Initialize Redis client
	rdb = redis.NewClient(&redis.Options{
		Addr:     "cart-redis-srv:6379",
		Password: "", // no password
		DB:       0,  // default DB
	})

	// Check Redis connection
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Connected to Redis successfully")

	// Setup router
	r := mux.NewRouter()
	r.Use(loggingMiddleware)
	r.Use(errorLoggingMiddleware)

	// Public routes
	r.HandleFunc("/api/cart/health", CheckHealthHandler).Methods("GET")

	// Authenticated routes
	cartRoutes := r.PathPrefix("/api/cart").Subrouter()
	cartRoutes.Use(authMiddleware)
	cartRoutes.HandleFunc("/{user_id}", GetCartHandler).Methods("GET")
	cartRoutes.HandleFunc("/{user_id}/items", AddItemHandler).Methods("POST")
	cartRoutes.HandleFunc("/{user_id}/items/bulk-add", AddBulkItemsHandler).Methods("POST")
	cartRoutes.HandleFunc("/{user_id}/items/{product_id}", UpdateItemHandler).Methods("PUT")
	cartRoutes.HandleFunc("/{user_id}/items/{product_id}", RemoveItemHandler).Methods("DELETE")
	cartRoutes.HandleFunc("/{user_id}/clear", ClearCartHandler).Methods("DELETE")

	// Start server
	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

// authMiddleware verifies the session and adds user info to context
func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[authMiddleware] Processing request for %s", r.URL.Path)

		// Get session cookie
		cookie, err := r.Cookie("session")
		if err != nil || cookie == nil {
			log.Printf("[authMiddleware] No session cookie found: %v", err)
			respondWithError(w, http.StatusUnauthorized, "Not authorized", err)
			return
		}
		log.Printf("[authMiddleware] Found session cookie: %s", cookie.String())

		// Make request to auth service to validate session
		authURL := "http://auth-srv:3000/api/users/currentuser"
		log.Printf("[authMiddleware] Making request to auth service: %s", authURL)
		authReq, err := http.NewRequest("GET", authURL, nil)
		if err != nil {
			log.Printf("[authMiddleware] Failed to create request: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to create request", err)
			return
		}

		// Copy all cookies from the original request
		for _, c := range r.Cookies() {
			authReq.AddCookie(c)
			log.Printf("[authMiddleware] Added cookie to auth request: %s", c.String())
		}

		// Copy relevant headers that might be needed for auth
		authReq.Header.Set("Cookie", r.Header.Get("Cookie"))
		log.Printf("[authMiddleware] Cookie header: %s", r.Header.Get("Cookie"))

		// Create HTTP client with timeout
		client := &http.Client{
			Timeout: 5 * time.Second,
		}

		// Execute request
		resp, err := client.Do(authReq)
		if err != nil {
			log.Printf("[authMiddleware] Failed to validate session: %v", err)
			respondWithError(w, http.StatusUnauthorized, "Failed to validate session", err)
			return
		}

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Printf("[authMiddleware] Failed to read response: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to read response", err)
			return
		}
		resp.Body.Close()

		log.Printf("[authMiddleware] Auth service response status: %d", resp.StatusCode)
		log.Printf("[authMiddleware] Auth service response body: %s", string(body))
		// example response
		// Auth service response body: {"id":"682ee1cbd9d5aeac96b9a4c1","username":"test1","email":"test1@example.com","role":"seller","iat":1747902923}

		// Check if response is successful
		if resp.StatusCode != http.StatusOK {
			log.Printf("[authMiddleware] Auth service returned non-OK status: %d", resp.StatusCode)
			respondWithError(w, http.StatusUnauthorized, "Not authorized", nil)
			return
		}

		// Parse user info
		var response struct {
			ID       string `json:"id"`
			Email    string `json:"email"`
			Username string `json:"username"`
		}

		if err := json.Unmarshal(body, &response); err != nil {
			log.Printf("[authMiddleware] Failed to parse user info: %v", err)
			respondWithError(w, http.StatusInternalServerError, "Failed to parse user info", err)
			return
		}

		// Check if user is authenticated
		if response.ID == "" {
			log.Printf("[authMiddleware] User not authenticated")
			respondWithError(w, http.StatusUnauthorized, "Not authorized", nil)
			return
		}

		log.Printf("[authMiddleware] User authenticated: %s", response.Email)

		// Add user info to context
		ctx := context.WithValue(r.Context(), "currentUser", response)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// getCartKey returns the Redis key for a cart
func getCartKey(userID string) string {
	return cartPrefix + userID
}

// Create a new cart
func newCart(userID string) *Cart {
	return &Cart{
		ID:        uuid.New().String(),
		UserID:    userID,
		Items:     make(map[string]CartItem),
		Total:     0,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		ExpiresAt: time.Now().Add(cartExpiry),
	}
}

func CheckHealthHandler(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// GetCartHandler returns the user's cart
func GetCartHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]

	cart, err := getCart(userID)
	if err == redis.Nil {
		// Cart doesn't exist, return empty cart
		cart = newCart(userID)

		// Save the new cart
		if err := saveCart(cart); err != nil {
			respondWithError(w, http.StatusInternalServerError, "Failed to create cart", err)
			return
		}
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get cart", err)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// AddItemHandler adds an item to the cart
func AddItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]

	var item CartItem
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		log.Printf("Error decoding request body: %v \n", err)
		log.Printf("item: %v \n", item)
		respondWithError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Calculate total price for this item
	item.TotalPrice = item.Price * float64(item.Quantity)

	cart, err := getCart(userID)
	if err == redis.Nil {
		// Create a new cart if it doesn't exist
		cart = newCart(userID)
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get cart", err)
		return
	}

	// Update or add the item
	if existingItem, exists := cart.Items[item.ID]; exists {
		// Update quantity
		item.Quantity += existingItem.Quantity
		item.TotalPrice = item.Price * float64(item.Quantity)
	}

	cart.Items[item.ID] = item
	cart.UpdatedAt = time.Now()

	// Recalculate cart total
	recalculateCartTotal(cart)

	if err := saveCart(cart); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update cart", err)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// AddBulkItemsHandler adds multiple items to the cart in a single request
func AddBulkItemsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]

	log.Printf("Adding bulk items to cart for user: %s", userID)

	var items []CartItem
	if err := json.NewDecoder(r.Body).Decode(&items); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	log.Printf("Items to add: %v", items)

	cart, err := getCart(userID)
	if err == redis.Nil {
		// Create a new cart if it doesn't exist
		cart = newCart(userID)
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get cart", err)
		return
	}

	// Add or update each item in the cart
	for _, item := range items {
		// Calculate total price for this item
		item.TotalPrice = item.Price * float64(item.Quantity)

		// Update or add the item
		if _, exists := cart.Items[item.ID]; exists {
			// just use item.Quantity
			item.TotalPrice = item.Price * float64(item.Quantity)
		}

		cart.Items[item.ID] = item
	}

	cart.UpdatedAt = time.Now()

	// Recalculate cart total
	recalculateCartTotal(cart)

	if err := saveCart(cart); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update cart", err)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// UpdateItemHandler updates an item's quantity in the cart
func UpdateItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]
	productID := vars["product_id"]

	var updateData struct {
		Quantity int `json:"quantity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	cart, err := getCart(userID)
	if err == redis.Nil {
		http.Error(w, "Cart not found", http.StatusNotFound)
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get cart", err)
		return
	}

	item, exists := cart.Items[productID]
	if !exists {
		http.Error(w, "Item not found in cart", http.StatusNotFound)
		return
	}

	if updateData.Quantity <= 0 {
		// Remove item if quantity is zero or negative
		delete(cart.Items, productID)
	} else {
		// Update quantity
		item.Quantity = updateData.Quantity
		item.TotalPrice = item.Price * float64(item.Quantity)
		cart.Items[productID] = item
	}

	cart.UpdatedAt = time.Now()

	// Recalculate cart total
	recalculateCartTotal(cart)

	if err := saveCart(cart); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update cart", err)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// RemoveItemHandler removes an item from the cart
func RemoveItemHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]
	productID := vars["product_id"]

	cart, err := getCart(userID)
	if err == redis.Nil {
		http.Error(w, "Cart not found", http.StatusNotFound)
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get cart", err)
		return
	}

	if _, exists := cart.Items[productID]; !exists {
		http.Error(w, "Item not found in cart", http.StatusNotFound)
		return
	}

	delete(cart.Items, productID)
	cart.UpdatedAt = time.Now()

	// Recalculate cart total
	recalculateCartTotal(cart)

	if err := saveCart(cart); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to update cart", err)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// ClearCartHandler removes all items from the cart
func ClearCartHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["user_id"]

	cart, err := getCart(userID)
	if err == redis.Nil {
		http.Error(w, "Cart not found", http.StatusNotFound)
		return
	} else if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to get cart", err)
		return
	}

	cart.Items = make(map[string]CartItem)
	cart.Total = 0
	cart.UpdatedAt = time.Now()

	if err := saveCart(cart); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to clear cart", err)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// Helper function to get a cart from Redis
func getCart(userID string) (*Cart, error) {
	key := getCartKey(userID)
	val, err := rdb.Get(ctx, key).Result()
	if err != nil {
		log.Printf("Error fetching cart from Redis for user %s: %v", userID, err)
		return nil, err
	}

	var cart Cart
	if err := json.Unmarshal([]byte(val), &cart); err != nil {
		log.Printf("Error unmarshaling cart data for user %s: %v", userID, err)
		return nil, err
	}

	return &cart, nil
}

// Helper function to save a cart to Redis
func saveCart(cart *Cart) error {
	jsonData, err := json.Marshal(cart)
	if err != nil {
		return err
	}

	key := getCartKey(cart.UserID)
	return rdb.Set(ctx, key, jsonData, cartExpiry).Err()
}

// Helper function to respond with JSON
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, "Failed to marshal JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func respondWithError(w http.ResponseWriter, code int, msg string, err error) {
	log.Printf("%s: %v", msg, err)
	http.Error(w, msg, code)
}

// Recalculate cart total
func recalculateCartTotal(cart *Cart) {
	cart.Total = 0
	for _, item := range cart.Items {
		cart.Total += item.TotalPrice
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, _ := io.ReadAll(r.Body)
		r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		log.Printf("Incoming request: %s %s | Body: %s | Headers: %v",
			r.Method, r.URL.Path, string(bodyBytes), r.Header)

		next.ServeHTTP(w, r)
	})
}

func errorLoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("Panic recovered: %v", rec)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// func loggingMiddleware(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		log.Printf("Received %s request for %s", r.Method, r.URL.Path)
// 		log.Printf("Request body: %v and header: %v", r.Body, r.Header)
// 		next.ServeHTTP(w, r)
// 		log.Printf("Responded to %s request for %s", r.Method, r.URL.Path)
// 	})
// }

// func errorLoggingMiddleWare(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		defer func() {
// 			if err := recover(); err != nil {
// 				log.Printf("Error: %v", err)
// 				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
// 			}
// 		}()
// 		next.ServeHTTP(w, r)
// 	})
// }
