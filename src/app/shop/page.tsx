"use client";

import { useEffect, useState } from "react";
import { FilterProvider, useFilter } from "@/context/FilterContext";
import { useSearchParams, useRouter } from "next/navigation";
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import { FiSliders } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import ProductGrid from '@/components/shop-page/ProductGrid';
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types/product";

type SortOption = 'most-popular' | 'low-price' | 'high-price' | 'newest';
type FilterType = 'specialOffer' | 'newArrival' | 'featuredBrand' | 'freeShipping';

function ShopContent() {
  const { 
    filteredProducts, 
    setSortOption, 
    loading,
    specialOffer,
    newArrival,
    featuredBrand,
    freeShipping,
    setSpecialOffer,
    setNewArrival,
    setFeaturedBrand,
    setFreeShipping
  } = useFilter();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = searchParams?.get('sort') as SortOption | null;
  const filter = searchParams?.get('filter');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    if (sort) {
      setSortOption(sort);
    }
  }, [sort, setSortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sort, specialOffer, newArrival, featuredBrand, freeShipping]);

  useEffect(() => {
    if (filter) {
      const filters = filter.split(',') as FilterType[];
      setSpecialOffer(filters.includes('specialOffer'));
      setNewArrival(filters.includes('newArrival'));
      setFeaturedBrand(filters.includes('featuredBrand'));
      setFreeShipping(filters.includes('freeShipping'));
    } else {
      setSpecialOffer(false);
      setNewArrival(false);
      setFeaturedBrand(false);
      setFreeShipping(false);
    }
  }, [filter, setSpecialOffer, setNewArrival, setFeaturedBrand, setFreeShipping]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (value: SortOption) => {
    if (!searchParams) return;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sort', value);
    router.push(`/shop?${newParams.toString()}`);
  };

  const handleFilterChange = (filterType: FilterType, value: boolean) => {
    if (!searchParams) return;
    const newParams = new URLSearchParams(searchParams.toString());
    const currentFilters = newParams.get('filter')?.split(',') || [];
    
    if (value) {
      if (!currentFilters.includes(filterType)) {
        currentFilters.push(filterType);
      }
    } else {
      const index = currentFilters.indexOf(filterType);
      if (index > -1) {
        currentFilters.splice(index, 1);
      }
    }
    
    if (currentFilters.length > 0) {
      newParams.set('filter', currentFilters.join(','));
    } else {
      newParams.delete('filter');
    }
    
    router.push(`/shop?${newParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] bg-white rounded-xl shadow-lg border border-gray-100 px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filtros</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters />
          </div>

          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:justify-between mb-6">
              <div className="flex items-center justify-between">
                <MobileFilters />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row mt-4 lg:mt-0">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  Mostrando {filteredProducts.length} Productos
                </span>
                <div className="flex items-center">
                  Ordenar por:{" "}
                  <Select 
                    defaultValue={sort || "most-popular"} 
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="most-popular">Más Popular</SelectItem>
                      <SelectItem value="low-price">Precio Bajo</SelectItem>
                      <SelectItem value="high-price">Precio Alto</SelectItem>
                      <SelectItem value="newest">Más Recientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <ProductGrid products={currentProducts} />

            {filteredProducts.length > productsPerPage && (
              <>
                <hr className="border-t-black/10 mt-8" />
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-2.5 py-2 rounded-md border border-black/10 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-md ${
                          currentPage === page
                            ? 'bg-black/5 text-black'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-2.5 py-2 rounded-md border border-black/10 ${
                      currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>Siguiente</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();

  const category = searchParams?.get('category');
  const subcategory = searchParams?.get('subcategory');
  const sort = searchParams?.get('sort') as SortOption | null;
  const filter = searchParams?.get('filter');

  return (
    <FilterProvider initialFilters={{
      selectedCategory: category,
      selectedSubcategory: subcategory,
      sortOption: sort || 'most-popular',
      filter: filter
    }}>
      <ShopContent />
    </FilterProvider>
  );
}
