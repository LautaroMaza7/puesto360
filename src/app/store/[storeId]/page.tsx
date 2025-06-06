"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Store } from "@/types/store";
import { Product } from "@/types/product";
import { getStoreById } from "@/services/storeService";
import { getProductsByStore } from "@/services/productService";
import ProductGrid from "@/components/shop-page/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function StorePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        if (typeof storeId === "string") {
          const storeData = await getStoreById(storeId);
          if (storeData) {
            setStore(storeData);
            const storeProducts = await getProductsByStore(storeId);
            setProducts(storeProducts);
          }
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Tienda no encontrada</h1>
          <p>La tienda que estás buscando no existe o ha sido eliminada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner de la tienda */}
        <div className="relative h-48 mb-8 rounded-lg overflow-hidden">
          {store.banner ? (
            <img
              src={store.banner}
              alt={`Banner de ${store.name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center space-x-4">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={`Logo de ${store.name}`}
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{store.name}</h1>
                <p className="text-white/80">{store.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la tienda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Sobre la tienda</h2>
            <p className="text-gray-600 mb-4">{store.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Contacto</h3>
                <p className="text-gray-600">{store.contactInfo.email}</p>
                {store.contactInfo.phone && (
                  <p className="text-gray-600">{store.contactInfo.phone}</p>
                )}
              </div>
              
              {store.contactInfo.socialMedia && (
                <div>
                  <h3 className="font-medium mb-2">Redes sociales</h3>
                  <div className="space-y-1">
                    {store.contactInfo.socialMedia.facebook && (
                      <a
                        href={store.contactInfo.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        Facebook
                      </a>
                    )}
                    {store.contactInfo.socialMedia.instagram && (
                      <a
                        href={store.contactInfo.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:underline block"
                      >
                        Instagram
                      </a>
                    )}
                    {store.contactInfo.socialMedia.twitter && (
                      <a
                        href={store.contactInfo.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline block"
                      >
                        Twitter
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4">Estadísticas de la tienda</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Productos</p>
                  <p className="text-2xl font-semibold">{store.totalProducts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ventas totales</p>
                  <p className="text-2xl font-semibold">{store.totalSales}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Calificación</p>
                  <div className="flex items-center">
                    <span className="text-2xl font-semibold">{store.rating}</span>
                    <span className="text-yellow-400 ml-2">★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos de la tienda */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Productos</h2>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="text-center text-gray-500 py-8">
              Esta tienda aún no tiene productos publicados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 