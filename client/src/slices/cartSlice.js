import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const index = state.items.findIndex(
        (cartItem) => cartItem.id === action.payload.id
      );

      if (index >= 0) {
        state.items[index].quantity++;
      } else {
        state.items = [...state.items, action.payload];
      }

      localStorage.setItem("items", JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const index = state.items.findIndex(
        (cartItem) => cartItem.id === action.payload.id
      );

      let newCart = [...state.items];

      if (index >= 0) {
        newCart.splice(index, 1);
      } else {
        console.warn(
          `Item with id: ${action.payload.id} does not exist, Can't Delete`
        );
      }

      state.items = newCart;
      localStorage.setItem("items", JSON.stringify(state.items));
    },
    decrementQuantity: (state, action) => {
      const index = state.items.findIndex(
        (cartItem) => cartItem.id === action.payload.id
      );

      if (index >= 0) {
        state.items[index].quantity--;
      } else {
        console.warn(
          `Item with id: ${action.payload.id} does not exist, Can't Decrement`
        );
      }
      localStorage.setItem("items", JSON.stringify(state.items));
    },
    incrementQuantity: (state, action) => {
      const index = state.items.findIndex(
        (cartItem) => cartItem.id === action.payload.id
      );

      if (index >= 0) {
        state.items[index].quantity++;
      } else {
        console.warn(
          `Item with id: ${action.payload.id} does not exist, Can't Decrement`
        );
      }
      localStorage.setItem("items", JSON.stringify(state.items));
    },
    fetchFromLocalStorage: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  decrementQuantity,
  incrementQuantity,
  fetchFromLocalStorage,
} = cartSlice.actions;

// Selectors - This is how we pull information from the Global store slice
export const selectItems = (state) => state.cart.items;

export const selectTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export default cartSlice.reducer;
