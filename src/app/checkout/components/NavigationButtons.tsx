import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import clsx from "clsx";

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isProcessing?: boolean;
  isDisabled?: boolean;
}

const NavigationButtons = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isProcessing = false,
  isDisabled = false,
}: NavigationButtonsProps) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="fixed z-10 bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Volver
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          disabled={isProcessing || isDisabled}
          className={clsx(
            "inline-flex items-center px-6 py-3 border border-transparent text-xs font-medium rounded-full shadow-sm text-white gap-2",
            {
              "bg-gray-900 hover:bg-gray-800": !isProcessing && !isDisabled,
              "bg-gray-400 cursor-not-allowed": isProcessing || isDisabled,
            }
          )}
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Procesando...
            </>
          ) : isLastStep ? (
            <>
              <Image
                src="/mercadopago.svg"
                alt="Mercado Pago"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              Confirmar y pagar
            </>
          ) : (
            "Continuar"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default NavigationButtons; 