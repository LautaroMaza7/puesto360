"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const router = useRouter();

  return (
    <div className="relative bg-gray-900 text-white">
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Hero background"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 py-24 sm:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Tu plataforma de comercio electrónico
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Crea tu tienda online, vende tus productos y llega a más clientes.
            Únete a nuestra comunidad de vendedores y compradores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/store/new")}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Crear mi tienda
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/shop")}
              className="border-white text-white hover:bg-white/10"
            >
              Explorar tiendas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 