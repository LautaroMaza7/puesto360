"use client";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase'
import Link from "next/link";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProductImage } from '@/components/ui/ProductImage'

// Define a type for the order item
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  srcUrl?: string;
}

// Define a type for the order
interface Order {
  id: string;
  orderId: string;
  status: string;
  total: number;
  createdAt: any;
  items: OrderItem[];
  deliveryInfo?: {
    address: string;
    city: string;
    postalCode: string;
    deliveryMethod: string;
  };
  paymentId?: string;
  collectionId?: string;
  paymentStatus?: string;
  updatedAt?: Date;
}

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        const ordersRef = collection(db, "orders");
        // Simplificamos la consulta para evitar el error del índice
        const q = query(ordersRef, where("userId", "==", user.email));
        
        const querySnapshot = await getDocs(q);
        const ordersData: Order[] = [];
        
        querySnapshot.forEach((doc) => {
          // ordersData.push({ id: doc.id, ...doc.data() } as Order);
          const orderData = { id: doc.id, ...doc.data() } as Order;
          // Solo incluimos órdenes con estado "success" (completadas)
          if (orderData.status === "success") {
            ordersData.push(orderData);
          }
        });
        
        // Ordenamos los pedidos por fecha de creación en el cliente
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
        });
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error al obtener los pedidos:", error);
        setError("Ocurrió un error al cargar tus pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="mb-6">Debes iniciar sesión para ver tus pedidos.</p>
        <Link
          href="/"
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error}</p>
        <Link
          href="/"
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Mis Pedidos
        </motion.h1>
        
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-10 rounded-xl shadow-lg text-center"
          >
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6 text-lg">No tienes pedidos aún.</p>
            <Link
              href="/shop"
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition inline-block transform hover:scale-105 duration-300"
            >
              Ir a la tienda
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Pedido #{order.orderId}</h2>
                    <p className="text-sm text-gray-500">
                      {order.createdAt?.toDate ? 
                        new Date(order.createdAt.toDate()).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'Fecha no disponible'
                      }
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {order.status === "success" ? (
                      <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full">
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        <span>Completado</span>
                      </div>
                    ) : order.status === "pending" ? (
                      <div className="flex items-center text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full">
                        <ClockIcon className="h-5 w-5 mr-1" />
                        <span>Pendiente</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-full">
                        <XCircleIcon className="h-5 w-5 mr-1" />
                        <span>Fallido</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Productos</h3>
                  <div className="space-y-2">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center">
                          <ProductImage
                            src={item.image || item.srcUrl || "/images/placeholder.png"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x ${item.price}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No hay productos en este pedido</p>
                    )}
                    {order.items && order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 2} productos más
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold">${order.total}</p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 