import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Inicializar Firebase solo si no existe una app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)

// Función para inicializar productos de prueba
export const initializeSampleProducts = async () => {
  try {
    const productsRef = collection(db, "products")
    const snapshot = await getDocs(productsRef)

    if (snapshot.empty) {
      console.log("Inicializando productos de prueba...")
      
      const sampleProducts = [
        {
          name: "Tela de Algodón Premium",
          title: "Tela de Algodón 100% Premium",
          description: "Tela de algodón de alta calidad, perfecta para confección de prendas casuales y formales.",
          price: 2500,
          category: "telas",
          subcategory: "algodon",
          stock: 100,
          images: ["https://images.unsplash.com/photo-1563453392212-326f5e854473"],
          srcUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473",
          active: true,
          createdAt: serverTimestamp(),
          rating: 4.5,
          sales: 0,
          discount: {
            amount: 0,
            percentage: 0
          },
          freeShipping: false,
          specialOffer: false,
          newArrival: true,
          featuredBrand: false,
          promos: []
        },
        {
          name: "Set de Agujas de Tejer",
          title: "Set Profesional de Agujas de Tejer",
          description: "Set completo de agujas de tejer en diferentes tamaños, ideal para principiantes y expertos.",
          price: 1500,
          category: "accesorios",
          subcategory: "herramientas",
          stock: 50,
          images: ["https://images.unsplash.com/photo-1583846781992-e70c5a9f5b8f"],
          srcUrl: "https://images.unsplash.com/photo-1583846781992-e70c5a9f5b8f",
          active: true,
          createdAt: serverTimestamp(),
          rating: 4.8,
          sales: 0,
          discount: {
            amount: 200,
            percentage: 0
          },
          freeShipping: true,
          specialOffer: true,
          newArrival: false,
          featuredBrand: false,
          promos: []
        },
        {
          name: "Vestido Casual",
          title: "Vestido Casual de Verano",
          description: "Vestido casual confeccionado con tela ligera y cómoda, perfecto para el verano.",
          price: 3500,
          category: "confeccion",
          subcategory: "vestidos",
          stock: 30,
          images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1"],
          srcUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1",
          active: true,
          createdAt: serverTimestamp(),
          rating: 4.7,
          sales: 0,
          discount: {
            amount: 0,
            percentage: 15
          },
          freeShipping: false,
          specialOffer: true,
          newArrival: false,
          featuredBrand: true,
          promos: []
        }
      ]

      for (const product of sampleProducts) {
        await addDoc(productsRef, product)
      }
      
      console.log("Productos de prueba inicializados correctamente")
    }
  } catch (error) {
    console.error("Error al inicializar productos de prueba:", error)
  }
}

export { app, db, storage, auth } 