import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        const items = JSON.parse(localStorage.getItem("items"));
        return items || [];
      }

      const res = await fetch(`/api/cart/${userId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const data = await res.json();
      return Object.values(data.items);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const transferCartToServer = createAsyncThunk(
  "cart/transferCartToServer",
  async (userId, { rejectWithValue }) => {
    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    const items = JSON.parse(localStorage.getItem("items")) || [];
    if (items.length === 0) return;

    const transformedItems = items.map((item) => ({
      ...item,
      id: String(item.id),
    }));

    try {
      const res = await fetch(`/api/cart/${userId}/items/bulk-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedItems),
      });

      if (!res.ok) {
        throw new Error("Failed to transfer cart items to server");
      }

      localStorage.removeItem("items");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ item, userId }, { rejectWithValue }) => {
    if (!userId) {
      const items = JSON.parse(localStorage.getItem("items")) || [];
      const existingItem = items.find((i) => i.id === item.id);

      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        items.push(item);
      }
      localStorage.setItem("items", JSON.stringify(items));
      return item;
    }

    try {
      // Convert item ID to string before sending to server
      const itemWithStringId = { ...item, id: String(item.id) };
      const res = await fetch(`/api/cart/${userId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemWithStringId),
      });

      if (!res.ok) {
        throw new Error("Failed to add item to cart");
      }

      const data = await res.json();
      return item;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Remove an item from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, userId }, { rejectWithValue }) => {
    if (!userId) {
      const items = JSON.parse(localStorage.getItem("items")) || [];
      const index = items.findIndex((i) => i.id === productId);
      if (index >= 0) {
        items.splice(index, 1);
        localStorage.setItem("items", JSON.stringify(items));
      }
      return productId;
    }

    try {
      const res = await fetch(`/api/cart/${userId}/items/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove item from cart");
      }

      return productId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update item quantity in cart
export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ productId, quantity, userId }, { rejectWithValue }) => {
    if (!userId) {
      const items = JSON.parse(localStorage.getItem("items")) || [];
      const index = items.findIndex((i) => i.id === productId);
      if (index >= 0) {
        items[index].quantity = quantity;
        localStorage.setItem("items", JSON.stringify(items));
      }
      return { productId, quantity };
    }

    try {
      const res = await fetch(`/api/cart/${userId}/items/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        throw new Error("Failed to update item quantity");
      }

      return { productId, quantity };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Clear the entire cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId, { rejectWithValue }) => {
    if (!userId) {
      localStorage.removeItem("items");
      return;
    }

    try {
      const res = await fetch(`/api/cart/${userId}/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to clear cart");
      }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
