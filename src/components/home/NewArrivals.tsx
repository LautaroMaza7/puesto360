"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getNewArrivals } from "@/services/productService";
import ProductGrid from "@/components/shop-page/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const newProducts = await getNewArrivals(8);
        setProducts(newProducts);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <ProductGrid products={products} />;
} 