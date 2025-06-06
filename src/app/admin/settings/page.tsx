"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ControllerRenderProps } from "react-hook-form"
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const formSchema = z.object({
  storeName: z.string().min(2, {
    message: "El nombre de la tienda debe tener al menos 2 caracteres.",
  }),
  storeDescription: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  storeEmail: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
  storePhone: z.string().min(10, {
    message: "El teléfono debe tener al menos 10 caracteres.",
  }),
  storeCurrency: z.string().min(1, {
    message: "La moneda es requerida.",
  }),
  storeLanguage: z.string().min(2, {
    message: "El idioma es requerido.",
  }),
  storeTimezone: z.string().min(2, {
    message: "La zona horaria es requerida.",
  }),
})

type FormValues = z.infer<typeof formSchema>

const defaultLocations = [
  { nombre: 'Tienda 1', direccion: 'Av congreso 5108, Villa urquiza' },
  { nombre: 'Tienda 2', direccion: 'Juan dalton 1064, Pablo Nogues' },
]

export default function SettingsPage() {
  // console.log("SettingsPage renderizado");
  const [isLoading, setIsLoading] = useState(false)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isStoreOpen, setIsStoreOpen] = useState(true)
  const [locations, setLocations] = useState(defaultLocations)

  // Leer configuración al cargar
  useEffect(() => {
    async function fetchSettings() {
      const docRef = doc(db, 'settings', 'general')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        form.reset({
          ...data,
        })
        setLocations(data.locations || defaultLocations)
      }
    }
    fetchSettings()
    // eslint-disable-next-line
  }, [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      storeEmail: "",
      storePhone: "",
      storeCurrency: "",
      storeLanguage: "",
      storeTimezone: "",
    },
  })

  async function onSubmit(values: FormValues) {
    // console.log("onSubmit ejecutado", values)
    setIsLoading(true)
    try {
      console.log("Datos a guardar:", { ...values, locations })
      await setDoc(doc(db, 'settings', 'general'), {
        ...values,
        locations,
      })
      toast.success("Configuración guardada correctamente")
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar la configuración")
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para manejar ubicaciones
  const handleLocationChange = (idx: number, field: 'nombre' | 'direccion', value: string) => {
    setLocations(prev => {
      const arr = [...prev]
      arr[idx] = { ...arr[idx], [field]: value }
      return arr
    })
  }
  const addLocation = () => {
    setLocations(prev => [...prev, { nombre: '', direccion: '' }])
  }
  const removeLocation = (idx: number) => {
    setLocations(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Administra la configuración de tu tienda y preferencias de la cuenta.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              General
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Apariencia
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Notificaciones
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Seguridad
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Integraciones
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href="/admin/settings/delivery-zones">Zonas de Entrega</a>
            </Button>
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>
                    Configura la información básica de tu tienda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storeName"> }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Tienda</FormLabel>
                        <FormControl>
                          <Input placeholder="Mi Tienda" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este es el nombre que aparecerá en tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storeDescription"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storeDescription"> }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu tienda..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Una breve descripción de tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>
                    Configura la información de contacto de tu tienda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="storeEmail"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storeEmail"> }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="tienda@ejemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          El correo electrónico de contacto de tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storePhone"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storePhone"> }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormDescription>
                          El número de teléfono de contacto de tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ubicaciones de la Tienda</CardTitle>
                  <CardDescription>Gestiona las sucursales o puntos de retiro de tu tienda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {locations.map((loc, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">Nombre</Label>
                        <Input
                          value={loc.nombre}
                          onChange={e => handleLocationChange(idx, 'nombre', e.target.value)}
                          placeholder="Nombre de la tienda"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Dirección</Label>
                        <Input
                          value={loc.direccion}
                          onChange={e => handleLocationChange(idx, 'direccion', e.target.value)}
                          placeholder="Dirección completa"
                        />
                      </div>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeLocation(idx)} title="Eliminar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={addLocation} className="mt-2">Agregar Ubicación</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferencias</CardTitle>
                  <CardDescription>
                    Configura las preferencias de tu tienda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="storeCurrency"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storeCurrency"> }) => (
                      <FormItem>
                        <FormLabel>Moneda</FormLabel>
                        <FormControl>
                          <Input placeholder="USD" {...field} />
                        </FormControl>
                        <FormDescription>
                          La moneda principal de tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storeLanguage"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storeLanguage"> }) => (
                      <FormItem>
                        <FormLabel>Idioma</FormLabel>
                        <FormControl>
                          <Input placeholder="es" {...field} />
                        </FormControl>
                        <FormDescription>
                          El idioma principal de tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="storeTimezone"
                    render={({ field }: { field: ControllerRenderProps<FormValues, "storeTimezone"> }) => (
                      <FormItem>
                        <FormLabel>Zona Horaria</FormLabel>
                        <FormControl>
                          <Input placeholder="America/New_York" {...field} />
                        </FormControl>
                        <FormDescription>
                          La zona horaria de tu tienda.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de la Tienda</CardTitle>
                  <CardDescription>
                    Controla el estado de tu tienda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Modo Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">
                        Activa el modo mantenimiento para realizar cambios en tu tienda.
                      </p>
                    </div>
                    <Switch
                      checked={isMaintenanceMode}
                      onCheckedChange={setIsMaintenanceMode}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tienda Abierta</Label>
                      <p className="text-sm text-muted-foreground">
                        Controla si tu tienda está abierta o cerrada.
                      </p>
                    </div>
                    <Switch
                      checked={isStoreOpen}
                      onCheckedChange={setIsStoreOpen}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={isLoading} onClick={() => console.log("Botón submit clickeado")}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
} 