import React from 'react';
import { useFilter } from '@/context/FilterContext';
import { Separator } from "@/components/ui/separator";
import { FiChevronDown, FiX, FiCheck } from 'react-icons/fi';
import { Disclosure } from '@headlessui/react';

export default function Filters() {
  const { 
    products,
    categories, 
    selectedCategory, 
    selectedSubcategory, 
    priceRange,
    setSelectedCategory,
    setSelectedSubcategory,
    setPriceRange,
    specialOffer,
    newArrival,
    featuredBrand,
    freeShipping,
    setSpecialOffer,
    setNewArrival,
    setFeaturedBrand,
    setFreeShipping
  } = useFilter();

  // Obtener subcategorías filtradas por la categoría seleccionada
  const filteredSubcategories = React.useMemo(() => {
    if (!selectedCategory) return [];
    const subcategories = new Set<string>();
    products
      .filter(product => product.category === selectedCategory)
      .forEach(product => {
        if (product.subcategory) {
          subcategories.add(product.subcategory);
        }
      });
    return Array.from(subcategories).sort();
  }, [products, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategory);
    }
  };

  const handleFilterToggle = (filterType: 'specialOffer' | 'newArrival' | 'featuredBrand' | 'freeShipping') => {
    switch (filterType) {
      case 'specialOffer':
        setSpecialOffer(!specialOffer);
        if (!specialOffer) {
          setNewArrival(false);
          setFeaturedBrand(false);
          setFreeShipping(false);
        }
        break;
      case 'newArrival':
        setNewArrival(!newArrival);
        if (!newArrival) {
          setSpecialOffer(false);
          setFeaturedBrand(false);
          setFreeShipping(false);
        }
        break;
      case 'featuredBrand':
        setFeaturedBrand(!featuredBrand);
        if (!featuredBrand) {
          setSpecialOffer(false);
          setNewArrival(false);
          setFreeShipping(false);
        }
        break;
      case 'freeShipping':
        setFreeShipping(!freeShipping);
        if (!freeShipping) {
          setSpecialOffer(false);
          setNewArrival(false);
          setFeaturedBrand(false);
        }
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSpecialOffer(false);
    setNewArrival(false);
    setFeaturedBrand(false);
    setFreeShipping(false);
  };

  const hasActiveFilters = selectedCategory || selectedSubcategory || specialOffer || newArrival || featuredBrand || freeShipping;

  return (
    <div className="space-y-4">
      {/* Header con botón de limpiar */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-900">Filtros activos</h2>
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1"
          >
            <FiX className="w-3 h-3" />
            <span>Limpiar todo</span>
          </button>
        </div>
      )}

      {/* Categorías */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <Disclosure.Button className="flex w-full justify-between items-center">
              <h3 className="font-medium text-sm text-gray-900">Categorías</h3>
              <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'transform rotate-180' : ''}`} />
            </Disclosure.Button>
            <Disclosure.Panel className="mt-3 space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === category
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{category}</span>
                  {selectedCategory === category && (
                    <FiCheck className="w-4 h-4" />
                  )}
                </button>
              ))}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>

      {/* Subcategorías */}
      {selectedCategory && filteredSubcategories.length > 0 && (
        <Disclosure defaultOpen>
          {({ open }) => (
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <Disclosure.Button className="flex w-full justify-between items-center">
                <h3 className="font-medium text-sm text-gray-900">Subcategorías de {selectedCategory}</h3>
                <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'transform rotate-180' : ''}`} />
              </Disclosure.Button>
              <Disclosure.Panel className="mt-3 space-y-2">
                {filteredSubcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className={`w-full px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                      selectedSubcategory === subcategory
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{subcategory}</span>
                    {selectedSubcategory === subcategory && (
                      <FiCheck className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      )}

      {/* Filtros Adicionales */}
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <h3 className="font-medium text-sm text-gray-900 mb-3">Filtros Adicionales</h3>
        <div className="space-y-3">
          {[
            { 
              id: 'specialOffer', 
              label: 'Ofertas Especiales', 
              checked: specialOffer,
              icon: '🎁'
            },
            { 
              id: 'newArrival', 
              label: 'Nuevas Llegadas', 
              checked: newArrival,
              icon: '🆕'
            },
            { 
              id: 'featuredBrand', 
              label: 'Marcas Destacadas', 
              checked: featuredBrand,
              icon: '⭐'
            },
            { 
              id: 'freeShipping', 
              label: 'Envío Gratis', 
              checked: freeShipping,
              icon: '🚚'
            }
          ].map((filter) => (
            <label 
              key={filter.id} 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleFilterToggle(filter.id as 'specialOffer' | 'newArrival' | 'featuredBrand' | 'freeShipping')}
            >
              <div 
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  filter.checked 
                    ? 'border-black bg-black' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {filter.checked && (
                  <FiCheck className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{filter.icon}</span>
                <span 
                  className={`text-sm ${
                    filter.checked 
                      ? 'text-black font-medium' 
                      : 'text-gray-600 group-hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
