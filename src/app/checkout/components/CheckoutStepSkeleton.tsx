import React from "react";
import { cn } from "@/lib/utils";
import { satoshi } from "@/styles/fonts";

interface CheckoutStepSkeletonProps {
  step: number;
}

const CheckoutStepSkeleton: React.FC<CheckoutStepSkeletonProps> = ({ step }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2
        className={cn([
          satoshi.className,
          "text-3xl font-bold text-center mb-6",
        ])}
      >
        {step === 0 && "Información Personal"}
        {step === 1 && "Dirección de Envío"}
        {step === 2 && "Método de Pago"}
      </h2>
      
      <div className="space-y-4">
        {step === 0 && (
          <>
            {/* Skeleton para información personal */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="flex justify-end mt-4">
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </>
        )}
        
        {step === 1 && (
          <>
            {/* Skeleton para dirección de envío */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="flex justify-between mt-4">
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </>
        )}
        
        {step === 2 && (
          <>
            {/* Skeleton para método de pago */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="flex justify-between mt-4">
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutStepSkeleton; 