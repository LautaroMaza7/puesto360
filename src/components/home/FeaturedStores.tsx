"use client";

import { useEffect, useState } from "react";
import { Store } from "@/types/store";
import { getTopStores } from "@/services/storeService";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const topStores = await getTopStores(4);
        setStores(topStores);
      } catch (error) {
        console.error("Error fetching top stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stores.map((store) => (
        <Link
          key={store.id}
          href={`/store/${store.id}`}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative h-48">
            {store.banner ? (
              <img
                src={store.banner}
                alt={`Banner de ${store.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
            {store.logo && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <img
                  src={store.logo}
                  alt={`Logo de ${store.name}`}
                  className="w-16 h-16 rounded-full border-2 border-white"
                />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{store.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {store.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-1">★</span>
                <span>{store.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">
                {store.totalProducts} productos
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 