import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

// Estructura esperada de un producto
const expectedFields = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  subcategory: '',
  active: true,
  freeShipping: false,
  specialOffer: false,
  newArrival: false,
  featuredBrand: false,
  discount: {
    percentage: 0,
    amount: 0
  },
  images: [],
  srcUrl: '',
  rating: 0,
  sales: 0,
  createdAt: null,
  updatedAt: null
};

async function verifyAndUpdateProducts() {
  try {
    console.log('Iniciando verificación y actualización de productos...\n');
    
    // Obtener todos los productos
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let totalProducts = snapshot.size;
    let productsWithMissingFields = 0;
    let updatedProducts = 0;
    let productsWithErrors = 0;
    
    console.log(`Total de productos encontrados: ${totalProducts}\n`);
    console.log('Analizando productos...\n');

    // Procesar cada documento
    for (const docSnapshot of snapshot.docs) {
      const productId = docSnapshot.id;
      const data = docSnapshot.data();
      const missingFields = [];
      const updateData = {};
      
      // Verificar cada campo esperado
      for (const [field, defaultValue] of Object.entries(expectedFields)) {
        if (field === 'discount') {
          if (!data.discount || typeof data.discount !== 'object') {
            missingFields.push('discount');
            updateData.discount = defaultValue;
          } else {
            if (!data.discount.hasOwnProperty('percentage')) {
              missingFields.push('discount.percentage');
              if (!updateData.discount) updateData.discount = {};
              updateData.discount.percentage = defaultValue.percentage;
            }
            if (!data.discount.hasOwnProperty('amount')) {
              missingFields.push('discount.amount');
              if (!updateData.discount) updateData.discount = {};
              updateData.discount.amount = defaultValue.amount;
            }
          }
        } else if (!data.hasOwnProperty(field)) {
          missingFields.push(field);
          updateData[field] = defaultValue;
        }
      }

      // Si faltan campos, actualizar el documento
      if (missingFields.length > 0) {
        productsWithMissingFields++;
        console.log(`\nProducto ${productId}:`);
        console.log('Campos faltantes:', missingFields.join(', '));
        
        try {
          // Asegurarse de que createdAt y updatedAt tengan valores
          if (!data.createdAt) {
            updateData.createdAt = new Date().toISOString();
          }
          updateData.updatedAt = new Date().toISOString();

          // Actualizar el documento
          await updateDoc(doc(db, 'products', productId), updateData);
          updatedProducts++;
          console.log('✅ Producto actualizado correctamente');
        } catch (error) {
          productsWithErrors++;
          console.error('❌ Error al actualizar:', error);
        }
      }
    }
    
    console.log('\nResumen de la verificación:');
    console.log(`- Total de productos: ${totalProducts}`);
    console.log(`- Productos con campos faltantes: ${productsWithMissingFields}`);
    console.log(`- Productos actualizados: ${updatedProducts}`);
    console.log(`- Errores: ${productsWithErrors}`);
    
  } catch (error) {
    console.error('\nError general durante la verificación:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la verificación
verifyAndUpdateProducts(); 