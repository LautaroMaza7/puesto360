import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

async function verifyFirebaseConnection() {
  try {
    console.log('Verificando conexión a Firebase...');
    
    // Verificar colección de productos
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    console.log(`✅ Conexión a Firebase exitosa`);
    console.log(`📊 Colección 'products': ${productsSnapshot.size} documentos encontrados`);
    
    if (productsSnapshot.size > 0) {
      // Mostrar el primer producto como ejemplo
      const firstProduct = productsSnapshot.docs[0];
      console.log('📝 Ejemplo de producto:');
      console.log({
        id: firstProduct.id,
        ...firstProduct.data()
      });
    }
    
    // Verificar colección de carritos
    const cartsRef = collection(db, 'carts');
    const cartsSnapshot = await getDocs(cartsRef);
    
    console.log(`📊 Colección 'carts': ${cartsSnapshot.size} documentos encontrados`);
    
    // Verificar estructura de un carrito si existe
    if (cartsSnapshot.size > 0) {
      const firstCart = cartsSnapshot.docs[0];
      const cartData = firstCart.data();
      console.log('🛒 Ejemplo de carrito:');
      console.log({
        id: firstCart.id,
        itemsCount: cartData.items ? cartData.items.length : 0,
        // No mostrar todos los items para evitar logs muy largos
        sampleItem: cartData.items && cartData.items.length > 0 ? cartData.items[0] : null
      });
    }
    
    console.log('✅ Verificación completada con éxito');
    return true;
  } catch (error) {
    console.error('❌ Error al verificar Firebase:', error);
    return false;
  }
}

// Ejecutar la verificación
verifyFirebaseConnection(); 