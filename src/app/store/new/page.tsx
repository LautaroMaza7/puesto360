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
    if (!isSignedIn) {
      toast.error("Debes iniciar sesión para crear una tienda");
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

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