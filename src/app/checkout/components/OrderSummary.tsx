import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TrashIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { satoshi } from "@/styles/fonts";
import { Separator } from "@/components/ui/separator";
import ProductPlaceholder from "./ProductPlaceholder";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { TbBasketExclamation } from "react-icons/tb";
import { PLACEHOLDER_IMAGE } from '@/lib/constants'

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  srcUrl?: string;
  totalPrice: number;
  discount?: {
    percentage: number;
    amount: number;
  };
  activePromo?: {
    cantidad: number;
    descuento: number;
    precioFinal: number;
  };
}

interface OrderSummaryProps {
  products: Product[];
  subtotal: number;
  shipping: number;
  total: number;
  onRemoveItem?: (id: string) => void;
  isLoading?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  products,
  subtotal,
  shipping,
  total,
  onRemoveItem,
  isLoading = false,
}) => {
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es dispositivo móvil y establecer el límite inicial
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    // Ejecutar al montar
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcular el límite de productos a mostrar
  const displayLimit = isMobile ? 1 : 3;

  // Determinar qué productos mostrar
  const displayedProducts = showAllProducts 
    ? products 
    : products.slice(0, displayLimit);
  
  const hasMoreProducts = products.length > displayLimit;

  // Formatear números con separadores de miles y decimales
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Renderizar skeleton loader
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
        <h3
          className={cn([
            satoshi.className,
            "text-3xl font-bold text-center mb-6",
          ])}
        >
          Resumen del Pedido
        </h3>
        
        <div className="space-y-3 mb-6">
          {Array.from({ length: isMobile ? 1 : 3 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <ProductPlaceholder size={isMobile ? "xs" : "sm"} />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen del Pedido
      </h2>

      {/* Lista de productos */}
      <div className="space-y-4 mb-6">
        {displayedProducts.map((product) => (
          <div key={product.id} className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <img
                  src={product.image || product.srcUrl || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  className="object-cover rounded-lg"
                  width={64}
                  height={64}
                />
              </div>
              <div>
                <h4 className="font-medium">{product.name}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${product.totalPrice}</p>
              {(product.activePromo || product.discount) && (
                <p className="text-sm text-gray-400 line-through">
                  ${product.price * product.quantity}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Botón Ver más/Ver menos */}
        {hasMoreProducts && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
              {showAllProducts ? (
                <>
                  Ver menos <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Ver {products.length - displayLimit} {products.length - displayLimit === 1 ? 'producto más' : 'productos más'} <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Resumen de costos */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${formatCurrency(subtotal)}</span>
        </div>
        {products.some(product => product.activePromo || product.discount) && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Descuentos</span>
            <span className="text-green-600">-${formatCurrency(
              products.reduce((acc, product) => {
                if (product.activePromo) {
                  return acc + (product.price * product.quantity - product.activePromo.precioFinal);
                }
                const discount = product.discount || { percentage: 0, amount: 0 };
                if (discount.percentage > 0) {
                  return acc + (product.price * product.quantity * (discount.percentage / 100));
                }
                if (discount.amount > 0) {
                  return acc + (discount.amount * product.quantity);
                }
                return acc;
              }, 0)
            )}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envío</span>
          <span className="text-gray-900">${formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${formatCurrency(total)}</span>
        </div>
      </div>

      {/* Botón Ver más productos */}
      <div className="mt-6">
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <TbBasketExclamation className="w-5 h-5" />
          Ver más productos
        </Link>
      </div>
    </motion.div>
  );
};

export default OrderSummary; 