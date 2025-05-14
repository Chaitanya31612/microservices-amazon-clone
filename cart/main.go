package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// CartItem represents an item in the shopping cart
type CartItem struct {
	ProductID  string  `json:"product_id"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	TotalPrice float64 `json:"total_price"`
	Name       string  `json:"name"`
	ImageURL   string  `json:"image_url"`
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
	cartExpiry = 24 * time.Hour
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
	r.HandleFunc("/api/cart/health", CheckHealthHandler).Methods("GET")
	r.HandleFunc("/api/cart/{user_id}", GetCartHandler).Methods("GET")
	r.HandleFunc("/api/cart/{user_id}/items", AddItemHandler).Methods("POST")
	r.HandleFunc("/api/cart/{user_id}/items/{product_id}", UpdateItemHandler).Methods("PUT")
	r.HandleFunc("/api/cart/{user_id}/items/{product_id}", RemoveItemHandler).Methods("DELETE")
	r.HandleFunc("/api/cart/{user_id}/clear", ClearCartHandler).Methods("DELETE")

	// Start server
	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
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
			http.Error(w, "Failed to create cart", http.StatusInternalServerError)
			return
		}
	} else if err != nil {
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
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
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Calculate total price for this item
	item.TotalPrice = item.UnitPrice * float64(item.Quantity)

	cart, err := getCart(userID)
	if err == redis.Nil {
		// Create a new cart if it doesn't exist
		cart = newCart(userID)
	} else if err != nil {
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
		return
	}

	// Update or add the item
	if existingItem, exists := cart.Items[item.ProductID]; exists {
		// Update quantity
		item.Quantity += existingItem.Quantity
		item.TotalPrice = item.UnitPrice * float64(item.Quantity)
	}

	cart.Items[item.ProductID] = item
	cart.UpdatedAt = time.Now()

	// Recalculate cart total
	recalculateCartTotal(cart)

	if err := saveCart(cart); err != nil {
		http.Error(w, "Failed to update cart", http.StatusInternalServerError)
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
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	cart, err := getCart(userID)
	if err == redis.Nil {
		http.Error(w, "Cart not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
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
		item.TotalPrice = item.UnitPrice * float64(item.Quantity)
		cart.Items[productID] = item
	}

	cart.UpdatedAt = time.Now()

	// Recalculate cart total
	recalculateCartTotal(cart)

	if err := saveCart(cart); err != nil {
		http.Error(w, "Failed to update cart", http.StatusInternalServerError)
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
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
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
		http.Error(w, "Failed to update cart", http.StatusInternalServerError)
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
		http.Error(w, "Failed to get cart", http.StatusInternalServerError)
		return
	}

	cart.Items = make(map[string]CartItem)
	cart.Total = 0
	cart.UpdatedAt = time.Now()

	if err := saveCart(cart); err != nil {
		http.Error(w, "Failed to clear cart", http.StatusInternalServerError)
		return
	}

	respondWithJSON(w, http.StatusOK, cart)
}

// Helper function to get a cart from Redis
func getCart(userID string) (*Cart, error) {
	key := getCartKey(userID)
	val, err := rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, err
	}

	var cart Cart
	if err := json.Unmarshal([]byte(val), &cart); err != nil {
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

// Recalculate cart total
func recalculateCartTotal(cart *Cart) {
	cart.Total = 0
	for _, item := range cart.Items {
		cart.Total += item.TotalPrice
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received %s request for %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("Responded to %s request for %s", r.Method, r.URL.Path)
	})
}
