"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { doc, deleteDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  TruckIcon,
  DocumentTextIcon,
  HomeIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  total: number;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    dni: string;
  };
  deliveryInfo: {
    address: string;
    city: string;
    postalCode: string;
    deliveryMethod: string;
  };
  status: string;
  createdAt: any;
}

const SuccessPage = () => {
  const { isSignedIn, user } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFade, setShowFade] = useState(true);
  const [orderUpdated, setOrderUpdated] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return; // 🔒 Seguridad contra null

    const externalReference = searchParams.get("external_reference");
    if (!externalReference) {
      console.error("No se encontró referencia de la orden");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", externalReference);
        const orderDoc = await getDoc(orderRef);

        if (orderDoc.exists()) {
          const orderData = orderDoc.data() as Order;
          setOrder(orderData);

          if (!orderUpdated && orderData.status !== "success") {
            await updateOrderStatus(externalReference);
          }
        }
      } catch (error) {
        console.error("Error al obtener la orden:", error);
      } finally {
        setLoading(false);
      }
    };

    const updateOrderStatus = async (orderId: string) => {
      try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          status: "success",
          updatedAt: serverTimestamp(),
          paymentCompletedAt: serverTimestamp(),
        });

        const transactionRef = doc(db, "transactions", orderId);
        await updateDoc(transactionRef, {
          status: "completed",
          completedAt: serverTimestamp(),
        });

        setOrderUpdated(true);
        console.log("Estado de la orden actualizado a success");
      } catch (error) {
        console.error("Error al actualizar el estado de la orden:", error);
      }
    };

    const clearCart = async () => {
      try {
        if (isSignedIn && user) {
          const cartRef = doc(db, "carts", user.id);
          await deleteDoc(cartRef);
        }
        localStorage.removeItem("cart");
        localStorage.removeItem("checkout_cart");
      } catch (error) {
        console.error("Error al limpiar el carrito:", error);
      }
    };

    fetchOrder();
    clearCart();

    const timer = setTimeout(() => {
      setShowFade(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSignedIn, user, searchParams, orderUpdated]);

  const features = [
    {
      icon: TruckIcon,
      title: "Seguimiento de envío",
      description: "Te mantendremos informado sobre el estado de tu pedido",
      action: "Rastrear pedido",
      href: "/orders",
    },
    {
      icon: DocumentTextIcon,
      title: "Detalles del pedido",
      description: "Revisa los detalles completos de tu compra",
      action: "Ver detalles",
      href: "/orders",
    },
    {
      icon: HomeIcon,
      title: "Seguir comprando",
      description: "Explora más productos en nuestra tienda",
      action: "Ir a la tienda",
      href: "/",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        {showFade && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }}
            className="fixed inset-0 bg-green-500 z-50 flex items-center justify-center"
          >
            <CheckCircleIcon className="w-24 h-24 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { delayChildren: 0.3, staggerChildren: 0.2 },
          },
        }}
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">¡Pago exitoso!</h1>
          <p className="text-lg text-gray-600">
            Gracias por tu compra. Tu pedido ha sido procesado correctamente.
          </p>
          {order && (
            <p className="text-sm text-gray-500 mt-2">Número de orden: {order.orderId}</p>
          )}
        </motion.div>

        {order && (
          <motion.div
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBagIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Resumen de tu compra</h2>
            </div>

            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-0">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src={item.image || PLACEHOLDER_IMAGE}
                    alt={item.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${item.price.toFixed(2)} c/u
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Información de envío</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Dirección de entrega:</p>
                  <p className="font-medium text-gray-900">{order.deliveryInfo.address}</p>
                  <p className="font-medium text-gray-900">
                    {order.deliveryInfo.city}, {order.deliveryInfo.postalCode}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Método de envío:</p>
                  <p className="font-medium text-gray-900">{order.deliveryInfo.deliveryMethod}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center">
                <p className="text-base font-semibold text-gray-900">Total</p>
                <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{feature.description}</p>
                  <Link href={feature.href} className="text-green-600 font-medium text-sm hover:underline">
                    {feature.action}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
