import { createSlice } from "@reduxjs/toolkit";
import { fetchCart } from "./cartThunks";

const initialState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    fetchFromLocalStorage: (state, action) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase("cart/fetchCart/fulfilled", (state, action) => {
        state.items = action.payload;
      })
      .addCase("cart/fetchCart/rejected", (state, action) => {
        console.error("Failed to fetch cart items:", action.payload);
      })

      // transferCartToServer
      .addCase("cart/transferCartToServer/fulfilled", (state, action) => {
        console.log("Cart items transferred to server successfully");
      })
      .addCase("cart/transferCartToServer/rejected", (state, action) => {
        console.error(
          "Failed to transfer cart items to server:",
          action.payload
        );
      })

      // addToCart
      .addCase("cart/addToCart/fulfilled", (state, action) => {
        const index = state.items.findIndex(
          (cartItem) => cartItem.id === action.payload.id
        );

        if (index >= 0) {
          state.items[index].quantity++;
        } else {
          state.items = [...state.items, action.payload];
        }
      })
      .addCase("cart/addToCart/rejected", (state, action) => {
        console.error("Failed to add item to cart:", action.payload);
      })

      // removeFromCart
      .addCase("cart/removeFromCart/fulfilled", (state, action) => {
        const index = state.items.findIndex(
          (cartItem) => cartItem.id === action.payload
        );
        if (index >= 0) {
          state.items.splice(index, 1);
        }
      })
      .addCase("cart/removeFromCart/rejected", (state, action) => {
        console.error("Failed to remove item from cart:", action.payload);
      })

      // updateItemQuantity
      .addCase("cart/updateItemQuantity/fulfilled", (state, action) => {
        const index = state.items.findIndex(
          (cartItem) => cartItem.id === action.payload.productId
        );
        if (index >= 0) {
          state.items[index].quantity = action.payload.quantity;
        }
      })
      .addCase("cart/updateItemQuantity/rejected", (state, action) => {
        console.error("Failed to update item quantity:", action.payload);
      })

      // clearCart
      .addCase("cart/clearCart/fulfilled", (state, action) => {
        state.items = [];
      })
      .addCase("cart/clearCart/rejected", (state, action) => {
        console.error("Failed to clear cart:", action.payload);
      });
  },
});

export const { fetchFromLocalStorage } = cartSlice.actions;

// Selectors - This is how we pull information from the Global store slice
export const selectItems = (state) => state.cart.items;

export const selectTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export default cartSlice.reducer;
