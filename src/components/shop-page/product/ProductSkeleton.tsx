import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square w-full bg-gray-200 rounded-xl" />
            
            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            {/* Título */}
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            
            {/* Precio */}
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
            
            {/* Descripción */}
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>

            {/* Botones de acción */}
            <div className="mt-8 space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg w-full" />
              <div className="h-12 bg-gray-200 rounded-lg w-full" />
            </div>

            {/* Características */}
            <div className="mt-8 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <div className="mt-16">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 