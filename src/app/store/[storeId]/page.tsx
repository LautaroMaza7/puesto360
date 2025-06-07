"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Store } from "@/types/store";
import { Product } from "@/types/product";
import { getStoreById } from "@/services/storeService";
import { getProductsByStore } from "@/services/productService";
import ProductGrid from "@/components/shop-page/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, CalendarIcon } from "@heroicons/react/24/outline";

export default function StorePage() {
  const { storeId } = useParams();
  const router = useRouter();
  const { user } = useUser();
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

  const isOwner = user?.id === store?.ownerId;

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
            <div className="flex items-center justify-between">
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
              {isOwner && (
                <Button
                  onClick={() => router.push(`/admin/${storeId}`)}
                  className="bg-white text-black hover:bg-gray-100"
                >
                  Ir al Panel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Información de la tienda */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Sobre la tienda</h2>
            <p className="text-gray-600 mb-6">{store.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-4">Información de contacto</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-gray-900">{store.address}</p>
                      <p className="text-gray-900">{store.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-gray-900">{store.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{store.contactInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-4">Información de la tienda</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Creada el</p>
                      <p className="text-gray-900">
                        {format(store.createdAt.toDate(), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className="text-gray-900 capitalize">{store.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-4">Estadísticas</h3>
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