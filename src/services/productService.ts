import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit as firestoreLimit, addDoc, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { Product } from "@/types/product";

// Validaciones
const MAX_PRODUCTS_PER_STORE = 100;
const MAX_IMAGES_PER_PRODUCT = 5;
const MAX_IMAGE_SIZE_MB = 2;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

export async function validateProduct(product: Partial<Product>): Promise<string[]> {
  const errors: string[] = [];

  if (!product.name || product.name.length < 2) {
    errors.push("El nombre del producto debe tener al menos 2 caracteres");
  }
  if (product.name && product.name.length > MAX_TITLE_LENGTH) {
    errors.push(`El nombre del producto no puede tener más de ${MAX_TITLE_LENGTH} caracteres`);
  }
  if (!product.description || product.description.length < 10) {
    errors.push("La descripción del producto debe tener al menos 10 caracteres");
  }
  if (product.description && product.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`La descripción no puede tener más de ${MAX_DESCRIPTION_LENGTH} caracteres`);
  }
  if (!product.price || product.price <= 0) {
    errors.push("El precio debe ser mayor a 0");
  }
  if (!product.stock || product.stock < 0) {
    errors.push("El stock no puede ser negativo");
  }
  if (!product.category) {
    errors.push("La categoría es requerida");
  }
  if (product.images && product.images.length > MAX_IMAGES_PER_PRODUCT) {
    errors.push(`No se pueden subir más de ${MAX_IMAGES_PER_PRODUCT} imágenes por producto`);
  }

  return errors;
}

export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  try {
    // Validar el producto
    const errors = await validateProduct(productData);
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    // Verificar límite de productos por tienda
    const storeProducts = await getProductsByStore(productData.storeId);
    if (storeProducts.length >= MAX_PRODUCTS_PER_STORE) {
      throw new Error(`Has alcanzado el límite de ${MAX_PRODUCTS_PER_STORE} productos por tienda`);
    }

    const productRef = doc(collection(db, "products"));
    const newProduct: Product = {
      id: productRef.id,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date().toISOString(),
      active: true,
      sales: 0,
      rating: 0
    };

    await setDoc(productRef, newProduct);
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return null;
    }

    return {
      id: productDoc.id,
      ...productDoc.data(),
    } as Product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    return productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("storeId", "==", storeId),
      where("active", "==", true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching store products:", error);
    return [];
  }
}

export async function getFeaturedProducts(limit: number = 10): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("active", "==", true),
      orderBy("sales", "desc"),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function getNewArrivals(limit: number = 10): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("active", "==", true),
      where("newArrival", "==", true),
      orderBy("createdAt", "desc"),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

export async function getProductsByCategory(category: string, limit: number = 20): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("active", "==", true),
      where("category", "==", category),
      orderBy("sales", "desc"),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function updateProduct(productId: string, updateData: Partial<Product>): Promise<void> {
  try {
    // Validar los datos actualizados
    const errors = await validateProduct(updateData);
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
} 