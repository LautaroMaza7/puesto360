"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import ProductDetailsContent from "./ProductDetailsContent";
import ReviewsContent from "./ReviewsContent";
import FaqContent from "./FaqContent";
import { Product } from '@/types/product';
type TabBtn = {
  id: number;
  label: string;
};

const tabBtnData: TabBtn[] = [
  {
    id: 1,
    label: "Detalles del producto",
  },
  {
    id: 2,
    label: "",
  },
  {
    id: 3,
    label: "",
  },
];

const Tabs = ({ product }: { product: Product }) => {
  const [active, setActive] = useState<number>(1);

  return (
    <div>
      <div className="flex items-center mb-6 sm:mb-8 overflow-x-auto">
        {tabBtnData.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            type="button"
            className={cn([
              active === tab.id
                ? "border-black border-b-2 font-medium"
                : "border-b border-black/10 text-black/60 font-normal",
              "p-5 sm:p-6 rounded-none flex-1",
            ])}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="mb-12 sm:mb-16">
      <ProductDetailsContent product={product} />
        {/* {active === 1 && <ProductDetailsContent product={product} />} */}
        {/* {active === 2 && <ReviewsContent />}
        {active === 3 && <FaqContent />} */}
      </div>
    </div>
  );
};

export default Tabs;
