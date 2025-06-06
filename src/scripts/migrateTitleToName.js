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

async function migrateTitleToName() {
  try {
    console.log('Iniciando migración de title a name...');
    
    // Obtener todos los productos
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Procesar cada documento
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      
      // Verificar si el documento tiene title
      if (data.title) {
        try {
          // Preparar los datos para actualizar
          const updateData = {
            name: data.title
          };

          // Si el documento ya tiene name, mantenerlo
          if (data.name) {
            console.log(`Documento ${docSnapshot.id} ya tiene name, manteniendo valor existente`);
            skippedCount++;
            continue;
          }

          // Actualizar el documento
          await updateDoc(doc(db, 'products', docSnapshot.id), updateData);
          updatedCount++;
          console.log(`Documento ${docSnapshot.id} actualizado correctamente`);
        } catch (error) {
          errorCount++;
          console.error(`Error al actualizar documento ${docSnapshot.id}:`, error);
        }
      } else {
        skippedCount++;
        console.log(`Documento ${docSnapshot.id} no tiene title, saltando...`);
      }
    }
    
    console.log('\nMigración completada:');
    console.log(`- Documentos actualizados: ${updatedCount}`);
    console.log(`- Documentos saltados: ${skippedCount}`);
    console.log(`- Errores: ${errorCount}`);
    
  } catch (error) {
    console.error('Error general durante la migración:', error);
  } finally {
    // Cerrar la conexión de Firebase
    process.exit(0);
  }
}

// Ejecutar la migración
migrateTitleToName(); 