"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Store {
  id: string;
  localName: string;
  galleryType: string;
  localNumber: number;
  description: string;
  status: string;
  rating: number;
  totalSales: number;
  totalProducts: number;
}

export default function MisTiendas() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/mis-tiendas");
      return;
    }

    const fetchStores = async () => {
      if (!user?.id) return;

      try {
        const storesQuery = query(
          collection(db, "stores"),
          where("ownerId", "==", user.id)
        );

        const querySnapshot = await getDocs(storesQuery);
        const storesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Store[];

        setStores(storesData);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [isLoaded, isSignedIn, user?.id, router]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Mis Tiendas
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              No tienes tiendas creadas
            </h2>
            <Button
              onClick={() => router.push("/store/new")}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Crear mi primera tienda
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      {store.localName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {store.galleryType} - Local {store.localNumber}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {store.description || "Sin descripción"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-semibold">{store.rating}</p>
                        <p className="text-gray-500">Rating</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-semibold">{store.totalSales}</p>
                        <p className="text-gray-500">Ventas</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="font-semibold">{store.totalProducts}</p>
                        <p className="text-gray-500">Productos</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/admin/${store.id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    >
                      Ir al Panel
                    </Button>
                    <Button
                      onClick={() => router.push(`/store/${store.id}`)}
                      variant="outline"
                      className="flex-1"
                    >
                      Vista
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 