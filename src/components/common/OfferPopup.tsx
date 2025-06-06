"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product'; // Assuming Product type is available
import { X } from 'lucide-react'; // Example icon
import { db } from '@/lib/firebase'; // Assuming Firebase is used for data fetching
import { collection, query, where, getDocs } from 'firebase/firestore';

// Remove onClose prop as popup will manage its own visibility
// interface OfferPopupProps {
//   onClose: () => void;
// }

// const OfferPopup = ({ onClose }: OfferPopupProps) => {
const OfferPopup = () => {
  // State to hold the single current offer and visibility
  const [currentOffer, setCurrentOffer] = useState<Product | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Timer to show/hide the popup periodically
  useEffect(() => {
    const fetchAndShowOffer = async () => {
      setIsLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('active', '==', true),
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => {
            const data = doc.data() as Product;
            return {
              ...data,
              id: doc.id,
              discount: data.discount || { percentage: 0, amount: 0 },
              promos: data.promos || []
            };
          });

        const commercialOffers = fetchedProducts.filter(product => 
            product.specialOffer || (product.discount?.percentage > 0 || product.discount?.amount > 0)
          );

        if (commercialOffers.length > 0) {
          // Select one random offer
          const randomOffer = commercialOffers[Math.floor(Math.random() * commercialOffers.length)];
          setCurrentOffer(randomOffer);
          setIsVisible(true); // Show popup
        } else {
          setCurrentOffer(null);
          setIsVisible(false);
        }

      } catch (error) {
        console.error('Error fetching offers:', error);
        setCurrentOffer(null);
        setIsVisible(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Show initial offer after a delay
    const initialTimer = setTimeout(fetchAndShowOffer, 3000); // Show after 3 seconds

    // Set interval for recurring offers (e.g., every 5 minutes)
    const interval = setInterval(fetchAndShowOffer, 300000); // Show every 5 minutes

    // Timer to hide the popup after a few seconds if not closed by user
    let hideTimer: NodeJS.Timeout;
    if (isVisible) {
      hideTimer = setTimeout(() => {
        setIsVisible(false);
        setCurrentOffer(null); // Clear offer data when hidden
      }, 10000); // Hide after 10 seconds
    }

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isVisible]); // Re-run effect when visibility changes to manage hide timer

  // Manual close handler
  const handleClose = () => {
    setIsVisible(false);
    setCurrentOffer(null); // Clear offer data on manual close
    // Optionally, reset or adjust interval timer here if needed
  };

  if (isLoading || !currentOffer || !isVisible) {
    return null; // Don't render if loading, no offer, or not visible
  }

  return (
    <AnimatePresence>
      {/* Only render if isVisible is true, AnimatePresence handles exit */}
      {isVisible && (
        <motion.div
          className="fixed top-[80px] left-4 z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose} // Close when clicking outside
        >
          <motion.div
            className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <h3 className="text-xl font-bold text-center mb-4">Oferta Especial</h3>
            <div className="space-y-4">
              {/* Render single offer */}
                <Link
                  key={currentOffer.id}
                  href={'/shop?filter=special-specialOffer'}
                  onClick={handleClose} // Close popup on click
                  className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 transition"
                >
                  <Image
                    src={currentOffer.images[0] || currentOffer.srcUrl || '/placeholder.png'}
                    alt={currentOffer.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{currentOffer.name}</p>
                    <p className="text-sm text-green-600 font-semibold">¡Oferta!</p>
                    {/* Add more details like discounted price if available */}
                    {/* Example: */}
                    {currentOffer.discount?.percentage > 0 && (
                      <p className="text-xs text-gray-500 line-through">Original: ${currentOffer.price}</p>
                    )}
                     {currentOffer.discount?.amount > 0 && (
                      <p className="text-xs text-gray-500 line-through">Original: ${currentOffer.price}</p>
                    )}
                    {(currentOffer.discount?.percentage > 0 || currentOffer.discount?.amount > 0) && (
                       <p className="text-sm font-semibold text-black">Ahora: ${Math.round(currentOffer.price - (currentOffer.price * (currentOffer.discount?.percentage || 0) / 100) - (currentOffer.discount?.amount || 0))}</p>
                    )}
                     {currentOffer.promos && currentOffer.promos.length > 0 && (
                      <p className="text-xs text-gray-500">Promo disponible</p>
                    )}
                  </div>
                </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup; 