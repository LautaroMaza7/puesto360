"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/types/order";
import OrderCard from "@/components/orders/OrderCard";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  const { isSignedIn, user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) {
        setLoading(false);
        return;
      }

      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.primaryEmailAddress.emailAddress),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error al cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isSignedIn, user]);

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>
        <p>Por favor inicia sesión para ver tus pedidos.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Mis Pedidos</h1>
      {orders.length === 0 ? (
        <p>No tienes pedidos aún.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
} 