"use client";

import { Order } from "@/types/order";
import Link from "next/link";
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { ProductImage } from "@/components/ui/ProductImage";
import { motion } from "framer-motion";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
  );
} 