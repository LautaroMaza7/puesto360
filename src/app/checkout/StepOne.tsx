import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";
import { useFormContext } from "react-hook-form";
import { Step1Data } from "./schema";
import { motion, AnimatePresence } from "framer-motion";
import { RadioGroup } from "@headlessui/react";
import {
  PencilIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { satoshi } from "@/styles/fonts";
import { cn } from "@/lib/utils";

interface SavedProfile extends Step1Data {
  id: string;
  isFavorite?: boolean;
}

interface StepOneProps {
  userEmail?: string;
  useSaved: boolean;
  setUseSaved: React.Dispatch<React.SetStateAction<boolean>>;
  onNext: () => void;
}

// Definir el tipo para InputField
interface InputFieldProps {
  id: keyof Step1Data;
  label: string;
  register: any;
  errors: any;
  disabled?: boolean;
  validation?: {
    required?: boolean;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
  };
}

const InputField = ({
  id,
  label,
  register,
  errors,
  disabled = false,
  validation,
}: InputFieldProps) => {
  const error = errors[id];

  return (
    <div className="relative mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={id}
          disabled={disabled}
          {...register(id, {
            required: validation?.required && "Este campo es requerido",
            pattern: validation?.pattern,
            minLength: validation?.minLength,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              // Aquí puedes agregar lógica de validación en tiempo real si es necesario
            },
          })}
          className={clsx(
            "block w-full px-4 py-3 rounded-xl border shadow-sm transition-all duration-200",
            "text-base focus:outline-none focus:ring-2 focus:ring-offset-0",
            {
              "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30":
                !error && !disabled,
              "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/30":
                error,
              "bg-gray-100 border-gray-200 text-gray-500": disabled,
            }
          )}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" id={`${id}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
};

const StepOne = ({
  userEmail,
  useSaved,
  setUseSaved,
  onNext,
}: StepOneProps) => {
  const { isSignedIn, user } = useUser();
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [showSavedInfo, setShowSavedInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch,
    handleSubmit,
    trigger,
  } = useFormContext<Step1Data>();

  const dni = watch("dni");

  // Obtener datos del usuario desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn || !user?.id) return;

      try {
        const userDocRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          
          // Establecer valores del formulario con datos de Clerk
          setValue("email", user.emailAddresses[0].emailAddress);
          setValue("fullName", `${user.firstName} ${user.lastName}`);
          setValue("phone", user.phoneNumbers[0]?.phoneNumber || "");
          setValue("dni", data.dni || "");
        } else {
          // Si no existe el documento, crear uno nuevo con datos de Clerk
          const newUserData = {
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            phone: user.phoneNumbers[0]?.phoneNumber || "",
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newUserData);
          setUserData(newUserData);
          
          // Establecer valores del formulario
          setValue("email", newUserData.email);
          setValue("fullName", newUserData.name);
          setValue("phone", newUserData.phone);
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      }
    };

    fetchUserData();
  }, [isSignedIn, user, setValue]);

  const handleNext = async () => {
    if (!isSignedIn || !user?.id) {
      setErrorMessage("Debes iniciar sesión para continuar");
      return;
    }

    // Validar el DNI
    const isFormValid = await trigger();
    if (!isFormValid) {
      setErrorMessage("Por favor, ingresa un DNI válido.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, {
        dni,
        updatedAt: new Date().toISOString()
      });

      onNext();
    } catch (error) {
      console.error("Error al guardar el DNI:", error);
      setErrorMessage(
        "Ocurrió un error al guardar el DNI. Por favor, intenta nuevamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className={cn([satoshi.className, "text-3xl font-bold text-center mb-6"])}>
        Información personal
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
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DisplayField
          label="Nombre completo"
          value={watch("fullName")}
        />
        <DisplayField
          label="Correo electrónico"
          value={watch("email")}
        />
        <DisplayField
          label="Teléfono"
          value={watch("phone")}
        />
        <InputField
          id="dni"
          label="DNI"
          register={register}
          errors={errors}
          validation={{
            required: true,
            pattern: {
              value: /^[0-9]{8}$/,
              message: "Ingresa un DNI válido (8 dígitos)",
            },
          }}
        />
      </div>

      <div className="fixed z-10 bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-end items-center">
          <motion.button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              "text-white rounded-full w-full max-w-[200px] h-[48px]",
              "transition-all duration-200 ease-in-out",
              "hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed",
              "bg-black"
            )}
          >
            {isSaving ? "Guardando..." : "Continuar"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StepOne;

const DisplayField = ({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string | undefined;
  onEdit?: () => void;
}) => (
  <div className="flex flex-col mb-4">
    <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative group">
      <div
        className="w-full px-4 py-3 text-base border rounded-xl shadow-sm bg-gray-50
        transition-all duration-200 ease-in-out group-hover:bg-gray-100"
      >
        {value || ""}
      </div>
      {onEdit && (
        <motion.button
          type="button"
          onClick={onEdit}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 
            text-gray-400 hover:text-gray-900 transition-colors"
        >
          <PencilIcon className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  </div>
);