// lib/getProducts.ts
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from '@/types/product';

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const snapshot = await getDocs(productsCol);

  const products: Product[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  console.log("📦 Productos desde Firestore:", products); // <-- importante

  return products;
}
