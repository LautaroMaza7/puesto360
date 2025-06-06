const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { Clerk } = require('@clerk/clerk-js');
require('dotenv').config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar Clerk
const clerk = Clerk.init({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
});

async function createStoreAndProducts() {
  try {
    // Obtener el usuario actual de Clerk
    const user = await clerk.user;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }

    console.log('Usuario autenticado:', user.id);

    // Crear la tienda
    const storeData = {
      name: 'Saladita',
      description: 'Tienda de productos textiles y accesorios',
      ownerId: user.id, // Usar el ID del usuario de Clerk
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active',
      address: {
        street: 'Calle Principal 123',
        city: 'Ciudad',
        state: 'Estado',
        country: 'País',
        zipCode: '12345'
      },
      contact: {
        email: user.primaryEmailAddress?.emailAddress || 'contacto@saladita.com',
        phone: user.phoneNumbers?.[0]?.phoneNumber || '+1234567890'
      }
    };

    console.log('Creando tienda con datos:', storeData);
    const storeRef = await addDoc(collection(db, 'stores'), storeData);
    console.log('Tienda creada con ID:', storeRef.id);

    // Crear productos
    const products = [
      {
        name: 'Vestido Floral',
        title: 'Vestido Floral Casual',
        description: 'Vestido casual con estampado floral, 100% algodón, tallas S-XL',
        price: 4599, // Precio en centavos
        category: 'vestidos',
        subcategory: 'casual',
        images: ['/images/products/vestido-floral.jpg'],
        srcUrl: '/images/products/vestido-floral.jpg',
        storeId: storeRef.id,
        stock: 25,
        active: true,
        discount: {
          amount: 0,
          percentage: 0
        },
        promos: [],
        featuredBrand: true,
        freeShipping: false,
        newArrival: true,
        specialOffer: false,
        rating: 4.5,
        sales: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Blusa de Encaje',
        title: 'Blusa Elegante de Encaje',
        description: 'Blusa elegante con detalles de encaje, ideal para ocasiones especiales',
        price: 3599, // Precio en centavos
        category: 'blusas',
        subcategory: 'elegante',
        images: ['/images/products/blusa-encaje.jpg'],
        srcUrl: '/images/products/blusa-encaje.jpg',
        storeId: storeRef.id,
        stock: 30,
        active: true,
        discount: {
          amount: 0,
          percentage: 0
        },
        promos: [],
        featuredBrand: false,
        freeShipping: false,
        newArrival: true,
        specialOffer: false,
        rating: 4.3,
        sales: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        name: 'Falda Plisada',
        title: 'Falda Plisada Midi',
        description: 'Falda plisada midi, perfecta para el día a día, con bolsillos laterales',
        price: 3999, // Precio en centavos
        category: 'faldas',
        subcategory: 'midi',
        images: ['/images/products/falda-plisada.jpg'],
        srcUrl: '/images/products/falda-plisada.jpg',
        storeId: storeRef.id,
        stock: 20,
        active: true,
        discount: {
          amount: 0,
          percentage: 0
        },
        promos: [],
        featuredBrand: false,
        freeShipping: false,
        newArrival: true,
        specialOffer: false,
        rating: 4.4,
        sales: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Agregar productos
    for (const product of products) {
      console.log('Creando producto:', product.name);
      const productRef = await addDoc(collection(db, 'products'), product);
      console.log('Producto creado con ID:', productRef.id);
    }

    console.log('Proceso completado exitosamente');
  } catch (error) {
    console.error('Error detallado:', error);
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    if (error.message) {
      console.error('Mensaje de error:', error.message);
    }
  }
}

createStoreAndProducts(); 