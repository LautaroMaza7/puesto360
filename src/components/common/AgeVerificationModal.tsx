"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AgeVerificationModalProps {
  onVerify: (isAdult: boolean) => void;
}

const AgeVerificationModal = ({ onVerify }: AgeVerificationModalProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if age preference is already stored in local storage
    const isAdult = localStorage.getItem('isAdult');

    if (isAdult === null) {
      // If not stored, show the modal
      setIsVisible(true);
    } else {
      // If stored, notify parent component and don't show modal
      onVerify(isAdult === 'true');
    }
  }, [onVerify]);

  const handleYes = () => {
    localStorage.setItem('isAdult', 'true');
    setIsVisible(false);
    onVerify(true);
  };

  const handleNo = () => {
    localStorage.setItem('isAdult', 'false');
    setIsVisible(false);
    onVerify(false);
    // Optionally redirect or show a message for non-adults
    // For now, just notify the parent component
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking outside the modal content
          >
            <h3 className="text-xl font-bold mb-4">Verificación de Edad</h3>
            <p className="mb-6 text-gray-700">¿Confirmas que tienes 18 años o más?</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleYes} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
                Sí, tengo 18+
              </Button>
              <Button onClick={handleNo} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6">
                No tengo 18
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgeVerificationModal; 