import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Step2Data } from '../app/checkout/schema' // Ajustá la ruta según tu estructura

/**
 * Guarda los datos de dirección del usuario en Firestore bajo el documento "users/{email}"
 * @param email - El email del usuario
 * @param data - Los datos del paso 2 (dirección)
 */
export const saveAddressToFirestore = async (email: string, data: Step2Data) => {
  try {
    const userRef = doc(db, 'users', email)
    await setDoc(userRef, { ...data }, { merge: true }) // merge para no sobreescribir lo demás
    console.log('Dirección guardada correctamente en Firestore')
  } catch (error) {
    console.error('Error al guardar dirección en Firestore:', error)
  }
}
