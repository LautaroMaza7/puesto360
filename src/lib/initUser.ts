import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function initUser(userId: string, email: string) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Crear el documento del usuario si no existe
      await setDoc(userRef, {
        email,
        role: "user", // Por defecto, todos los usuarios son "user"
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  }
} 