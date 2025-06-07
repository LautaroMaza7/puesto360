"use client";

import React, { useMemo, useState } from "react";
import { PiTrashFill } from "react-icons/pi";
import Image from "next/image";
import Link from "next/link";
import CartCounter from "@/components/ui/CartCounter";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/lib/features/carts/cartsSlice";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "../../components/ui/badge";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type ProductCardProps = {
  data: CartItem & { 
    totalPrice?: number;
    activePromo?: {
      cantidad: number;
      descuento: number;
      precioFinal: number;
    };
  };
};

const ProductCard = ({ data }: ProductCardProps) => {
  const { user, isSignedIn } = useUser();

  const priceDetails = useMemo(() => {
    const totalPrice = data.totalPrice || data.quantity * data.price;
    const savings = data.activePromo 
      ? Math.round(
          (data.price * data.activePromo.cantidad) - 
          (data.activePromo.precioFinal - (Math.max(0, data.quantity - data.activePromo.cantidad) * data.price))
        )
      : 0;
    
    return {
      totalPrice,
      savings,
      promoQuantity: data.activePromo?.cantidad || 0,
      extraQuantity: Math.max(0, data.quantity - (data.activePromo?.cantidad || 0)),
      promoPrice: data.activePromo?.precioFinal || 0,
      normalPrice: data.price,
      originalTotal: data.quantity * data.price
    };
  }, [data]);

  // Log all item data
  console.log("📦 Datos completos del item:", {
    id: data.id,
    name: data.name,
    price: data.price,
    quantity: data.quantity,
    totalPrice: data.totalPrice || data.quantity * data.price,
    srcUrl: data.srcUrl,
    discount: data.discount,
    rawData: data // todos los datos sin procesar
  });

  const updateCart = async (updatedItem: CartItem, action: "add" | "remove" | "delete") => {
    if (!isSignedIn || !user?.id) {
      updateLocalCart(updatedItem, action);
      return;
    }

    // Obtener el email del usuario desde Firestore
    const userDocRef = doc(db, "users", user.id);
    const userSnap = await getDoc(userDocRef);
    
    if (!userSnap.exists()) {
      console.error('Usuario no encontrado en Firestore');
      return;
    }

    const userData = userSnap.data();
    const userEmail = userData.email;
    const cartRef = doc(db, "carts", userEmail);
    const cartSnap = await getDoc(cartRef);
    if (!cartSnap.exists()) return;

    const currentCart = cartSnap.data();
    let updatedItems: CartItem[] = [...currentCart.items];
    const index = updatedItems.findIndex((item) => item.id === updatedItem.id);

    if (index !== -1) {
      if (action === "add") {
        updatedItems[index].quantity += 1;
      } else if (action === "remove") {
        if (updatedItems[index].quantity === 1) {
          updatedItems.splice(index, 1);
        } else {
          updatedItems[index].quantity -= 1;
        }
      } else if (action === "delete") {
        updatedItems.splice(index, 1);
      }
    }

    updatedItems = updatedItems.map((item) => ({
      ...item,
      totalPrice: item.activePromo ? item.activePromo.precioFinal : item.quantity * item.price,
    }));

    await setDoc(cartRef, {
      ...currentCart,
      items: updatedItems,
    });
  };

  const updateLocalCart = (updatedItem: CartItem, action: "add" | "remove" | "delete") => {
    try {
      const cartData = localStorage.getItem("cart");
      let items: CartItem[] = cartData ? JSON.parse(cartData) : [];

      const index = items.findIndex((item) => item.id === updatedItem.id);

      if (index !== -1) {
        if (action === "add") {
          items[index].quantity += 1;
        } else if (action === "remove") {
          if (items[index].quantity === 1) {
            items.splice(index, 1);
          } else {
            items[index].quantity -= 1;
          }
        } else if (action === "delete") {
          items.splice(index, 1);
        }

        // Recalcular totalPrice
        items = items.map((item) => ({
          ...item,
          totalPrice: item.activePromo ? item.activePromo.precioFinal : item.quantity * item.price,
        }));

        localStorage.setItem("cart", JSON.stringify(items));
        window.dispatchEvent(new Event("cartUpdate"));
      }
    } catch (error) {
      console.error("Error actualizando carrito local:", error);
    }
  };

  return (
    <motion.div 
      className="flex items-start space-x-3 md:space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/shop/product/${data.id}/${data.name.split(" ").join("-")}`}
        className="bg-[#F0EEED] rounded-lg w-full min-w-[80px] max-w-[80px] sm:min-w-[90px] sm:max-w-[90px] md:min-w-[100px] md:max-w-[100px] lg:min-w-[110px] lg:max-w-[110px] aspect-square overflow-hidden"
      >
        <Image
          src={data.srcUrl}
          width={110}
          height={110}
          className="rounded-md w-full h-full object-cover hover:scale-110 transition-all duration-500"
          alt={data.name}
          priority
        />
      </Link>
      <div className="flex w-full self-stretch flex-col">
        <div className="flex items-center justify-between">
          <Link
            href={`/shop/product/${data.id}/${data.name.split(" ").join("-")}`}
            className="text-black font-bold text-sm sm:text-base md:text-lg xl:text-xl line-clamp-2 hover:text-gray-700 transition-colors"
          >
            {data.name}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 md:h-7 md:w-7 hover:bg-red-50 transition-colors"
            onClick={() => updateCart(data, "delete")}
          >
            <PiTrashFill className="text-lg md:text-xl text-red-600" />
          </Button>
        </div>

        <div className="flex flex-col space-y-2 mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-[5px] xl:space-x-2.5 cursor-help">
                  <span className="font-bold text-black text-base sm:text-lg md:text-xl xl:text-2xl">
                    ${Math.round(priceDetails.totalPrice)}
                  </span>
                  {data.activePromo && (
                    <div className="text-sm text-green-600 font-medium">
                      {data.activePromo.cantidad}x -{data.activePromo.descuento}%
                    </div>
                  )}
                  {data.discount?.percentage > 0 && !data.activePromo && (
                    <span className="font-medium text-[8px] sm:text-[9px] md:text-[10px] xl:text-xs py-1 px-2 md:py-1.5 md:px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]">
                      -{data.discount.percentage}%
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-white p-3 shadow-lg rounded-lg border">
                <div className="space-y-1 text-sm">
                  {data.activePromo && (
                    <>
                      <p className="font-medium">Desglose del precio:</p>
                      <p>{priceDetails.promoQuantity}x unidades con promoción: ${priceDetails.promoPrice}</p>
                      {priceDetails.extraQuantity > 0 && (
                        <p>{priceDetails.extraQuantity}x unidades al precio normal: ${priceDetails.extraQuantity * priceDetails.normalPrice}</p>
                      )}
                      <p className="text-gray-500 line-through">Precio original: ${priceDetails.originalTotal}</p>
                    </>
                  )}
                  {data.discount?.percentage > 0 && !data.activePromo && (
                    <>
                      <p className="font-medium">Desglose del precio:</p>
                      <p className="text-gray-500 line-through">Precio original: ${priceDetails.originalTotal}</p>
                      <p>Descuento: -{data.discount.percentage}%</p>
                    </>
                  )}
                  <p className="font-medium text-green-600">Total: ${Math.round(priceDetails.totalPrice)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AnimatePresence>
            {(data.activePromo || data.discount?.percentage > 0) && priceDetails.savings > 0 && (
              <motion.div 
                className="text-sm text-green-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                Ahorras ${priceDetails.savings}
              </motion.div>
            )}
          </AnimatePresence>

          <CartCounter
            initialValue={data.quantity}
            onAdd={() => updateCart(data, "add")}
            onRemove={() => updateCart(data, "remove")}
            isZeroDelete
            className="px-3 py-2 md:px-4 md:py-2.5 max-h-7 md:max-h-8 min-w-[90px] max-w-[90px] sm:min-w-[100px] sm:max-w-[100px] md:min-w-[105px] md:max-w-[105px]"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
