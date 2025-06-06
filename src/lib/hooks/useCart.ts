import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";

interface CartItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
  slug?: string;
  productId?: string;
  discount: {
    percentage: number;
    amount: number;
  };
  srcUrl?: string;
  activePromo?: {
    cantidad: number;
    descuento: number;
    precioFinal: number;
  };
}

interface CartData {
  items: CartItem[];
  adjustedTotalPrice?: number;
}

export function useCart() {
  const { isSignedIn, user } = useUser();
  const [cart, setCartState] = useState<CartData>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasSynced = useRef(false);

  // Función auxiliar para leer localStorage
  const getLocalCart = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem("cart");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error leyendo carrito local:", error);
      return [];
    }
  };

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleCartUpdate = () => {
      const localCart = getLocalCart();
      setCartState({ items: localCart });
    };

    window.addEventListener("cartUpdate", handleCartUpdate);
    return () => window.removeEventListener("cartUpdate", handleCartUpdate);
  }, []);

  // Sincronizar con Firestore
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si NO está logueado, usar localStorage
        if (!isSignedIn || !user?.id) {
          const localCart = getLocalCart();
          setCartState({ items: localCart });
          setLoading(false);
          return;
        }

        // Usuario logueado: conectar a Firestore
        const userId = user.id;
        const cartDocRef = doc(collection(db, "carts"), userId);

        const unsubscribe = onSnapshot(
          cartDocRef,
          async (snapshot) => {
            try {
              const localCart = getLocalCart();
              let parsedLocal: CartItem[] = localCart;

              if (snapshot.exists()) {
                const firestoreCart = snapshot.data() as CartData;
                const validatedItems = firestoreCart.items.map((item, index) => ({
                  ...item,
                  id: item.id ?? item.productId ?? index.toString(),
                  name: item.name ?? "Producto sin nombre",
                  price: item.price ?? 0,
                  quantity: item.quantity ?? 1,
                  totalPrice: item.totalPrice ?? item.price * (item.quantity ?? 1),
                  srcUrl: item.srcUrl ?? "",
                  image: item.srcUrl ?? "",
                  discount: item.discount ?? { percentage: 0, amount: 0 },
                  slug: item.slug ?? "",
                  productId: item.productId ?? "",
                }));

                setCartState({
                  ...firestoreCart,
                  items: validatedItems,
                });

                // Sincronizar carritos si es necesario
                if (!hasSynced.current) {
                  hasSynced.current = true;
                  const mergedItems = mergeCarts(validatedItems, parsedLocal);
                  if (JSON.stringify(mergedItems) !== JSON.stringify(validatedItems)) {
                    console.log("Sincronizando carritos (local + Firestore)...");
                    await setDoc(cartDocRef, { items: mergedItems });
                    setCartState({ items: mergedItems });
                    localStorage.removeItem("cart");
                  }
                }
              } else {
                // Si no existe carrito en Firestore, usar el local
                if (parsedLocal.length > 0) {
                  console.log("Creando carrito nuevo en Firestore con datos locales");
                  await setDoc(cartDocRef, { items: parsedLocal });
                  setCartState({ items: parsedLocal });
                  localStorage.removeItem("cart");
                } else {
                  setCartState({ items: [] });
                }
              }
            } catch (error) {
              console.error("Error procesando datos del carrito:", error);
              setError("Error al procesar los datos del carrito");
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error al leer carrito desde Firestore:", error);
            setError("Error al cargar el carrito");
            setCartState({ items: getLocalCart() });
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error en fetchCart:", error);
        setError("Error al cargar el carrito");
        setLoading(false);
      }
    };

    fetchCart();
  }, [isSignedIn, user?.id]);

  const totalQuantity = cart?.items.reduce(
    (acc, item) => acc + item.quantity,
    0
  ) ?? 0;

  return { cart, loading, error, totalQuantity };
}

// Función para fusionar carritos (evita duplicados por id)
function mergeCarts(remoteItems: CartItem[], localItems: CartItem[]): CartItem[] {
  const merged = [...remoteItems];
  for (const localItem of localItems) {
    const existingIndex = merged.findIndex((item) => item.id === localItem.id);
    if (existingIndex > -1) {
      merged[existingIndex].quantity += localItem.quantity;
      merged[existingIndex].totalPrice = merged[existingIndex].quantity * merged[existingIndex].price;
    } else {
      merged.push(localItem);
    }
  }
  return merged;
}
