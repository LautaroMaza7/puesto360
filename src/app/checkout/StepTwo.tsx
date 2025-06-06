import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Step2Data } from "./schema";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup } from "@headlessui/react";
import {
  PencilIcon,
  MapPinIcon,
  TruckIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { satoshi } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import DeliveryAddressInput from "@/components/checkout/DeliveryAddressInput";

interface SavedAddress extends Step2Data {
  id: string;
  isFavorite?: boolean;
  lat?: number;
  lng?: number;
  sucursal?: {
    city: string;
  };
}

interface AddressData {
  address: string;
  city: string;
  postalCode: string;
  deliveryMethod: "envio";
  lat: number;
  lng: number;
  isFavorite: boolean;
}

type StepTwoProps = {
  register: UseFormRegister<Step2Data>;
  errors: FieldErrors<Step2Data>;
  setValue: any;
  onNext: () => void;
  setStep: (step: number) => void;
};

// Componente de Skeleton para placeholders
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

// Componente de LoadingSpinner
const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={cn("animate-spin", sizeClasses[size])}>
        <svg className="text-gray-900" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
};

// Componente de AddressCard para mostrar direcciones guardadas
const AddressCard = ({ address, isSelected, onClick }: { 
  address: SavedAddress; 
  isSelected: boolean;
  onClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={clsx(
      "p-4 border rounded-xl cursor-pointer transition-all duration-200",
      "hover:shadow-md",
      isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200"
    )}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <div className={clsx(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        isSelected ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
      )}>
        <MapPinIcon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{address.address}</h4>
        <p className="text-sm text-gray-500">{address.city}</p>
        {address.postalCode && (
          <p className="text-sm text-gray-500">CP: {address.postalCode}</p>
        )}
      </div>
      <div className={clsx(
        "shrink-0 rounded-full border-2 h-5 w-5 flex items-center justify-center",
        isSelected ? "border-gray-900 bg-gray-900" : "border-gray-300"
      )}>
        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </div>
  </motion.div>
);

// Componente de AddressCardSkeleton para el estado de carga
const AddressCardSkeleton = () => (
  <div className="p-4 border rounded-xl">
    <div className="flex items-start gap-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  </div>
);

const StepTwo = ({
  register,
  errors,
  setValue,
  onNext,
  setStep,
}: StepTwoProps) => {
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [useSaved, setUseSaved] = useState(true);
  const [storeLocations, setStoreLocations] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [deliveryType, setDeliveryType] = useState<"envio" | "retiro" | null>(null);
  const [isValidAddress, setIsValidAddress] = useState(false);

  const {
    watch,
    trigger,
  } = useFormContext<Step2Data>();

  const address = watch("address");
  const city = watch("city");
  const postalCode = watch("postalCode");
  const deliveryMethod = watch("deliveryMethod");

  const deliveryOptions = [
    {
      id: "envio",
      title: "Envío a domicilio",
      description: "Recibe tu pedido en la dirección que prefieras",
      icon: TruckIcon,
    },
    {
      id: "retiro",
      title: "Retiro en tienda",
      description: "Retira tu pedido en nuestra tienda física",
      icon: ShoppingBagIcon,
    },
  ];

  const addressOptions = [
    {
      id: "saved",
      title: "Usar dirección guardada",
      description: "Selecciona una de tus direcciones guardadas",
      icon: MapPinIcon,
    },
    {
      id: "new",
      title: "Ingresar nueva dirección",
      description: "Completa el formulario con los datos de entrega",
      icon: TruckIcon,
    },
  ];

  // Cargar direcciones guardadas
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const addressesRef = collection(db, "users", user.primaryEmailAddress.emailAddress, "addresses");
        const q = query(addressesRef, orderBy("isFavorite", "desc"));
        const querySnapshot = await getDocs(q);
        const addresses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedAddress[];

        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          setSelectedValue(addresses[0].id);
          setValue("address", addresses[0].address);
          setValue("city", addresses[0].city);
          setValue("postalCode", addresses[0].postalCode || "");
          setValue("lat", addresses[0].lat);
          setValue("lng", addresses[0].lng);
          setIsValidAddress(true);
        }
      } catch (error) {
        console.error("Error al cargar direcciones:", error);
      }
    };

    loadAddresses();
  }, [user?.primaryEmailAddress?.emailAddress, setValue]);

  // Cargar sucursales
  useEffect(() => {
    const loadStoreLocations = async () => {
      try {
        const settingsRef = doc(db, "settings", "general");
        const settingsDoc = await getDoc(settingsRef);
        if (settingsDoc.exists()) {
          const settings = settingsDoc.data();
          const locations = settings.locations || [];
          setStoreLocations(locations);
        }
      } catch (error) {
        console.error("Error al cargar sucursales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoreLocations();
  }, []);

  const handleAddressSelect = (data: {
    direccion: string;
    lat: number;
    lng: number;
    sucursal: any;
    postalCode: string;
  }) => {
    const address: SavedAddress = {
      id: uuidv4(),
      address: data.direccion,
      city: data.sucursal?.city || "Buenos Aires",
      postalCode: data.postalCode,
      deliveryMethod: "envio",
      lat: data.lat,
      lng: data.lng,
      sucursal: data.sucursal
    };

    setSelectedAddress(address);
    setUseSaved(false);
    setSelectedValue(null);
    setIsEditing(false);
    setIsValidAddress(true);

    setValue("address", address.address);
    setValue("city", address.city);
    setValue("postalCode", address.postalCode || "");
    setValue("lat", address.lat);
    setValue("lng", address.lng);
  };

  const handleStoreSelect = (store: any) => {
    setSelectedStore(store);
    setValue("deliveryMethod", "retiro");
    setValue("address", store.direccion);
    setValue("city", store.nombre);
    setValue("postalCode", "");
    setValue("lat", store.lat);
    setValue("lng", store.lng);
  };

  const checkDeliveryRadius = async (lat: number, lng: number): Promise<{
    isInRadius: boolean;
    distance: number;
    maxRadius: number;
    nearestStore: {
      id: string;
      nombre: string;
      direccion: string;
      lat: number;
      lng: number;
      radio: number;
    };
  } | null> => {
    try {
      const baseUrl = window.location.origin;
      console.log('URL base:', baseUrl);
      const url = `${baseUrl}/api/check-delivery-radius?lat=${lat}&lng=${lng}`;
      console.log('Verificando radio de entrega en:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta de la API:', data);
      return data;
    } catch (error) {
      console.error("Error al verificar el radio de entrega:", error);
      return null;
    }
  };

  const handleNext = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setErrorMessage("Debes iniciar sesión para continuar");
      return;
    }

    if (!deliveryType) {
      setErrorMessage("Por favor, selecciona un método de entrega");
      return;
    }

    if (deliveryType === "retiro") {
      if (!selectedStore) {
        setErrorMessage("Por favor, selecciona una tienda para retiro");
        return;
      }
      onNext();
      return;
    }

    if (deliveryType === "envio") {
      let addressToCheck: { lat: number; lng: number } | null = null;

      if (useSaved && savedAddresses.length > 0) {
        if (!selectedValue) {
          setErrorMessage("Por favor, selecciona una dirección de la lista");
          return;
        }
        const selectedSavedAddress = savedAddresses.find(addr => addr.id === selectedValue);
        if (!selectedSavedAddress) {
          setErrorMessage("La dirección seleccionada no es válida");
          return;
        }
        if (!selectedSavedAddress.lat || !selectedSavedAddress.lng) {
          setErrorMessage("La dirección seleccionada no tiene coordenadas válidas");
          return;
        }
        
        const deliveryCheck = await checkDeliveryRadius(
          selectedSavedAddress.lat,
          selectedSavedAddress.lng
        );

        if (!deliveryCheck) {
          setErrorMessage("Error al verificar la disponibilidad de entrega. Por favor, intenta nuevamente.");
          return;
        }

        if (!deliveryCheck.isInRadius) {
          const distance = Math.round(deliveryCheck.distance * 10) / 10;
          const maxRadius = Math.round(deliveryCheck.maxRadius * 10) / 10;
          setErrorMessage(
            `Lo sentimos, esta dirección está fuera de nuestro radio de entrega. ` +
            `La tienda más cercana (${deliveryCheck.nearestStore.nombre}) está a ${distance}km ` +
            `y su radio de entrega es de ${maxRadius}km. ` +
            `Por favor, elige retiro en tienda o consulta por envío especial.`
          );
          return;
        }

        addressToCheck = {
          lat: selectedSavedAddress.lat,
          lng: selectedSavedAddress.lng
        };
      } else if (!useSaved) {
        if (!selectedAddress) {
          setErrorMessage("Por favor, selecciona una dirección válida usando el buscador");
          return;
        }
        if (!selectedAddress.lat || !selectedAddress.lng) {
          setErrorMessage("La dirección seleccionada no tiene coordenadas válidas");
          return;
        }
        addressToCheck = {
          lat: selectedAddress.lat,
          lng: selectedAddress.lng
        };
      }

      if (!addressToCheck) {
        setErrorMessage("Error al procesar la dirección");
        return;
      }

      setIsSaving(true);
      setErrorMessage(null);

      try {
        let address: string;
        let lat: number;
        let lng: number;
        let postalCode: string;
        let city: string;

        if (useSaved) {
          const savedAddr = savedAddresses.find(addr => addr.id === selectedValue);
          if (!savedAddr?.address || !savedAddr?.lat || !savedAddr?.lng || !savedAddr?.postalCode) {
            setErrorMessage("Error al procesar la dirección guardada");
            return;
          }
          address = savedAddr.address;
          lat = savedAddr.lat;
          lng = savedAddr.lng;
          postalCode = savedAddr.postalCode;
          city = savedAddr.city;
        } else {
          if (!selectedAddress?.address || !selectedAddress?.lat || !selectedAddress?.lng) {
            setErrorMessage("Error al procesar la nueva dirección");
            return;
          }
          address = selectedAddress.address;
          lat = selectedAddress.lat;
          lng = selectedAddress.lng;
          postalCode = selectedAddress.postalCode || "";
          city = selectedAddress.city;
        }

        const addressData = {
          address,
          city,
          postalCode,
          deliveryMethod: "envio" as const,
          lat,
          lng,
          isFavorite: false
        };

        if (!useSaved || (selectedValue && isEditing)) {
          const userAddressesCollection = collection(db, "users", user.primaryEmailAddress.emailAddress, "addresses");

          if (selectedValue && isEditing) {
            const addressRef = doc(userAddressesCollection, selectedValue);
            await updateDoc(addressRef, addressData);
            setSavedAddresses((prev) =>
              prev.map((addr) =>
                addr.id === selectedValue ? { ...addr, ...addressData } : addr
              )
            );
          } else if (!useSaved) {
            const newId = uuidv4();
            const addressRef = doc(userAddressesCollection, newId);
            await setDoc(addressRef, { ...addressData, id: newId });
            setSavedAddresses((prev) => [...prev, { ...addressData, id: newId }]);
          }
        }

        onNext();
      } catch (error) {
        console.error("Error al guardar la dirección:", error);
        setErrorMessage("Ocurrió un error al guardar la dirección. Por favor, intenta nuevamente");
        return;
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2
        className={cn([
          satoshi.className,
          "text-3xl font-bold text-center mb-6",
        ])}
      >
        {!deliveryType ? "Método de entrega" : "Dirección de entrega"}
      </h2>

      {/* Mensaje de error */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!deliveryType ? (
        <RadioGroup
          value={deliveryType}
          onChange={(type) => {
            setDeliveryType(type);
            setValue("deliveryMethod", type);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deliveryOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = option.id === deliveryType;

              return (
                <RadioGroup.Option
                  key={option.id}
                  value={option.id}
                  className={({ active }) =>
                    clsx(
                      "relative rounded-2xl shadow-sm px-6 py-4 cursor-pointer flex items-start space-x-4",
                      "transition-all duration-200 ease-in-out",
                      "hover:shadow-md",
                      "border-2",
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200",
                      active && !isSelected && "border-gray-300 bg-gray-50"
                    )
                  }
                >
                  <>
                    <div
                      className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <RadioGroup.Label
                        className={clsx(
                          "block text-sm font-medium leading-6",
                          isSelected ? "text-gray-900" : "text-gray-900"
                        )}
                      >
                        {option.title}
                      </RadioGroup.Label>
                      <RadioGroup.Description className="mt-1 text-sm text-gray-500">
                        {option.description}
                      </RadioGroup.Description>
                    </div>
                    <div
                      className={clsx(
                        "shrink-0 rounded-full border-2 h-5 w-5 flex items-center justify-center",
                        isSelected
                          ? "border-gray-900 bg-gray-900"
                          : "border-gray-300"
                      )}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </>
                </RadioGroup.Option>
              );
            })}
          </div>
        </RadioGroup>
      ) : (
        <>
          {deliveryType === "retiro" ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Selecciona una sucursal</h3>
              <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                  <>
                    <AddressCardSkeleton />
                    <AddressCardSkeleton />
                  </>
                ) : (
                  storeLocations.map((store) => (
                    <motion.div
                      key={store.nombre}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={clsx(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                        "hover:shadow-md",
                        selectedStore?.nombre === store.nombre
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-900"
                      )}
                      onClick={() => handleStoreSelect(store)}
                    >
                      <h4 className="font-medium">{store.nombre}</h4>
                      <p className="text-sm text-gray-600">{store.direccion}</p>
                      <p className="text-sm text-gray-600">Radio de entrega: {store.radio}m</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              {savedAddresses.length > 0 && (
                <RadioGroup
                  value={useSaved}
                  onChange={(value) => {
                    setUseSaved(value);
                    if (!value) {
                      setSelectedValue(null);
                      setSelectedAddress(null);
                      setIsValidAddress(false);
                      setValue("address", "");
                      setValue("city", "");
                      setValue("postalCode", "");
                      setValue("lat", null);
                      setValue("lng", null);
                    } else if (savedAddresses.length > 0) {
                      const firstAddress = savedAddresses[0];
                      setSelectedValue(firstAddress.id);
                      setValue("address", firstAddress.address);
                      setValue("city", firstAddress.city);
                      setValue("postalCode", firstAddress.postalCode || "");
                      setValue("lat", firstAddress.lat);
                      setValue("lng", firstAddress.lng);
                      setIsValidAddress(true);
                      setSelectedAddress(firstAddress);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addressOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = option.id === "saved" ? useSaved : !useSaved;

                      return (
                        <RadioGroup.Option
                          key={option.id}
                          value={option.id === "saved"}
                          className={({ active }) =>
                            clsx(
                              "relative rounded-2xl shadow-sm px-6 py-4 cursor-pointer flex items-start space-x-4",
                              "transition-all duration-200 ease-in-out",
                              "hover:shadow-md",
                              "border-2",
                              isSelected
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-200",
                              active && !isSelected && "border-gray-300 bg-gray-50"
                            )
                          }
                        >
                          <>
                            <div
                              className={clsx(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                isSelected
                                  ? "bg-gray-900 text-white"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <RadioGroup.Label
                                className={clsx(
                                  "block text-sm font-medium leading-6",
                                  isSelected ? "text-gray-900" : "text-gray-900"
                                )}
                              >
                                {option.title}
                              </RadioGroup.Label>
                              <RadioGroup.Description className="mt-1 text-sm text-gray-500">
                                {option.description}
                              </RadioGroup.Description>
                            </div>
                            <div
                              className={clsx(
                                "shrink-0 rounded-full border-2 h-5 w-5 flex items-center justify-center",
                                isSelected
                                  ? "border-gray-900 bg-gray-900"
                                  : "border-gray-300"
                              )}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                          </>
                        </RadioGroup.Option>
                      );
                    })}
                  </div>
                </RadioGroup>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={useSaved ? "saved" : "new"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {useSaved && savedAddresses.length > 0 ? (
                    <div className="space-y-4">
                      {isLoading ? (
                        <>
                          <AddressCardSkeleton />
                          <AddressCardSkeleton />
                        </>
                      ) : (
                        savedAddresses.map((addr) => (
                          <AddressCard
                            key={addr.id}
                            address={addr}
                            isSelected={addr.id === selectedValue}
                            onClick={() => {
                              setSelectedValue(addr.id);
                              setValue("address", addr.address);
                              setValue("city", addr.city);
                              setValue("postalCode", addr.postalCode || "");
                              setValue("lat", addr.lat);
                              setValue("lng", addr.lng);
                              setIsValidAddress(true);
                              setSelectedAddress(addr);
                            }}
                          />
                        ))
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <DeliveryAddressInput onValidAddress={handleAddressSelect} />
                      {isValidAddress && selectedAddress && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Código Postal
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                {...register("postalCode", {
                                  required: "El código postal es requerido",
                                  pattern: {
                                    value: /^[A-Z0-9]{4,8}$/,
                                    message: "Código postal inválido"
                                  }
                                })}
                                className="w-full px-4 py-3 text-base border rounded-xl shadow-sm
                                  transition-all duration-200 ease-in-out
                                  border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                  bg-white hover:bg-gray-50"
                                placeholder="Ej: C1425"
                              />
                              {!errors.postalCode && watch("postalCode") && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                </div>
                              )}
                            </div>
                            {errors.postalCode && (
                              <p className="text-sm text-red-600">{errors.postalCode.message}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </>
      )}

      <div className="fixed z-10 bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              if (deliveryType) {
                setDeliveryType(null);
              } else {
                setStep(0);
              }
            }}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver
          </motion.button>
          {deliveryType && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleNext}
              disabled={isSaving || (deliveryType === "envio" && !isValidAddress) || (deliveryType === "retiro" && !selectedStore)}
              className={clsx(
                "bg-black text-white rounded-full w-full max-w-[200px] h-[48px]",
                "transition-all duration-200 ease-in-out",
                "hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Continuar</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StepTwo;