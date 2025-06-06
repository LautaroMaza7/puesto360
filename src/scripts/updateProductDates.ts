import { db } from '@/lib/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

export async function updateProductDates() {
  try {
    const productsRef = collection(db, 'products')
    const snapshot = await getDocs(productsRef)
    const totalProducts = snapshot.size
    let updatedProducts = 0

    for (const docSnap of snapshot.docs) {
      const productData = docSnap.data()
      
      // Verificar si el producto necesita actualización
      if (!productData.createdAt || !productData.updatedAt) {
        const productRef = doc(db, 'products', docSnap.id)
        await updateDoc(productRef, {
          createdAt: productData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        updatedProducts++
      }
    }

    return {
      success: true,
      totalProducts,
      updatedProducts
    }
  } catch (error) {
    console.error('Error updating product dates:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
} 