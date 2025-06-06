import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { allProducts } from "@/products";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCEPg9adZvyDXK0bNsCPFdWxaK8LvidOhA",
  authDomain: "tucs-app.firebaseapp.com",
  projectId: "tucs-app",
  storageBucket: "tucs-app.firebasestorage.app",
  messagingSenderId: "1063093744951",
  appId: "1:1063093744951:web:a83b84fc1b0215f2e4d6b2",
  measurementId: "G-WRLJZPB3F7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Product {
  id: string;
  category: string;
  name: string;
  srcUrl: string;
  images: string[];
  price: number;
  discount: { amount: number; percentage: number };
  rating: number;
}

const restoreProducts = async () => {
  try {
    const productsCollection = collection(db, "products");
    
    for (const product of allProducts) {
      const productDoc = doc(productsCollection, product.id);
      await setDoc(productDoc, {
        ...product,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date().toISOString(),
        stock: 10,
        description: `${product.name} - Producto de alta calidad`,
        sales: 0,
        freeShipping: false,
        specialOffer: product.discount.percentage > 0,
        newArrival: false,
        featuredBrand: false,
        promos: []
      });
      console.log(`Producto restaurado: ${product.name}`);
    }
    
    console.log("¡Restauración completada con éxito!");
  } catch (error) {
    console.error("Error al restaurar productos:", error);
  }
};

// Ejecutar la restauración
restoreProducts(); 