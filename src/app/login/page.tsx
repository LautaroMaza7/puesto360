"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // El manejo del inicio de sesión ahora lo hace Clerk automáticamente
      toast.success("Inicio de sesión exitoso");
      router.push("/account");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-500 mt-2">
            Ingresa a tu cuenta para ver tus pedidos y más
          </p>
        </div>

        <SignInButton mode="modal">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Iniciar Sesión
          </Button>
        </SignInButton>

        <div className="text-center text-sm">
          <a href="/register" className="text-black hover:underline">
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </Card>
    </main>
  );
} 