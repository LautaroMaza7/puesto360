"use client";

import BreadcrumbCart from "@/components/cart-page/BreadcrumbCart";
import ProductCard from "@/components/cart-page/ProductCard";
import { Button } from "@/components/ui/button";
import InputGroup from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { satoshi } from "@/styles/fonts";
import { FaArrowRight, FaTrash } from "react-icons/fa6";
import { MdOutlineLocalOffer } from "react-icons/md";
import { TbBasketExclamation } from "react-icons/tb";
import React, { useState, useEffect } from "react";
import { useCart } from "@/lib/hooks/useCart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, error } = useCart();
  const { isSignedIn, user } = useUser();
  const [showAllItems, setShowAllItems] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log('Estado de autenticación:', {
      isSignedIn,
      userEmail: user?.primaryEmailAddress?.emailAddress
    });
  }, [isSignedIn, user]);

  useEffect(() => {
    console.log('Estado del carrito:', {
      loading,
      error,
      cartItems: cart?.items,
      cartSource: isSignedIn ? 'Firestore' : 'Local Storage',
      totalItems: cart?.items?.length || 0
    });
  }, [cart, loading, error, isSignedIn]);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const totalPrice = cart?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;
  const adjustedTotalPrice = cart?.adjustedTotalPrice ?? totalPrice;

  // Calcular el total de descuentos
  const calculateDiscounts = () => {
    if (!cart?.items) return { promoDiscounts: 0, normalDiscounts: 0 };

    return cart.items.reduce((acc, item) => {
      const originalPrice = item.price * item.quantity;
      let promoDiscount = 0;
      let normalDiscount = 0;

      if (item.activePromo) {
        promoDiscount = originalPrice - item.totalPrice;
      } else if (item.discount?.percentage > 0) {
        normalDiscount = originalPrice - item.totalPrice;
      }

      return {
        promoDiscounts: acc.promoDiscounts + promoDiscount,
        normalDiscounts: acc.normalDiscounts + normalDiscount
      };
    }, { promoDiscounts: 0, normalDiscounts: 0 });
  };

  const { promoDiscounts, normalDiscounts } = calculateDiscounts();
  const totalDiscounts = promoDiscounts + normalDiscounts;
  const finalTotal = totalPrice - totalDiscounts;

  // Determinar qué productos mostrar según el dispositivo
  const displayedItems =
    isMobile && !showAllItems && cart?.items?.length > 3
      ? cart?.items?.slice(0, 3) || []
      : cart?.items || [];

  const hasMoreItems = isMobile && cart?.items && cart.items.length > 3;

  // Función para formatear moneda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!loading && (!cart || cart.items.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center flex-col text-gray-300 mt-32"
      >
        <TbBasketExclamation strokeWidth={1} className="text-6xl mb-4" />
        <span className="block mb-4 text-lg">
          No hay productos en el carrito.
        </span>
        <Button className="rounded-full px-8" asChild>
          <Link href="/shop">Comprar</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <main className="pb-20">
      <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BreadcrumbCart />
          <h2 className={cn([satoshi.className, "text-2xl font-bold text-center mb-8"])}>
            Tu Carrito
          </h2>
          <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start">
            <motion.div
              className="w-full p-4 md:p-5 flex-col space-y-4 rounded-xl border border-black/10 bg-white shadow-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {displayedItems.map((product, idx, arr) => {
                  const productData = {
                    ...product,
                    id: product.id ?? product.productId ?? idx.toString(),
                    name: product.name ?? "Producto sin nombre",
                    price: product.price ?? 0,
                    quantity: product.quantity ?? 1,
                    totalPrice: product.totalPrice ?? 0,
                    srcUrl: product.image || product.srcUrl || PLACEHOLDER_IMAGE,
                    image: product.image || product.srcUrl || PLACEHOLDER_IMAGE,
                    discount: product.discount ?? {
                      percentage: 0,
                      amount: 0,
                    },
                    slug: product.slug ?? "",
                    productId: product.productId ?? "",
                    activePromo: product.activePromo
                  };

                  return (
                    <motion.div
                      key={productData.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard data={productData} />
                      {arr.length - 1 !== idx && (
                        <hr className="border-t-black/10 my-4" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isMobile && !showAllItems && hasMoreItems && (
                <motion.div
                  className="flex justify-center pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    onClick={() => setShowAllItems(true)}
                    variant="ghost"
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Ver {cart.items.length - 3}{" "}
                    {cart.items.length - 3 === 1
                      ? "producto más"
                      : "productos más"}
                  </Button>
                </motion.div>
              )}

              {isMobile && showAllItems && hasMoreItems && (
                <motion.div
                  className="flex justify-center pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    onClick={() => setShowAllItems(false)}
                    variant="ghost"
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Mostrar menos
                  </Button>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="w-full lg:max-w-[400px] p-5 flex-col space-y-4 rounded-xl border border-black/10 bg-white shadow-sm sticky top-4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h6 className="text-lg font-semibold text-gray-900">
                Resumen del Pedido ({cart.items.length}{" "}
                {cart.items.length === 1 ? "producto" : "productos"})
              </h6>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium">
                    ${formatCurrency(totalPrice)}
                  </span>
                </div>
                {promoDiscounts > 0 && (
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-sm text-gray-600">
                      Descuentos por promociones
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      -${formatCurrency(promoDiscounts)}
                    </span>
                  </motion.div>
                )}
                {normalDiscounts > 0 && (
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-sm text-gray-600">
                      Descuentos por productos
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      -${formatCurrency(normalDiscounts)}
                    </span>
                  </motion.div>
                )}
                {(promoDiscounts > 0 || normalDiscounts > 0) && (
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-sm text-gray-600">
                      Total descuentos
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      -${formatCurrency(totalDiscounts)}
                    </span>
                  </motion.div>
                )}
                <hr className="border-t-black/10" />
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-semibold">
                    ${formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <InputGroup className="bg-gray-50">
                  <InputGroup.Text>
                    <MdOutlineLocalOffer className="text-gray-400 text-lg" />
                  </InputGroup.Text>
                  <InputGroup.Input
                    type="text"
                    name="code"
                    placeholder={
                      loading ? "Cargando..." : "Agregar código promocional"
                    }
                    className="bg-transparent placeholder:text-gray-400 text-sm"
                  />
                </InputGroup>
                <Button
                  type="button"
                  className="bg-black rounded-full w-full max-w-[100px] h-10 text-sm hover:bg-gray-800 transition-all"
                >
                  Aplicar
                </Button>
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (!isSignedIn) {
                    router.push("/sign-in");
                    return;
                  }
                  localStorage.setItem("checkout_cart", JSON.stringify(cart.items));
                  router.push("/checkout");
                }}
                className="text-sm font-medium bg-black rounded-full w-full h-12 group shadow-lg hover:bg-gray-800 transition-all"
              >
                {isSignedIn ? "Ir a Pagar" : "Iniciar Sesión para Pagar"}
                <FaArrowRight className="text-base ml-2 group-hover:translate-x-1 transition-all" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
