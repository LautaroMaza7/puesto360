import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const marketingMessages = [
  {
    id: 1,
    text: "Envíos en 24 a 48 hs a todo el país",
    icon: "🚚"
  },
  {
    id: 2,
    text: "Envío gratis en compras mayores a $50.000",
    icon: "📦"
  },
  {
    id: 3,
    text: "¡Paga en cuotas sin interés con todas las tarjetas!",
    icon: "💳"
  },
  {
    id: 4,
    text: "Atención personalizada por WhatsApp",
    icon: "💬"
  }
];

const TopBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Distancia mínima para considerar un swipe
  const minSwipeDistance = 50;

  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % marketingMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handlePrevious = () => {
    setIsAutoplay(false);
    setCurrentIndex((prev) => 
      prev === 0 ? marketingMessages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setIsAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % marketingMessages.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <div className="bg-black text-white py-3 px-2 sm:px-4 xl:px-0 relative overflow-hidden">
      <div className="relative mx-auto flex items-center justify-center">
        {/* Botón Anterior */}
        <Button
          variant="ghost"
          className="hover:bg-white/10 absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hidden sm:flex items-center justify-center"
          onClick={handlePrevious}
          aria-label="mensaje anterior"
        >
          <FiChevronLeft className="w-5 h-5" />
        </Button>

        {/* Carrusel de Mensajes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center px-8 cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <p className="text-xs sm:text-base font-medium flex items-center justify-center gap-2">
              <span className="text-lg sm:text-2xl">{marketingMessages[currentIndex].icon}</span>
              {marketingMessages[currentIndex].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Botón Siguiente */}
        <Button
          variant="ghost"
          className="hover:bg-white/10 absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hidden sm:flex items-center justify-center"
          onClick={handleNext}
          aria-label="siguiente mensaje"
        >
          <FiChevronRight className="w-5 h-5" />
        </Button>

        {/* Indicadores de Posición */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {marketingMessages.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-4 bg-white" : "w-1 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
