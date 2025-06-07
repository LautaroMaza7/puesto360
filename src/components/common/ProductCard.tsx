"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import Rating from "../ui/Rating";
import { useUser } from "@clerk/nextjs";
import { useCart } from "@/lib/hooks/useCart";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import { formatPrice } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from '@/lib/constants'
import { doc, collection, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductCardProps {
  product: Product;
  variant?: "shop" | "carousel";
  showNewBadge?: boolean;
  showDiscountBadge?: boolean;
}

const ProductCard = ({ product, variant = "shop", showNewBadge = false, showDiscountBadge = false }: ProductCardProps) => {
  const { user, isSignedIn } = useUser();
  const { cart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const heightClasses = {
    carousel: 'h-[340px] sm:h-[430px] lg:h-[435px]',
    shop: 'h-[350px] sm:h-[460px] lg:h-[430px]'
  };

  const priceAfterDiscount = product.discount.percentage > 0 
    ? product.price - (product.price * product.discount.percentage / 100)
    : product.discount.amount > 0 
    ? product.price - product.discount.amount 
    : product.price;

  const isNew = showNewBadge && product.newArrival;
  
  const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const productUrl = `/shop/product/${product.id}/${productSlug}`;

  /* hola */

  return (
    <motion.div
      className={`group bg-white rounded-xl shadow-sm hover:shadow-lg p-4 transition-all duration-300 flex flex-col ${heightClasses[variant]}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col h-full">
        {/* Imagen y título */}
        <Link href={productUrl} className="block">
          <div className={`relative ${variant === 'shop' ? 'w-[120px]' : 'w-[180px]'} h-[170px] sm:w-full ${variant === 'shop' ? 'sm:h-[250px]' : 'sm:h-[280px]'} rounded-lg overflow-hidden`}>
            <ProductImage
              src={product.srcUrl || PLACEHOLDER_IMAGE}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-110 transition-all duration-500"
              width={295}
              height={298}
              variant={variant}
            />
            {showDiscountBadge && (product.discount.percentage > 0 || product.discount.amount > 0) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 left-2 bg-red-500 text-white text-xs sm:text-sm font-bold px-2 py-0.5 rounded-full"
              >
                {product.discount.percentage > 0 
                  ? `-${product.discount.percentage}%`
                  : `-${formatPrice(product.discount.amount)}`}
              </motion.div>
            )}
            {isNew && (
              <div className="absolute top-2 right-2 bg-black text-white text-xs font-medium px-2 py-1 rounded">
                NUEVO
              </div>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-medium text-gray-900 mt-10 sm:mt-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Footer con precio y rating */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Rating
                  initialValue={product.rating}
                  readonly
                  size={14}
                  allowFraction
                  SVGclassName="inline-block"
                  emptyClassName="fill-gray-200"
                />
                <span className="text-xs sm:text-sm text-gray-500">{product.rating.toFixed(1)}</span>
              </div>
              <div className="flex flex-col">
                {(product.discount.percentage > 0 || product.discount.amount > 0) && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through mb-0.5">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {formatPrice(priceAfterDiscount)}
                </span>
              </div>
            </div>
            {cart?.items?.find((item) => item.id === product.id) ? (
              <div className="flex items-center bg-gray-50 rounded-full -ml-[35px] -mb-[10px]">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const cartItem = {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: -1,
                      totalPrice: product.price,
                      srcUrl: product.srcUrl,
                      image: product.images?.[0] || product.srcUrl || PLACEHOLDER_IMAGE,
                      discount: product.discount || { percentage: 0, amount: 0 },
                      slug: product.name.split(" ").join("-"),
                      productId: product.id,
                    };

                    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
                      const userId = user.primaryEmailAddress.emailAddress;
                      const cartRef = doc(collection(db, "carts"), userId);
                      getDoc(cartRef).then((snapshot) => {
                        if (snapshot.exists()) {
                          const firestoreCart = snapshot.data();
                          const existingItems = firestoreCart.items || [];
                          const index = existingItems.findIndex((i: any) => i.id === cartItem.id);

                          if (index > -1) {
                            existingItems[index].quantity -= 1;
                            existingItems[index].totalPrice = existingItems[index].quantity * cartItem.price;
                            if (existingItems[index].quantity <= 0) {
                              existingItems.splice(index, 1);
                              toast({
                                title: "¡Producto eliminado del carrito!",
                                description: `${product.name} ha sido eliminado del carrito.`,
                                variant: "destructive"
                              });
                            } else {
                              toast({
                                title: "¡Cantidad actualizada!",
                                description: `Se ha actualizado la cantidad de ${product.name} en el carrito.`,
                                variant: "cart"
                              });
                            }
                          }

                          setDoc(cartRef, { items: existingItems });
                        }
                      });
                    } else {
                      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
                      const index = localCart.findIndex((i: any) => i.id === cartItem.id);

                      if (index > -1) {
                        localCart[index].quantity -= 1;
                        localCart[index].totalPrice = localCart[index].quantity * cartItem.price;
                        if (localCart[index].quantity <= 0) {
                          localCart.splice(index, 1);
                          toast({
                            title: "¡Producto eliminado del carrito!",
                            description: `${product.name} ha sido eliminado del carrito.`,
                            variant: "destructive"
                          });
                        } else {
                          toast({
                            title: "¡Cantidad actualizada!",
                            description: `Se ha actualizado la cantidad de ${product.name} en el carrito.`,
                            variant: "cart"
                          });
                        }
                      }

                      localStorage.setItem("cart", JSON.stringify(localCart));
                      window.dispatchEvent(new Event("cartUpdate"));
                    }
                  }}
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-sm sm:text-base font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                >
                  -
                </Button>
                <span className="text-sm sm:text-base font-medium text-gray-800 w-5 sm:w-6 text-center">
                  {cart.items.find((item) => item.id === product.id)?.quantity || 0}
                </span>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const cartItem = {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      totalPrice: product.price,
                      srcUrl: product.srcUrl,
                      image: product.images?.[0] || product.srcUrl || PLACEHOLDER_IMAGE,
                      discount: product.discount || { percentage: 0, amount: 0 },
                      slug: product.name.split(" ").join("-"),
                      productId: product.id,
                    };

                    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
                      const userId = user.primaryEmailAddress.emailAddress;
                      const cartRef = doc(collection(db, "carts"), userId);
                      getDoc(cartRef).then((snapshot) => {
                        if (snapshot.exists()) {
                          const firestoreCart = snapshot.data();
                          const existingItems = firestoreCart.items || [];
                          const index = existingItems.findIndex((i: any) => i.id === cartItem.id);

                          if (index > -1) {
                            existingItems[index].quantity += 1;
                            existingItems[index].totalPrice = existingItems[index].quantity * cartItem.price;
                            toast({
                              title: "¡Cantidad actualizada!",
                              description: `Se ha actualizado la cantidad de ${product.name} en el carrito.`,
                              variant: "cart"
                            });
                          } else {
                            existingItems.push(cartItem);
                            toast({
                              title: "¡Producto agregado al carrito!",
                              description: `${product.name} ha sido agregado correctamente al carrito.`,
                              variant: "cart"
                            });
                          }

                          setDoc(cartRef, { items: existingItems });
                        } else {
                          setDoc(cartRef, { items: [cartItem] });
                          toast({
                            title: "¡Producto agregado al carrito!",
                            description: `${product.name} ha sido agregado correctamente al carrito.`,
                            variant: "cart"
                          });
                        }
                      });
                    } else {
                      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
                      const index = localCart.findIndex((i: any) => i.id === cartItem.id);

                      if (index > -1) {
                        localCart[index].quantity += 1;
                        localCart[index].totalPrice = localCart[index].quantity * cartItem.price;
                        toast({
                          title: "¡Cantidad actualizada!",
                          description: `Se ha actualizado la cantidad de ${product.name} en el carrito.`,
                          variant: "cart"
                        });
                      } else {
                        localCart.push(cartItem);
                        toast({
                          title: "¡Producto agregado al carrito!",
                          description: `${product.name} ha sido agregado correctamente al carrito.`,
                          variant: "cart"
                        });
                      }

                      localStorage.setItem("cart", JSON.stringify(localCart));
                      window.dispatchEvent(new Event("cartUpdate"));
                    }
                  }}
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-sm sm:text-base font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                >
                  +
                </Button>
              </div>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    totalPrice: product.price,
                    srcUrl: product.srcUrl,
                    image: product.images?.[0] || product.srcUrl || PLACEHOLDER_IMAGE,
                    discount: product.discount || { percentage: 0, amount: 0 },
                    slug: product.name.split(" ").join("-"),
                    productId: product.id,
                  };

                  if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
                    const userId = user.primaryEmailAddress.emailAddress;
                    const cartRef = doc(collection(db, "carts"), userId);
                    getDoc(cartRef).then((snapshot) => {
                      if (snapshot.exists()) {
                        const firestoreCart = snapshot.data();
                        const existingItems = firestoreCart.items || [];
                        const index = existingItems.findIndex((i: any) => i.id === cartItem.id);

                        if (index > -1) {
                          existingItems[index].quantity += 1;
                          existingItems[index].totalPrice = existingItems[index].quantity * cartItem.price;
                          toast({
                            title: "¡Cantidad actualizada!",
                            description: `Se ha actualizado la cantidad de ${product.name} en el carrito.`,
                            variant: "cart"
                          });
                        } else {
                          existingItems.push(cartItem);
                          toast({
                            title: "¡Producto agregado al carrito!",
                            description: `${product.name} ha sido agregado correctamente al carrito.`,
                            variant: "cart"
                          });
                        }

                        setDoc(cartRef, { items: existingItems });
                      } else {
                        setDoc(cartRef, { items: [cartItem] });
                        toast({
                          title: "¡Producto agregado al carrito!",
                          description: `${product.name} ha sido agregado correctamente al carrito.`,
                          variant: "cart"
                        });
                      }
                    });
                  } else {
                    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
                    const index = localCart.findIndex((i: any) => i.id === cartItem.id);

                    if (index > -1) {
                      localCart[index].quantity += 1;
                      localCart[index].totalPrice = localCart[index].quantity * cartItem.price;
                      toast({
                        title: "¡Cantidad actualizada!",
                        description: `Se ha actualizado la cantidad de ${product.name} en el carrito.`,
                        variant: "cart"
                      });
                    } else {
                      localCart.push(cartItem);
                      toast({
                        title: "¡Producto agregado al carrito!",
                        description: `${product.name} ha sido agregado correctamente al carrito.`,
                        variant: "cart"
                      });
                    }

                    localStorage.setItem("cart", JSON.stringify(localCart));
                    window.dispatchEvent(new Event("cartUpdate"));
                  }
                }}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-sm sm:text-base font-medium rounded-full bg-black text-white hover:bg-gray-800 transition-all"
              >
                +
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
