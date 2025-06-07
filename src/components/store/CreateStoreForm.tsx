"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Store, Phone, Mail, Clock, Info, CheckCircle2 } from "lucide-react";

interface StoreFormData {
  basicData: {
    localName: string;
    galleryType: string;
    localNumber: number | null;
  };
  contactInfo: {
    whatsapp: string;
    phoneNumber?: string;
    email?: string;
  };
  schedule: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    useGeneralSchedule: boolean;
    generalSchedule: string;
  };
  features: {
    wholesale: boolean;
    retail: boolean;
    cardPayment: boolean;
    tryOnClothes: boolean;
    mercadoPago: boolean;
    meetingPoint: boolean;
    videoCalls: boolean;
    shipping: boolean;
  };
  description: string;
  termsAccepted: boolean;
}

const initialFormData: StoreFormData = {
  basicData: {
    localName: "",
    galleryType: "Calle",
    localNumber: null,
  },
  contactInfo: {
    whatsapp: "",
    phoneNumber: "",
    email: "",
  },
  schedule: {
    monday: "Cerrado",
    tuesday: "Cerrado",
    wednesday: "Cerrado",
    thursday: "Cerrado",
    friday: "Cerrado",
    saturday: "Cerrado",
    sunday: "Cerrado",
    useGeneralSchedule: false,
    generalSchedule: "9:00 - 18:00",
  },
  features: {
    wholesale: false,
    retail: false,
    cardPayment: false,
    tryOnClothes: false,
    mercadoPago: false,
    meetingPoint: false,
    videoCalls: false,
    shipping: false,
  },
  description: "",
  termsAccepted: false,
};

export default function CreateStoreForm() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/store/new");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storeData = {
        ...formData,
        ownerId: user?.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "stores"), storeData);
      toast.success("¡Tienda creada exitosamente!");
      router.push(`/store/${docRef.id}`);
    } catch (error) {
      console.error("Error al crear la tienda:", error);
      toast.error("Error al crear la tienda. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: keyof StoreFormData, field: string, value: any) => {
    setFormData(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...(sectionData as Record<string, any>),
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [section]: value
      };
    });
  };

  const handleCheckboxChange = (name: keyof StoreFormData['features'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [name]: checked
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-lg font-medium mb-6">
              <Store className="w-5 h-5" />
              <span>Información Básica</span>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="localName">Nombre del Local</Label>
                <Input
                  id="localName"
                  value={formData.basicData.localName}
                  onChange={(e) => handleInputChange('basicData', 'localName', e.target.value)}
                  placeholder="Ej: Mi Tienda de Ropa"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="galleryType">Tipo de Local</Label>
                <Select
                  value={formData.basicData.galleryType}
                  onValueChange={(value) => handleInputChange('basicData', 'galleryType', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecciona el tipo de local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calle">Calle</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Galeria">Galería</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="localNumber">Número de Local</Label>
                <Input
                  id="localNumber"
                  type="number"
                  value={formData.basicData.localNumber || ''}
                  onChange={(e) => handleInputChange('basicData', 'localNumber', parseInt(e.target.value))}
                  placeholder="Ej: 123"
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-lg font-medium mb-6">
              <Phone className="w-5 h-5" />
              <span>Información de Contacto</span>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.contactInfo.whatsapp}
                  onChange={(e) => handleInputChange('contactInfo', 'whatsapp', e.target.value)}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Teléfono (opcional)</Label>
                <Input
                  id="phoneNumber"
                  value={formData.contactInfo.phoneNumber}
                  onChange={(e) => handleInputChange('contactInfo', 'phoneNumber', e.target.value)}
                  placeholder="Ej: 011 1234-5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo', 'email', e.target.value)}
                  placeholder="Ej: contacto@mitienda.com"
                  className="mt-1"
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-lg font-medium mb-6">
              <Clock className="w-5 h-5" />
              <span>Horarios y Características</span>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="useGeneralSchedule"
                    checked={formData.schedule.useGeneralSchedule}
                    onCheckedChange={(checked) => handleInputChange('schedule', 'useGeneralSchedule', checked)}
                  />
                  <Label htmlFor="useGeneralSchedule">Usar horario general para todos los días</Label>
                </div>
                {formData.schedule.useGeneralSchedule ? (
                  <div>
                    <Label htmlFor="generalSchedule">Horario General</Label>
                    <Input
                      id="generalSchedule"
                      value={formData.schedule.generalSchedule}
                      onChange={(e) => handleInputChange('schedule', 'generalSchedule', e.target.value)}
                      placeholder="Ej: 9:00 - 18:00"
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => {
                      const dayKey = day.toLowerCase() as keyof typeof formData.schedule;
                      const scheduleValue = formData.schedule[dayKey];
                      return (
                        <div key={day}>
                          <Label htmlFor={dayKey}>{day}</Label>
                          <Input
                            id={dayKey}
                            value={typeof scheduleValue === 'string' ? scheduleValue : ''}
                            onChange={(e) => handleInputChange('schedule', dayKey, e.target.value)}
                            placeholder="Ej: 9:00 - 18:00"
                            className="mt-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <Label>Características del Local</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => handleCheckboxChange(key as keyof StoreFormData['features'], checked as boolean)}
                      />
                      <Label htmlFor={key} className="text-sm">
                        {key === 'wholesale' ? 'Venta Mayorista' :
                         key === 'retail' ? 'Venta Minorista' :
                         key === 'cardPayment' ? 'Pago con Tarjeta' :
                         key === 'tryOnClothes' ? 'Prueba de Ropa' :
                         key === 'mercadoPago' ? 'Mercado Pago' :
                         key === 'meetingPoint' ? 'Punto de Encuentro' :
                         key === 'videoCalls' ? 'Video Llamadas' :
                         'Envíos'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-lg font-medium mb-6">
              <Info className="w-5 h-5" />
              <span>Información Adicional</span>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descripción del Local</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', '', e.target.value)}
                  placeholder="Describe tu local, los productos que ofreces y cualquier información relevante..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange('termsAccepted', '', checked)}
                />
                <Label htmlFor="termsAccepted" className="text-sm">
                  Acepto los términos y condiciones de uso
                </Label>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={cn(
              "w-5 h-5",
              currentStep > 1 ? "text-green-500" : "text-gray-400"
            )} />
            <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full",
                  index + 1 === currentStep ? "bg-black" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {renderStep()}

      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="w-32"
          >
            Anterior
          </Button>
        )}
        {currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            className={cn("w-32", currentStep === 1 ? "ml-auto" : "")}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="submit"
            className={cn("w-32", currentStep === 1 ? "ml-auto" : "")}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Tienda"}
          </Button>
        )}
      </div>
    </form>
  );
} 