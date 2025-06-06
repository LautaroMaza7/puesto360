const { db } = require("../../lib/firebase");
const { doc, setDoc } = require("firebase/firestore");
const { products } = require("../data/products");

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