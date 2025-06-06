import React from "react";

interface ProductPlaceholderProps {
  size?: "xs" | "sm" | "md" | "lg";
}

const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({ size = "sm" }) => {
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  };

  return (
    <div className={`${sizeClasses[size]} relative rounded-md overflow-hidden`}>
      {/* Fondo base */}
      <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
      
      {/* Detalles del producto */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Líneas que simulan detalles del producto */}
        <div className="w-1/2 h-0.5 bg-gray-300 rounded-full mb-0.5"></div>
        <div className="w-1/3 h-0.5 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Borde sutil */}
      <div className="absolute inset-0 border border-gray-300 rounded-md"></div>
    </div>
  );
};

export default ProductPlaceholder; 