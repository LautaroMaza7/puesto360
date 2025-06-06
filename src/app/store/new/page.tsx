"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreateStoreForm from "@/components/store/CreateStoreForm";
import { toast } from "sonner";

export default function NewStorePage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log("Estado de autenticación:", { isSignedIn, user });
    
    if (!isSignedIn) {
      console.log("Usuario no autenticado, redirigiendo a sign-in");
      toast.error("Debes iniciar sesión para crear una tienda");
      router.push("/sign-in");
    } else {
      console.log("Usuario autenticado:", user);
    }
  }, [isSignedIn, router, user]);

  if (!isSignedIn) {
    console.log("Renderizando null porque no hay usuario autenticado");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Crear nueva tienda</h1>
      <CreateStoreForm />
    </div>
  );
} 