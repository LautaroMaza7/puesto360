// src/redux/slices/cartSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

export type RemoveCartItem = {
  id: string;
};

export type CartItem = {
  id: string;
  name: string;
  srcUrl: string;
  price: number;
  discount: Product['discount'];
  quantity: number;
  slug?: string;
  productId?: string;
  activePromo?: {
    cantidad: number;
    descuento: number;
    precioFinal: number;
  };
};

export type Cart = {
  items: CartItem[];
  totalQuantities: number;
};

const getAdjustedItemPrice = (item: CartItem): number => {
  let adjustedPrice = item.price;
  
  if (item.discount.percentage > 0) {
    adjustedPrice = item.price * (1 - item.discount.percentage / 100);
  } else if (item.discount.amount > 0) {
    adjustedPrice = item.price - item.discount.amount;
  }
  
  return Math.round(adjustedPrice);
};

const getAdjustedItemTotal = (item: CartItem, quantity?: number): number => {
  const qty = quantity ?? item.quantity;
  return Math.round(getAdjustedItemPrice(item) * qty);
};

interface CartsState {
  cart: Cart | null;
  totalPrice: number;
  adjustedTotalPrice: number;
  action: "update" | "add" | "delete" | null;
}

const initialState: CartsState = {
  cart: null,
  totalPrice: 0,
  adjustedTotalPrice: 0,
  action: null,
};

export const cartsSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const itemTotal = getAdjustedItemTotal(item);

      if (state.cart === null) {
        state.cart = {
          items: [item],
          totalQuantities: item.quantity,
        };
        state.totalPrice = item.price * item.quantity;
        state.adjustedTotalPrice = itemTotal;
        return;
      }

      const existingItem = state.cart.items.find(i => i.id === item.id);

      if (existingItem) {
        state.cart.items = state.cart.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
        state.cart.totalQuantities += item.quantity;
        state.totalPrice += item.price * item.quantity;
        state.adjustedTotalPrice += itemTotal;
      } else {
        state.cart.items.push(item);
        state.cart.totalQuantities += item.quantity;
        state.totalPrice += item.price * item.quantity;
        state.adjustedTotalPrice += itemTotal;
      }
    },

    removeCartItem: (state, action: PayloadAction<RemoveCartItem>) => {
      if (!state.cart) return;

      const item = state.cart.items.find(i => i.id === action.payload.id);
      if (!item) return;

      const updatedItems = state.cart.items
        .map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter(i => i.quantity > 0);

      state.cart.items = updatedItems;
      state.cart.totalQuantities -= 1;
      state.totalPrice -= item.price;
      state.adjustedTotalPrice -= getAdjustedItemTotal(item, 1);
    },

    remove: (state, action: PayloadAction<RemoveCartItem & { quantity: number }>) => {
      if (!state.cart) return;

      const item = state.cart.items.find(i => i.id === action.payload.id);
      if (!item) return;

      state.cart.items = state.cart.items.filter(i => i.id !== item.id);
      state.cart.totalQuantities -= item.quantity;
      state.totalPrice -= item.price * item.quantity;
      state.adjustedTotalPrice -= getAdjustedItemTotal(item);
    },

    setCart: (state, action: PayloadAction<Cart>) => {
      state.cart = action.payload;

      let totalPrice = 0;
      let adjustedTotalPrice = 0;

      action.payload.items.forEach(item => {
        totalPrice += item.price * item.quantity;
        adjustedTotalPrice += getAdjustedItemTotal(item);
      });

      state.totalPrice = Math.round(totalPrice);
      state.adjustedTotalPrice = Math.round(adjustedTotalPrice);
      state.action = "update";
    },
  },
});

export const { addToCart, removeCartItem, remove, setCart } = cartsSlice.actions;
export default cartsSlice.reducer;