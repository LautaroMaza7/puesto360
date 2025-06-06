"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreateStoreForm from "@/components/store/CreateStoreForm";
import { toast } from "sonner";

export default function NewStorePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log("Estado completo de autenticación:", {
      isLoaded,
      isSignedIn,
      userId: user?.id,
      email: user?.primaryEmailAddress?.emailAddress
    });

    if (isLoaded && !isSignedIn) {
      console.log("Usuario no autenticado, redirigiendo a sign-in");
      const currentPath = window.location.pathname;
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crear nueva tienda</h1>
      <CreateStoreForm />
    </div>
  );
} 