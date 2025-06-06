import { useEffect, useState } from 'react';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import { MapPinIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useDeliveryValidation } from "@/hooks/useDeliveryValidation"
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const libraries: ("places")[] = ["places"];

interface DeliveryAddressInputProps {
  onValidAddress: (data: {
    direccion: string;
    lat: number;
    lng: number;
    sucursal: any;
    postalCode: string;
  }) => void;
  onPickupSelected?: (sucursal: any) => void;
}

const DeliveryAddressInput = ({ onValidAddress, onPickupSelected }: DeliveryAddressInputProps) => {
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateAddress, loading } = useDeliveryValidation();
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Verificar si la API key está disponible
  useEffect(() => {
    if (!googleMapsApiKey) {
      console.error('Google Maps API Key no está configurada');
      setError('Error al cargar el servicio de direcciones');
    }
  }, [googleMapsApiKey]);

  const handlePlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        setIsLoading(true);
        setError(null);
        
        try {
          const place = places[0];
          const location = place.geometry?.location;
          
          if (!location) {
            setError('No se pudo obtener la ubicación exacta');
            return;
          }

          // Obtener el código postal
          let postalCode = '';
          place.address_components?.forEach((component) => {
            if (component.types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          });

          const result = validateAddress(location.lat(), location.lng())
          if (result.disponible && result.sucursal) {
            onValidAddress({
              direccion: place.formatted_address || '',
              lat: location.lat(),
              lng: location.lng(),
              sucursal: result.sucursal,
              postalCode
            });
          } else {
            setError("No entregamos en tu zona. Por favor, elige retiro o consulta por envío especial.")
          }
        } catch (error) {
          console.error('Error al procesar la dirección:', error);
          setError('Error al procesar la dirección seleccionada');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  if (!googleMapsApiKey) {
    return (
      <div className="my-6 max-w-xl">
        <div className="p-4 rounded-xl border border-red-200 bg-red-50">
          <p className="text-sm text-red-600">
            Error al cargar el servicio de direcciones. Por favor, intenta más tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 max-w-xl">
      <label className="block font-medium mb-1">Dirección de entrega</label>
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        libraries={libraries}
        loadingElement={
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
          </div>
        }
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Buscar dirección
          </label>
          <div className="relative">
            <StandaloneSearchBox
              onLoad={ref => setSearchBox(ref)}
              onPlacesChanged={handlePlacesChanged}
            >
              <div className="relative">
                <input
                  type="text"
                  className={clsx(
                    "w-full pl-10 pr-4 py-3 text-base border rounded-xl shadow-sm",
                    "transition-all duration-200 ease-in-out",
                    "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                    "bg-white hover:bg-gray-50",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  placeholder="Ingresa tu dirección"
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </StandaloneSearchBox>
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
          <p className="text-xs text-gray-500">
            Ingresa tu dirección completa para verificar si estás dentro del área de entrega
          </p>
        </div>
      </LoadScript>
    </div>
  );
};

export default DeliveryAddressInput; 