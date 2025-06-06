"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Importar componentes de Shadcn UI necesarios
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Paper, Container, Typography, Box, Divider, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

// Definir la estructura de datos del formulario
interface StoreFormData {
  basicData: {
    localName: string;
    galleryType: string;
    localNumber: number | null;
  };
  contactInfo: {
    whatsapp: string;
    phoneNumber?: string; // Opcional
    email?: string; // Opcional
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
  faqs: Array<{ // Implementado para 3 predefinidas, dinámicas requiere más UI
    question: string;
    answer: string;
  }>;
  description: string;
  termsAccepted: boolean; // Checkbox obligatorio
}

// Tipo auxiliar para hacer todas las propiedades, incluyendo las anidadas, opcionales.
// Esto nos permitirá tener un estado de errores que "refleje" la estructura del formulario.
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

// Definir el tipo para los errores de validación
// Las hojas serán strings (el mensaje de error)
type ValidationErrors = {
    basicData?: {
        localName?: string;
        galleryType?: string;
        localNumber?: string;
    };
    contactInfo?: {
        whatsapp?: string;
        phoneNumber?: string;
        email?: string;
    };
    schedule?: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
    };
    features?: {
        wholesale?: string;
        retail?: string;
        cardPayment?: string;
        tryOnClothes?: string;
        mercadoPago?: string;
        meetingPoint?: string;
        videoCalls?: string;
        shipping?: string;
    };
    faqs?: Array<{
        question?: string;
        answer?: string;
    }>;
    description?: string | undefined;
    termsAccepted?: string | undefined;
};

// Estado inicial del formulario con la nueva estructura
const initialFormData: StoreFormData = {
  basicData: {
    localName: "",
    galleryType: "Calle", // Default para el dropdown
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
  faqs: [
    { question: "¿Cómo son los cambios y devoluciones?", answer: "" },
    { question: "¿Cuáles son los métodos de pago?", answer: "" },
    { question: "¿Realizan envíos internacionales?", answer: "" },
  ],
  description: "",
  termsAccepted: false,
};

// Componentes estilizados
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export default function CreateStoreForm() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  
  // Estados para posibles errores de validación con el tipo simplificado
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    basicData: {},
    contactInfo: {},
    schedule: {},
    features: {},
    faqs: [],
    description: undefined,
    termsAccepted: undefined,
  });

  // Redireccionar si no está autenticado (similar a la página /store/new)
   useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in?redirect_url=/store/new");
    }
  }, [isLoaded, isSignedIn, router]);


  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
        basicData: {},
        contactInfo: {},
        schedule: {},
        features: {},
        faqs: formData.faqs.map(() => ({})),
        description: undefined,
        termsAccepted: undefined,
    };
    let isValid = true;

    // Validaciones de Datos Básicos
    if (!formData.basicData.localName) {
        errors.basicData = { ...errors.basicData, localName: "El nombre del local es requerido." };
        isValid = false;
    } else if (formData.basicData.localName.length > 50) {
        errors.basicData = { ...errors.basicData, localName: "Máx. 50 caracteres." };
        isValid = false;
    }

    if (formData.basicData.localNumber === null || formData.basicData.localNumber < 0) {
        errors.basicData = { ...errors.basicData, localNumber: "El número de local es requerido." };
        isValid = false;
    }

    // Validaciones de Medios de Contacto
    if (!formData.contactInfo.whatsapp) {
        errors.contactInfo = { ...errors.contactInfo, whatsapp: "El número de Whatsapp es requerido." };
        isValid = false;
    }

    // Validaciones de Preguntas Frecuentes
    formData.faqs.forEach((faq, index) => {
        if (!errors.faqs) errors.faqs = [];
        if (!errors.faqs[index]) errors.faqs[index] = {};

        if (!faq.question) {
            errors.faqs[index] = { ...errors.faqs[index], question: "La pregunta es requerida." };
            isValid = false;
        } else if (faq.question.length > 100) {
            errors.faqs[index] = { ...errors.faqs[index], question: "Máx. 100 caracteres." };
            isValid = false;
        }

        if (!faq.answer) {
            errors.faqs[index] = { ...errors.faqs[index], answer: "La respuesta es requerida." };
            isValid = false;
        } else if (faq.answer.length > 500) {
            errors.faqs[index] = { ...errors.faqs[index], answer: "Máx. 500 caracteres." };
            isValid = false;
        }
    });

    // Validación de Descripción
    if (formData.description.length > 500) {
        errors.description = "Máx. 500 caracteres.";
        isValid = false;
    }

    // Validación de Términos y Condiciones
    if (!formData.termsAccepted) {
        errors.termsAccepted = "Debes aceptar los términos y condiciones.";
        isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn || !user?.id) {
      toast.error("Debes iniciar sesión para crear una tienda");
      router.replace("/sign-in?redirect_url=/store/new");
      return;
    }

    if (!validateForm()) {
        toast.error("Por favor, corrige los errores del formulario.");
        return;
    }

    setLoading(true);
    try {
      // Preparar datos para Firestore
      const storeDataForFirestore = {
        ...formData.basicData,
         // *** IMPORTANTE: Hashear la contraseña aquí antes de guardar ***
        // password: await hashPassword(formData.basicData.password), // Ejemplo: implementar hashPassword
        galleryType: formData.basicData.galleryType,
        localNumber: formData.basicData.localNumber,
        contactInfo: formData.contactInfo,
        schedule: formData.schedule,
        features: formData.features,
        faqs: formData.faqs,
        description: formData.description,
        ownerId: user.id, // ID del usuario de Clerk como propietario
        ownerEmail: user.primaryEmailAddress?.emailAddress || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        rating: 0,
        totalSales: 0,
        totalProducts: 0,
      };

      console.log("Datos de la tienda a crear (Firestore):", storeDataForFirestore);
      
      // Agregar documento a Firestore
      const docRef = await addDoc(collection(db, "stores"), storeDataForFirestore);
      console.log("Tienda creada con ID:", docRef.id);
      
      toast.success("Tienda creada exitosamente");
      router.push(`/store/${docRef.id}`); // Redirigir a la página de la tienda recién creada
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error("Error al crear la tienda");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en campos anidados (basicData, contactInfo, features, faqs)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    if (section && field) {
        setFormData(prev => {
            const sectionData = prev[section as keyof StoreFormData];
            if (typeof sectionData === 'object' && sectionData !== null) {
                return {
                    ...prev,
                    [section]: {
                        ...sectionData,
                        [field]: value
                    }
                };
            }
            return prev;
        });
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
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

   const handleSelectChange = (name: keyof StoreFormData['schedule'] | 'galleryType', value: string) => {
     if (name === 'galleryType') {
       setFormData(prev => ({
         ...prev,
         basicData: {
           ...prev.basicData,
           galleryType: value
         }
       }));
     } else {
       // Asumimos campos de horario
       setFormData(prev => ({
         ...prev,
         schedule: {
           ...prev.schedule,
           [name]: value
         }
       }));
     }
   };

   const handleFAQChange = (index: number, field: keyof StoreFormData['faqs'][number], value: string) => {
     setFormData(prev => {
       const newFaqs = [...prev.faqs];
       newFaqs[index] = { ...newFaqs[index], [field]: value };
       return { ...prev, faqs: newFaqs };
     });
   };

   const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     const numValue = value === '' ? null : parseInt(value, 10);
     setFormData(prev => ({
       ...prev,
       basicData: {
         ...prev.basicData,
         localNumber: numValue
       }
     }));
   };

   const handleTermsChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, termsAccepted: checked }));
   };

   const handleScheduleChange = (day: keyof StoreFormData['schedule'], value: string) => {
     setFormData(prev => ({
       ...prev,
       schedule: {
         ...prev.schedule,
         [day]: value
       }
     }));
   };

   const handleGeneralScheduleToggle = (checked: boolean) => {
     setFormData(prev => ({
       ...prev,
       schedule: {
         ...prev.schedule,
         useGeneralSchedule: checked,
         // Si se activa el horario general, aplicarlo a todos los días
         ...(checked ? {
           monday: prev.schedule.generalSchedule,
           tuesday: prev.schedule.generalSchedule,
           wednesday: prev.schedule.generalSchedule,
           thursday: prev.schedule.generalSchedule,
           friday: prev.schedule.generalSchedule,
           saturday: prev.schedule.generalSchedule,
           sunday: prev.schedule.generalSchedule,
         } : {})
       }
     }));
   };

  // Mostrar estado de carga o nada si no está autenticado
  if (!isLoaded || !isSignedIn) {
    // Si isLoaded es true pero !isSignedIn, useEffect redirigirá.
    // Mientras carga, o si la redirección aún no ocurre, mostramos null o un spinner simple.
     return (
       <div className="flex justify-center items-center h-screen">
         <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin border-t-blue-500"></div>
       </div>
     );
  }

  // Si está autenticado, mostrar el formulario
  return (
    <Container maxWidth="lg">
      <form onSubmit={handleSubmit}>
        <StyledPaper>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Crear Nueva Tienda
          </Typography>

          {/* Sección: Datos Básicos */}
          <FormSection>
            <SectionTitle variant="h5">Datos Básicos</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basicData.localName">Nombre del local <span className="text-red-500">*</span></Label>
                <Input
                  id="basicData.localName"
                  name="basicData.localName"
                  value={formData.basicData.localName}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className={!!validationErrors.basicData?.localName ? "border-red-500" : ""}
                />
                 {validationErrors.basicData?.localName && <p className="text-red-500 text-sm mt-1">{validationErrors.basicData.localName}</p>}
              </div>
              <div>
                <Label htmlFor="basicData.galleryType">Galería <span className="text-red-500">*</span></Label>
                 <Select onValueChange={(value) => handleSelectChange('galleryType', value)} value={formData.basicData.galleryType}>
                   <SelectTrigger id="basicData.galleryType" className={!!validationErrors.basicData?.galleryType ? "border-red-500" : ""}>
                     <SelectValue placeholder="Selecciona un tipo" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Calle">Calle</SelectItem>
                     <SelectItem value="Galeria">Galería</SelectItem>
                     {/* Agrega más opciones según sea necesario */}
                   </SelectContent>
                 </Select>
                  {validationErrors.basicData?.galleryType && <p className="text-red-500 text-sm mt-1">{validationErrors.basicData.galleryType}</p>}
               </div>
              <div>
                <Label htmlFor="basicData.localNumber">Nº local <span className="text-red-500">*</span></Label>
                <Input
                  id="basicData.localNumber"
                  name="basicData.localNumber"
                  type="number"
                  value={formData.basicData.localNumber === null ? '' : formData.basicData.localNumber}
                  onChange={handleLocalNumberChange}
                  required
                  min={0}
                  className={!!validationErrors.basicData?.localNumber ? "border-red-500" : ""}
                />
                 {validationErrors.basicData?.localNumber && <p className="text-red-500 text-sm mt-1">{validationErrors.basicData.localNumber}</p>}
              </div>
            </div>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          {/* Sección: Medios de Contacto */}
          <FormSection>
            <SectionTitle variant="h5">Medios de Contacto</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contactInfo.whatsapp">Whatsapp <span className="text-red-500">*</span></Label>
                <Input
                  id="contactInfo.whatsapp"
                  name="contactInfo.whatsapp"
                  value={formData.contactInfo.whatsapp}
                  onChange={handleInputChange}
                  required
                  className={!!validationErrors.contactInfo?.whatsapp ? "border-red-500" : ""}
                />
                 {validationErrors.contactInfo?.whatsapp && <p className="text-red-500 text-sm mt-1">{validationErrors.contactInfo.whatsapp}</p>}
              </div>
              <div>
                <Label htmlFor="contactInfo.phoneNumber">Teléfono para llamadas</Label>
                <Input
                  id="contactInfo.phoneNumber"
                  name="contactInfo.phoneNumber"
                  value={formData.contactInfo.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="contactInfo.email">Email de contacto</Label>
                <Input
                  id="contactInfo.email"
                  name="contactInfo.email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={handleInputChange}
                  // NOTA: Validar formato de email requiere más lógica o usar validación nativa del input type email
                />
              </div>
            </div>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          {/* Sección: Horarios */}
          <FormSection>
            <SectionTitle variant="h5">Horarios</SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configura los horarios de atención de tu tienda.
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="useGeneralSchedule"
                    checked={formData.schedule.useGeneralSchedule}
                    onCheckedChange={(checked) => handleGeneralScheduleToggle(typeof checked === 'boolean' ? checked : false)}
                  />
                  <Label htmlFor="useGeneralSchedule">Usar horario general para todos los días</Label>
                </div>

                {formData.schedule.useGeneralSchedule ? (
                  <div>
                    <Label htmlFor="generalSchedule">Horario General</Label>
                    <Select 
                      onValueChange={(value) => handleScheduleChange('generalSchedule', value)} 
                      value={formData.schedule.generalSchedule}
                    >
                      <SelectTrigger id="generalSchedule">
                        <SelectValue placeholder="Selecciona un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:00 - 18:00">9:00 - 18:00</SelectItem>
                        <SelectItem value="10:00 - 19:00">10:00 - 19:00</SelectItem>
                        <SelectItem value="8:00 - 17:00">8:00 - 17:00</SelectItem>
                        <SelectItem value="Cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'monday', label: 'Lunes' },
                      { key: 'tuesday', label: 'Martes' },
                      { key: 'wednesday', label: 'Miércoles' },
                      { key: 'thursday', label: 'Jueves' },
                      { key: 'friday', label: 'Viernes' },
                      { key: 'saturday', label: 'Sábado' },
                      { key: 'sunday', label: 'Domingo' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <Label htmlFor={`schedule.${key}`} className="w-24">{label}</Label>
                        <Select 
                          onValueChange={(value) => handleScheduleChange(key as Exclude<keyof StoreFormData['schedule'], 'useGeneralSchedule' | 'generalSchedule'>, value)} 
                          value={formData.schedule[key as Exclude<keyof StoreFormData['schedule'], 'useGeneralSchedule' | 'generalSchedule'>]}
                        >
                          <SelectTrigger id={`schedule.${key}`}>
                            <SelectValue placeholder="Selecciona un horario" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9:00 - 18:00">9:00 - 18:00</SelectItem>
                            <SelectItem value="10:00 - 19:00">10:00 - 19:00</SelectItem>
                            <SelectItem value="8:00 - 17:00">8:00 - 17:00</SelectItem>
                            <SelectItem value="Cerrado">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          {/* Sección: Características */}
          <FormSection>
            <SectionTitle variant="h5">Características</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(formData.features).map(feature => {
                const featureKey = feature as keyof StoreFormData['features'];
                const featureLabel = featureKey.replace(/([A-Z])/g, ' $1').trim().replace(/^(.)/, (match) => match.toUpperCase());
                return (
                  <div key={featureKey} className="flex items-center space-x-2">
                    <Checkbox
                      id={`features.${featureKey}`}
                      checked={formData.features[featureKey]}
                      onCheckedChange={(checked) => handleCheckboxChange(featureKey, typeof checked === 'boolean' ? checked : false)}
                    />
                    <Label htmlFor={`features.${featureKey}`}>{featureLabel}</Label>
                  </div>
                );
              })}
            </div>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          {/* Sección: Preguntas Frecuentes */}
          <FormSection>
            <SectionTitle variant="h5">Preguntas Frecuentes</SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Edita las preguntas predefinidas. Campos marcados con <span className="text-red-500">*</span> son obligatorios.
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="col-span-1">
                  <Card variant="outlined">
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`faqs.${index}.question`}>Pregunta <span className="text-red-500">*</span></Label>
                          <Input
                            id={`faqs.${index}.question`}
                            name={`faqs.${index}.question`}
                            value={faq.question}
                            onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                            required
                            maxLength={100}
                            className={!!validationErrors.faqs?.[index]?.question ? "border-red-500" : ""}
                          />
                           {validationErrors.faqs?.[index]?.question && <p className="text-red-500 text-sm mt-1">{validationErrors.faqs[index].question}</p>}
                        </div>
                        <div>
                          <Label htmlFor={`faqs.${index}.answer`}>Respuesta <span className="text-red-500">*</span></Label>
                          <Textarea
                            id={`faqs.${index}.answer`}
                            name={`faqs.${index}.answer`}
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                            required
                            maxLength={500}
                            className={!!validationErrors.faqs?.[index]?.answer ? "border-red-500" : ""}
                          />
                            {validationErrors.faqs?.[index]?.answer && <p className="text-red-500 text-sm mt-1">{validationErrors.faqs[index].answer}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          {/* Sección: Descripción */}
          <FormSection>
            <SectionTitle variant="h5">Descripción</SectionTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Breve descripción de tu local (máx. 500 caracteres).
            </Typography>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                className={!!validationErrors.description ? "border-red-500" : ""}
              />
               {validationErrors.description && <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>}
            </div>
          </FormSection>

          <Divider sx={{ my: 4 }} />

          {/* Sección: Términos y Condiciones */}
          <FormSection>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="termsAccepted"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => handleTermsChange(typeof checked === 'boolean' ? checked : false)}
                className={!!validationErrors.termsAccepted ? "border-red-500" : ""}
              />
              <Label htmlFor="termsAccepted">
                Acepto los <a href="/terms" className="underline" target="_blank">términos y condiciones</a> <span className="text-red-500">*</span>
              </Label>
            </div>
             {validationErrors.termsAccepted && <p className="text-red-500 text-sm mt-1">{validationErrors.termsAccepted}</p>}
          </FormSection>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? "Creando..." : "Crear tienda"}
            </Button>
          </Box>
        </StyledPaper>
      </form>
    </Container>
  );
} 