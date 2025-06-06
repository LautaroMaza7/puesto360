import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
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
  const { data: session } = useSession();
  const user = session?.user;
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [showSavedInfo, setShowSavedInfo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch,
    handleSubmit,
    trigger,
  } = useFormContext<Step1Data>();

  const fullName = watch("fullName");
  const phone = watch("phone");
  const dni = watch("dni");

  // Obtener datos guardados
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.email) return;

      setValue("email", user.email);

      const profilesCollection = collection(
        db,
        "users",
        user.email,
        "profiles"
      );
      const profilesSnapshot = await getDocs(profilesCollection);

      const profiles: SavedProfile[] = [];
      profilesSnapshot.forEach((doc) => {
        profiles.push({
          ...(doc.data() as Step1Data),
          id: doc.id,
        });
      });

      setSavedProfiles(profiles);

      // Si hay perfiles guardados, seleccionar automáticamente el favorito o el último creado
      if (profiles.length > 0) {
        // Buscar el perfil favorito
        const favoriteProfile = profiles.find((p) => p.isFavorite);

        // Si hay un favorito, usarlo; si no, usar el último creado
        const profileToSelect =
          favoriteProfile || profiles[profiles.length - 1];
        setSelectedValue(profileToSelect.id);

        // Establecemos los valores del formulario en segundo plano
        setValue("fullName", profileToSelect.fullName);
        setValue("phone", profileToSelect.phone);
        setValue("dni", profileToSelect.dni);

        // No activamos showSavedInfo para que los datos no se muestren automáticamente
        setUseSaved(true);
      }
    };

    fetchUserData();
  }, [user, setValue, setUseSaved]);

  // Cargar datos guardados en el formulario
  useEffect(() => {
    if (!useSaved) {
      setValue("fullName", "");
      setValue("phone", "");
      setValue("dni", "");
      setShowSavedInfo(false);
      setIsEditing(false);
      setSelectedValue("");
    }
  }, [useSaved, setValue]);

  // Seleccionar info guardada
  const handleSavedInfoSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);

    if (value) {
      const selectedProfile = savedProfiles.find(
        (profile) => profile.id === value
      );
      if (selectedProfile) {
        setShowSavedInfo(true);
        setIsEditing(false);
        setValue("fullName", selectedProfile.fullName);
        setValue("phone", selectedProfile.phone);
        setValue("dni", selectedProfile.dni);
      }
    } else {
      setShowSavedInfo(false);
      setIsEditing(false);
      setValue("fullName", "");
      setValue("phone", "");
      setValue("dni", "");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleNext = async () => {
    if (!user?.email) {
      setErrorMessage("Debes iniciar sesión para continuar");
      return;
    }

    // Validar todos los campos requeridos
    const isFormValid = await trigger();
    if (!isFormValid) {
      setErrorMessage("Por favor, completa todos los campos correctamente.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const newData = {
        fullName,
        phone,
        dni,
        email: user.email,
        createdAt: new Date().toISOString(),
      };

      const userProfilesCollection = collection(
        db,
        "users",
        user.email,
        "profiles"
      );

      // Si estamos editando un perfil existente
      if (selectedValue && isEditing) {
        const profileRef = doc(userProfilesCollection, selectedValue);
        await updateDoc(profileRef, newData);
        setSavedProfiles((prev) =>
          prev.map((profile) =>
            profile.id === selectedValue ? { ...profile, ...newData } : profile
          )
        );
      }
      // Si estamos creando un nuevo perfil o no estamos usando datos guardados
      else if (!useSaved || !selectedValue) {
        const newId = uuidv4();
        const profileRef = doc(userProfilesCollection, newId);
        await setDoc(profileRef, newData);

        // Actualizar el estado local con el nuevo perfil
        const newProfile = { ...newData, id: newId };
        setSavedProfiles((prev) => [...prev, newProfile]);

        // Actualizar el estado para mostrar el nuevo perfil
        setSelectedValue(newId);
        setUseSaved(true);
        setShowSavedInfo(true);
      }

      // Continuar al siguiente paso
      onNext();
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      setErrorMessage(
        "Ocurrió un error al guardar el perfil. Por favor, intenta nuevamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Validación en tiempo real
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name && type === "change") {
        trigger(name as keyof Step1Data);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  const options = [
    {
      id: "saved",
      title: "Usar información guardada",
      description: "Selecciona uno de tus perfiles guardados",
      icon: UserIcon,
    },
    {
      id: "new",
      title: "Ingresar nueva información",
      description: "Completa el formulario con tus datos",
      icon: DocumentTextIcon,
    },
  ];

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

      {savedProfiles.length > 0 && (
        <RadioGroup
          value={useSaved}
          onChange={(value) => {
            setUseSaved(value);
            if (!value) {
              setShowSavedInfo(false);
              setIsEditing(false);
              setSelectedValue("");
            }
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option) => {
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
                      "border-2",
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200",
                      active && !isSelected && "border-gray-300 bg-gray-50"
                    )
                  }
                >
                  {({ checked }) => (
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
                  )}
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
          {useSaved && savedProfiles.length > 0 ? (
            <>
              <div className="flex flex-col">
                <label
                  htmlFor="savedInfo"
                  className="text-sm font-medium text-gray-700 mb-2"
                >
                  Seleccionar información guardada
                </label>
                <select
                  id="savedInfo"
                  value={selectedValue}
                  onChange={handleSavedInfoSelect}
                  className="w-full px-4 py-3 text-base border rounded-xl shadow-sm
                    transition-all duration-200 ease-in-out
                    border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-200
                    bg-white hover:bg-gray-50"
                >
                  <option value="">Seleccionar...</option>
                  {savedProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.fullName}
                    </option>
                  ))}
                </select>
                {showSavedInfo && (
                  <p className="text-sm text-gray-900 mt-2">
                    Perfil seleccionado. Puedes continuar o editar los datos si
                    lo deseas.
                  </p>
                )}
              </div>

              <AnimatePresence>
                {showSavedInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {isEditing ? (
                      <>
                        <InputField
                          id="fullName"
                          label="Nombre completo"
                          register={register}
                          errors={errors}
                          disabled={!isEditing && showSavedInfo}
                          validation={{
                            required: true,
                            minLength: {
                              value: 3,
                              message:
                                "El nombre debe tener al menos 3 caracteres",
                            },
                          }}
                        />
                        <InputField
                          id="email"
                          label="Correo electrónico"
                          register={register}
                          errors={errors}
                          disabled={!isEditing && showSavedInfo}
                          validation={{
                            required: true,
                            pattern: {
                              value:
                                /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                              message: "Ingresa un correo electrónico válido",
                            },
                          }}
                        />
                        <InputField
                          id="phone"
                          label="Teléfono"
                          register={register}
                          errors={errors}
                          disabled={!isEditing && showSavedInfo}
                          validation={{
                            required: true,
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message:
                                "Ingresa un número de teléfono válido (10 dígitos)",
                            },
                          }}
                        />
                        <InputField
                          id="dni"
                          label="DNI"
                          register={register}
                          errors={errors}
                          disabled={!isEditing && showSavedInfo}
                          validation={{
                            required: true,
                            pattern: {
                              value: /^[0-9]{8}$/,
                              message: "Ingresa un DNI válido (8 dígitos)",
                            },
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <DisplayField
                          label="Nombre completo"
                          value={watch("fullName")}
                          onEdit={handleEdit}
                        />
                        <DisplayField
                          label="Correo electrónico"
                          value={watch("email")}
                        />
                        <DisplayField
                          label="Teléfono"
                          value={watch("phone")}
                          onEdit={handleEdit}
                        />
                        <DisplayField
                          label="DNI"
                          value={watch("dni")}
                          onEdit={handleEdit}
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <InputField
                id="fullName"
                label="Nombre completo"
                register={register}
                errors={errors}
                disabled={!isEditing && showSavedInfo}
                validation={{
                  required: true,
                  minLength: {
                    value: 3,
                    message: "El nombre debe tener al menos 3 caracteres",
                  },
                }}
              />
              <InputField
                id="email"
                label="Correo electrónico"
                register={register}
                errors={errors}
                disabled={!isEditing && showSavedInfo}
                validation={{
                  required: true,
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                    message: "Ingresa un correo electrónico válido",
                  },
                }}
              />
              <InputField
                id="phone"
                label="Teléfono"
                register={register}
                errors={errors}
                disabled={!isEditing && showSavedInfo}
                validation={{
                  required: true,
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message:
                      "Ingresa un número de teléfono válido (10 dígitos)",
                  },
                }}
              />
              <InputField
                id="dni"
                label="DNI"
                register={register}
                errors={errors}
                disabled={!isEditing && showSavedInfo}
                validation={{
                  required: true,
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: "Ingresa un DNI válido (8 dígitos)",
                  },
                }}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

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
              selectedValue ? "bg-gray-900 hover:bg-gray-800" : "bg-black"
            )}
          >
            {isSaving
              ? "Guardando..."
              : selectedValue
              ? "Continuar"
              : "Continuar"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* hola */

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