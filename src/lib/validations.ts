import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Función para calcular la distancia entre dos puntos (Haversine)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distancia en km
}

// Función para validar si una ubicación está dentro del ratio permitido
export async function validateLocation(lat: number, lng: number): Promise<boolean> {
  try {
    // Obtener la configuración general
    const settingsRef = doc(db, 'settings', 'general')
    const settingsDoc = await getDoc(settingsRef)
    
    if (!settingsDoc.exists()) {
      console.error('No se encontró la configuración general')
      return false
    }
    
    const settings = settingsDoc.data()
    const locations = settings.locations || []
    
    // Verificar si alguna ubicación está dentro del ratio
    for (const location of locations) {
      const distance = calculateDistance(lat, lng, location.lat, location.lng)
      if (distance <= (location.radio / 1000)) { // Convertir metros a km
        return true // La ubicación está dentro del ratio
      }
    }
    
    return false // No hay ubicaciones dentro del ratio
  } catch (error) {
    console.error('Error al validar ubicación:', error)
    return false
  }
} 