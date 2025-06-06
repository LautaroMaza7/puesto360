"use client";

import React, { useState } from "react";
import AddToCartBtn from "./AddToCartBtn";
import { Product } from '@/types/product';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AddToCardSection = ({ data }: { data: Product }) => {
  const [quantity, setQuantity] = useState<number>(1);

  return (
    <div className="md:relative w-full bg-white border-t md:border-none border-black/5 bottom-0 left-0 p-4 md:p-0 z-10 flex flex-col space-y-4">
      {data.promos && data.promos.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">
            ¡Aprovecha estas ofertas especiales! 🎉
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.promos.map((promo, index) => (
              <Badge 
                key={index}
                variant={quantity >= promo.cantidad ? "default" : "outline"}
                className={cn(
                  "text-xs",
                  quantity >= promo.cantidad && "bg-green-500 hover:bg-green-600"
                )}
              >
                {promo.cantidad}x -{promo.descuento}%
              </Badge>
            ))}
          </div>
        </div>
      )}
      <AddToCartBtn data={{ ...data, quantity }} />
    </div>
  );
};

export default AddToCardSection;
