// src/utils/cartUtils.ts

import { CartItem } from "@/lib/features/carts/cartsSlice";

export const getLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const localCart = localStorage.getItem("cart");
  return localCart ? JSON.parse(localCart) : [];
};

export const saveLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cart", JSON.stringify(items));
};

export const clearLocalCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cart");
};

export const mergeCarts = (localItems: CartItem[], remoteItems: CartItem[]): CartItem[] => {
  const merged: { [id: string]: CartItem } = {};

  [...remoteItems, ...localItems].forEach((item) => {
    if (merged[item.id]) {
      merged[item.id].quantity += item.quantity;
      merged[item.id].price = merged[item.id].quantity * item.price;
    } else {
      merged[item.id] = { ...item };
    }
  });

  return Object.values(merged);
};
