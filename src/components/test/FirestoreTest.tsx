"use client"

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FirestoreTest() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Intentamos leer la colección de productos
        const productsRef = collection(db, "products");
        await getDocs(productsRef);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prueba de Conexión a Firestore</h2>
      <div className="space-y-2">
        <p>Estado: {
          status === "loading" ? "🔄 Cargando..." :
          status === "success" ? "✅ Conectado" :
          "❌ Error"
        }</p>
        {error && (
          <p className="text-red-500">Error: {error}</p>
        )}
      </div>
    </div>
  );
} 