"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, Query } from "firebase/firestore";
import ProductGrid from "@/components/shop-page/ProductGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let productsQuery: Query = collection(db, "products");
        
        // Aplicar filtros
        if (category && category !== "all") {
          productsQuery = query(productsQuery, where("category", "==", category));
        }
        
        // Aplicar ordenamiento
        switch (sortBy) {
          case "price-asc":
            productsQuery = query(productsQuery, orderBy("price", "asc"));
            break;
          case "price-desc":
            productsQuery = query(productsQuery, orderBy("price", "desc"));
            break;
          case "newest":
          default:
            productsQuery = query(productsQuery, orderBy("createdAt", "desc"));
            break;
        }

        /*  */

        const querySnapshot = await getDocs(productsQuery);
        const fetchedProducts = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            let createdAt: Date;
            try {
              createdAt = data.createdAt?.toDate?.() || new Date();
            } catch (error) {
              console.warn('Error al convertir timestamp:', error);
              createdAt = new Date();
            }

            const product: Product = {
              id: doc.id,
              storeId: data.storeId || '',
              title: data.title || '',
              name: data.name || '',
              description: data.description || '',
              price: data.price || 0,
              images: data.images || [],
              srcUrl: data.srcUrl || '',
              category: data.category || '',
              subcategory: data.subcategory || '',
              stock: data.stock || 0,
              discount: {
                amount: data.discount?.amount || 0,
                percentage: data.discount?.percentage || 0
              },
              freeShipping: data.freeShipping ?? false,
              createdAt: createdAt,
              sales: data.sales || 0,
              rating: data.rating || 0,
              active: data.active ?? true,
              specialOffer: data.specialOffer ?? false,
              newArrival: data.newArrival ?? false,
              featuredBrand: data.featuredBrand ?? false,
              promos: data.promos || [],
              updatedAt: data.updatedAt?.toDate?.() || createdAt
            };

            return product;
          })
          .filter((product) => product.active);

        // Aplicar filtro de precio
        let filteredProducts = fetchedProducts;
        if (priceRange !== "all") {
          const [min, max] = priceRange.split("-").map(Number);
          filteredProducts = fetchedProducts.filter(
            (product) => product.price >= min && product.price <= max
          );
        }

        // Aplicar búsqueda
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.title.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower) ||
              product.category.toLowerCase().includes(searchLower)
          );
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sortBy, priceRange, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
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
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-8">Catálogo de Productos Textiles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="telas">Telas</SelectItem>
              <SelectItem value="accesorios">Accesorios</SelectItem>
              <SelectItem value="confeccion">Confección</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Rango de precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los precios</SelectItem>
              <SelectItem value="0-1000">Hasta $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="10000-999999">Más de $10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="price-asc">Menor precio</SelectItem>
              <SelectItem value="price-desc">Mayor precio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No se encontraron productos</h2>
          <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </main>
  );
}
