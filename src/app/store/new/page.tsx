"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreateStoreForm from "@/components/store/CreateStoreForm";
import { getStoreByOwnerId } from "@/services/storeService";

export default function NewStorePage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    const checkExistingStore = async () => {
      if (isAuthenticated && user?.sub) {
        const existingStore = await getStoreByOwnerId(user.sub);
        if (existingStore) {
          router.push(`/store/${existingStore.id}`);
        }
      }
    };

    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/api/auth/login");
      } else {
        checkExistingStore();
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Crear nueva tienda</h1>
        <CreateStoreForm />
      </div>
    </div>
  );
} 