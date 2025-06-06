"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import AgeVerificationModal from "@/components/common/AgeVerificationModal";
import ProductGrid from "@/components/shop-page/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdult, setIsAdult] = useState<boolean | null>(null);
  const [ageVerificationComplete, setAgeVerificationComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const fetchedProducts = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          let createdAt: Date;
          try {
            createdAt = data.createdAt?.toDate?.() || new Date();
          } catch (error) {
            console.warn('Error al convertir timestamp:', error);
            createdAt = new Date();
          }

          const product: Product = {
            id: doc.id,
              storeId: data.storeId || '',
            title: data.title || '',
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            images: data.images || [],
            srcUrl: data.srcUrl || '',
            category: data.category || '',
            subcategory: data.subcategory || '',
            stock: data.stock || 0,
            discount: {
              amount: data.discount?.amount || 0,
              percentage: data.discount?.percentage || 0
            },
            freeShipping: data.freeShipping ?? false,
            createdAt: createdAt,
            sales: data.sales || 0,
            rating: data.rating || 0,
            active: data.active ?? true,
            specialOffer: data.specialOffer ?? false,
            newArrival: data.newArrival ?? false,
            featuredBrand: data.featuredBrand ?? false,
            promos: data.promos || [],
              updatedAt: data.updatedAt?.toDate?.() || createdAt
          };

          return product;
        })
        .filter((product) => product.active)
        .sort((a, b) => {
          return b.createdAt.getTime() - a.createdAt.getTime();
          });
    
      setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };    

    fetchProducts();
  }, []);

  const handleAgeVerification = (result: boolean) => {
    setIsAdult(result);
    setAgeVerificationComplete(true);
  };

  if (!ageVerificationComplete) {
    return <AgeVerificationModal onVerify={handleAgeVerification} />;
  }

  if (isAdult === false) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-gray-600">
        <div>
          <p className="mb-4">Lo sentimos, debes ser mayor de 18 años para acceder a este contenido.</p>
          <Button
            onClick={() => {
              localStorage.removeItem('isAdult');
              window.location.reload();
            }}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-6"
          >
            Intentar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
  return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Productos Textiles al Por Mayor y Menor
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Encuentra la mejor selección de productos textiles para tu negocio
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => window.location.href = '/shop'}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-full"
            >
              Ver Catálogo
            </Button>
            <Button
              onClick={() => window.location.href = '/contact'}
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg rounded-full"
            >
              Contactar Vendedor
            </Button>
          </div>
        </div>
            </div>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Productos Destacados</h2>
          <ProductGrid products={products.filter(p => p.featuredBrand)} />
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Nuevos Ingresos</h2>
          <ProductGrid products={products.filter(p => p.newArrival)} />
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">Ofertas Especiales</h2>
          <ProductGrid products={products.filter(p => p.specialOffer)} />
        </section>
            </div>
          </main>
  );
}
