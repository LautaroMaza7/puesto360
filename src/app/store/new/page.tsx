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

    // Solo redirigir si Clerk ha terminado de cargar y el usuario no está autenticado
    if (isLoaded && !isSignedIn) {
      console.log("Redirigiendo a sign-in porque el usuario no está autenticado");
      router.replace("/sign-in?redirect_url=/store/new");
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Mostrar un estado de carga mientras se verifica la autenticación
  if (!isLoaded) {
    console.log("Cargando estado de autenticación...");
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

  // Si no está autenticado, mostrar un mensaje de error
  if (!isSignedIn) {
    console.log("Usuario no autenticado, mostrando mensaje de error");
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de autenticación</h1>
          <p className="mb-4">No se pudo verificar tu sesión. Por favor, intenta iniciar sesión nuevamente.</p>
          <button
            onClick={() => router.replace("/sign-in?redirect_url=/store/new")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar el formulario
  console.log("Usuario autenticado, mostrando formulario de creación de tienda");
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crear nueva tienda</h1>
      <CreateStoreForm />
    </div>
  );
} 