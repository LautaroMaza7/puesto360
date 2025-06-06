"use client";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase'
import Link from "next/link";
import { CheckCircleIcon, ClockIcon, XCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
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
  userId: string;
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !user?.email) {
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, "orders", params.id);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          
          // Verify that the order belongs to the current user
          if (orderData.userId !== user.email) {
            setError("No tienes permiso para ver este pedido");
            setLoading(false);
            return;
          }
          
          setOrder(orderData);
        } else {
          setError("Pedido no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el pedido:", error);
        setError("Ocurrió un error al cargar el pedido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isAuthenticated, user, params.id]);

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

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error || "No pudimos encontrar el pedido solicitado."}</p>
        <Link
          href="/orders"
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
        >
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/orders"
            className="inline-flex items-center text-black hover:text-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a mis pedidos
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Pedido #{order.orderId}</h1>
              <p className="text-sm text-gray-500">
                {order.createdAt?.toDate ? 
                  new Date(order.createdAt.toDate()).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
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
          
          {/* Productos del pedido */}
          <div className="mb-8">
            <h2 className="font-medium text-xl mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="relative w-20 h-20 rounded-md overflow-hidden mr-4">
                      <ProductImage
                        src={item.image || item.srcUrl || "/images/placeholder.png"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ${item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${item.totalPrice}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 italic">No hay productos en este pedido</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="font-medium text-xl mb-3">Información de entrega</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm mb-2">
                  <span className="font-medium">Dirección:</span> {order.deliveryInfo?.address}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">Ciudad:</span> {order.deliveryInfo?.city}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">Código Postal:</span> {order.deliveryInfo?.postalCode}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Método:</span> {order.deliveryInfo?.deliveryMethod}
                </p>
              </div>
            </div>
            <div>
              <h2 className="font-medium text-xl mb-3">Detalles del pago</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm mb-2">
                  <span className="font-medium">Total:</span> ${order.total}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-medium">Estado del pago:</span> {order.paymentStatus || 'No disponible'}
                </p>
                {order.paymentId && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">ID de pago:</span> {order.paymentId}
                  </p>
                )}
                {order.collectionId && (
                  <p className="text-sm">
                    <span className="font-medium">ID de cobro:</span> {order.collectionId}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Última actualización:</p>
                <p className="font-medium">
                  {order.updatedAt ? 
                    new Date(order.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 
                    'No disponible'
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total del pedido</p>
                <p className="text-2xl font-bold">${order.total}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 