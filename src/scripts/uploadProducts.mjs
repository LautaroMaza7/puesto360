import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { products } from '../data/products.mjs';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCEPg9adZvyDXK0bNsCPFdWxaK8LvidOhA",
  authDomain: "tucs-app.firebaseapp.com",
  projectId: "tucs-app",
  storageBucket: "tucs-app.appspot.com",
  messagingSenderId: "1063093744951",
  appId: "1:1063093744951:web:a83b84fc1b0215f2e4d6b2",
  measurementId: "G-WRLJZPB3F7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadProducts() {
  try {
    console.log("🚀 Iniciando carga de productos...");
    
    for (const product of products) {
      const productRef = doc(db, "products", product.id);
      await setDoc(productRef, {
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      });
      console.log(`✅ Producto ${product.name} subido correctamente`);
    }
    
    console.log("🎉 ¡Todos los productos han sido subidos exitosamente!");
  } catch (error) {
    console.error("❌ Error al subir los productos:", error);
  }
}

// Ejecutar la función
uploadProducts(); 