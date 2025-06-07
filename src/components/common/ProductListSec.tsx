"use client";

import React, { useEffect, useState } from "react";
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { satoshi, integralCF } from "@/styles/fonts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface ProductListSecProps {
  title: string;
  products: Product[];
  viewAllLink: string;
}

export default function ProductListSec({ title, products, viewAllLink }: ProductListSecProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Mover cada 5 segundos

    return () => clearInterval(interval);
  }, [api]);

  // Función para obtener el timestamp de una fecha
  const getTimestamp = (date: any): number => {
    if (!date) return 0;

    // Si es un Timestamp de Firebase
    if (date.seconds) {
      return date.seconds * 1000; // Convertir a milisegundos
    }

    // Si es un string de fecha
    if (typeof date === 'string') {
      try {
        const months: { [key: string]: number } = {
          'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
          'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };

        const [datePart, timePart] = date.split(', ');
        const [day, month, year] = datePart.split(' de ');
        const [time, period] = timePart.split(' ');
        const [hours, minutes, seconds] = time.split(':');

        let hour = parseInt(hours);
        if (period.toLowerCase() === 'p.m.' && hour !== 12) {
          hour += 12;
        } else if (period.toLowerCase() === 'a.m.' && hour === 12) {
          hour = 0;
        }

        return new Date(
          parseInt(year),
          months[month.toLowerCase()],
          parseInt(day),
          hour,
          parseInt(minutes),
          parseInt(seconds)
        ).getTime();
      } catch (error) {
        console.error('Error al parsear fecha:', date);
        return 0;
      }
    }

    return 0;
  };

  // Filtrar solo productos activos y ordenar por fecha de creación
  const activeProducts = products
    .filter(product => product.active === true)
    .sort((a, b) => {
      const timestampA = getTimestamp(a.createdAt);
      const timestampB = getTimestamp(b.createdAt);
      return timestampB - timestampA; // Orden descendente (más reciente primero)
    });

  return (
    <section className="max-w-frame mx-auto text-center">
      <motion.h2
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn([
          integralCF.className,
          "text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12",
        ])}
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ y: "100px", opacity: 0 }}
        whileInView={{ y: "0", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            containScroll: "trimSnaps",
          }}
          className="w-full mb-6 md:mb-9 relative"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              <CarouselPrevious 
                variant="ghost" 
                className="pointer-events-auto hidden md:flex text-2xl hover:bg-black/5 absolute -left-12 top-1/2 -translate-y-1/2 md:-left-16 lg:-left-20 z-0 !bg-white/80 hover:!bg-white"
              >
                <FaArrowLeft />
              </CarouselPrevious>
              <CarouselNext 
                variant="ghost" 
                className="pointer-events-auto hidden md:flex text-2xl hover:bg-black/5 absolute -right-12 top-1/2 -translate-y-1/2 md:-right-16 lg:-right-20 z-0 !bg-white/80 hover:!bg-white"
              >
                <FaArrowRight />
              </CarouselNext>
            </div>
          </div>
          <CarouselContent className="mx-4 xl:mx-0 space-x-4 sm:space-x-5 relative z-10">
            {activeProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="w-full max-w-[198px] sm:max-w-[295px] pl-0"
              >
                <ProductCard 
                  product={product} 
                  variant="carousel"
                  showNewBadge={true}
                  showDiscountBadge={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex items-center justify-between mt-8">
          <Button variant="ghost" asChild>
            <Link href={viewAllLink}>Ver todo</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}