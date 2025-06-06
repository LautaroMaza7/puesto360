// // src/lib/hooks/useSyncCartOnLogin.ts
// import { useEffect } from "react";
// import { useAuth0 } from "@auth0/auth0-react";
// import { useAppDispatch, useAppSelector } from "../hooks/redux";
// import { db } from "@/lib/firebase";
// import { doc, getDoc, setDoc } from "firebase/firestore";
// import { setCart } from "../features/carts/cartsSlice";
// import { CartItem } from "@/lib/features/carts/cartsSlice";

// const mergeCarts = (localItems: CartItem[], firebaseItems: CartItem[]): CartItem[] => {
//   const merged: Record<string, CartItem> = {};

//   [...firebaseItems, ...localItems].forEach(item => {
//     if (merged[item.id]) {
//       merged[item.id].quantity += item.quantity;s
//       merged[item.id].totalPrice = merged[item.id].quantity * item.price;
//     } else {
//       merged[item.id] = { ...item };
//     }
//   });

//   return Object.values(merged);
// };

// export default function useSyncCartOnLogin() {
//   const { isAuthenticated, user } = useAuth0();
//   const dispatch = useAppDispatch();
//   const localItems = useAppSelector((state) => state.cart.items);

//   useEffect(() => {
//     const syncCart = async () => {
//       if (isAuthenticated && user?.sub) {
//         const cartRef = doc(db, "carts", user.sub);
//         const cartSnap = await getDoc(cartRef);

//         const firebaseItems: CartItem[] = cartSnap.exists() ? cartSnap.data().items || [] : [];

//         const mergedItems = mergeCarts(localItems, firebaseItems);

//         await setDoc(cartRef, { items: mergedItems }, { merge: true });

//         dispatch(setCart(mergedItems));
//       }
//     };

//     syncCart();
//   }, [isAuthenticated, user?.sub]);
// }
