"use client";

import { Product } from "@/types/product";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
}

export default function ProductGrid({ products, title, viewAllLink }: ProductGridProps) {
  return (
    <section className="mb-16">
      {title && (
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          {viewAllLink && (
            <Button variant="ghost" asChild>
              <Link href={viewAllLink}>Ver todo</Link>
            </Button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="aspect-square bg-gray-200 relative">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">${product.price}</p>
              <Button className="w-full" asChild>
                <Link href={`/product/${product.id}`}>Ver Detalles</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 