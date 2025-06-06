import { motion } from "framer-motion";
import { CheckIcon } from "@heroicons/react/24/solid";
import { ShoppingBagIcon, TruckIcon, CreditCardIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface ProgressBarProps {
  currentStep: number;
  steps: {
    id: number;
    name: string;
    description: string;
    icon: React.ElementType;
  }[];
}

const ProgressBar = ({ currentStep, steps }: ProgressBarProps) => {
  return (
    <div className="py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const isUpcoming = step.id > currentStep;
              
              return (
                <li key={step.id} className="relative flex-1">
                  <div className="flex items-center">
                    {/* Línea conectora */}
                    {index < steps.length - 1 && (
                      <div 
                        className={`absolute top-4 sm:top-5 left-0 w-full h-0.5 ${
                          isCompleted ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      />
                    )}
                    
                    {/* Círculo del paso */}
                    <div className="relative flex items-center justify-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isCurrent ? 1.1 : 1,
                          backgroundColor: isCompleted 
                            ? "#111827" 
                            : isCurrent 
                              ? "#ffffff" 
                              : "#e5e7eb",
                          borderColor: isCompleted || isCurrent ? "#111827" : "#d1d5db",
                        }}
                        transition={{ duration: 0.3 }}
                        className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 flex items-center justify-center z-10 ${
                          isCompleted ? "bg-gray-900 border-gray-900" : 
                          isCurrent ? "bg-white border-gray-900" : 
                          "bg-gray-200 border-gray-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        ) : (
                          <step.icon 
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${
                              isCurrent ? "text-gray-900" : "text-gray-400"
                            }`} 
                          />
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Texto del paso */}
                    <div className="min-w-0 ml-2 sm:ml-4">
                      <motion.span
                        initial={false}
                        animate={{
                          color: isCurrent || isCompleted ? "#111827" : "#6b7280",
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                        className={`text-xs sm:text-sm font-medium bg-white block relative ${
                          isCurrent || isCompleted ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </motion.span>
                      <motion.span
                        initial={false}
                        animate={{
                          color: isCurrent ? "#111827" : "#6b7280",
                        }}
                        className={`hidden sm:block text-xs ${
                          isCurrent ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.description}
                      </motion.span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default ProgressBar; 