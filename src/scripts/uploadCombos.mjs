import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { combos } from '../data/combos.mjs';

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

async function uploadCombos() {
  try {
    console.log("🚀 Iniciando carga de combos...");
    
    for (const combo of combos) {
      const comboRef = doc(db, "products", combo.id);
      await setDoc(comboRef, {
        ...combo,
        createdAt: new Date(combo.createdAt),
        updatedAt: new Date(combo.updatedAt)
      });
      console.log(`✅ Combo ${combo.name} subido correctamente`);
    }
    
    console.log("🎉 ¡Todos los combos han sido subidos exitosamente!");
  } catch (error) {
    console.error("❌ Error al subir los combos:", error);
  }
}

// Ejecutar la función
uploadCombos(); 