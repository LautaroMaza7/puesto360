"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import AgeVerificationModal from "@/components/common/AgeVerificationModal";
import ProductListSec from "@/components/common/ProductListSec";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/homepage/Header";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";

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
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NUEVOS INGRESOS"
          products={products.filter(p => p.newArrival)}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="PRODUCTOS DESTACADOS"
            products={products.filter(p => p.featuredBrand)}
            viewAllLink="/shop#featured"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        {/* <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="OFERTAS ESPECIALES"
            products={products.filter(p => p.specialOffer)}
            viewAllLink="/shop#special-offers"
          />
        </div> */}
      </main>
    </>
  );
}
