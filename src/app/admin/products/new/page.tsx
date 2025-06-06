"use client"

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Switch } from "@/components/ui/switch"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, X } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Label as UILabel } from '@/components/ui/label'
import Link from 'next/link'
import { useUser } from "@clerk/nextjs"
import { getStoreByOwnerId } from "@/services/storeService"
import { Store } from "@/types/store"

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }),
  price: z.string().min(1, {
    message: 'El precio es requerido.',
  }),
  stock: z.string().min(1, {
    message: 'El stock es requerido.',
  }),
  category: z.string({
    required_error: 'Por favor selecciona una categoría.',
  }),
  subcategory: z.string().optional(),
  active: z.boolean(),
  freeShipping: z.boolean(),
  specialOffer: z.boolean(),
  newArrival: z.boolean(),
  featuredBrand: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  sales: z.number().min(0).optional(),
  srcUrl: z.string().optional(),
  discount: z.object({
    percentage: z.number().min(0).max(100),
    amount: z.number().min(0)
  }),
  promos: z.array(z.object({
    cantidad: z.number().min(2).max(100),
    descuento: z.number().min(0.01).max(100),
    precioFinal: z.number()
  })).optional(),
  videos: z.array(z.string()).optional(),
  externalLinks: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  shippingInfo: z.object({
    weight: z.number().optional(),
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number()
    }).optional(),
    shippingClass: z.string().optional()
  }).optional()
})

type FormValues = z.infer<typeof formSchema>

const categories = [
  { id: 'electronics', name: 'Electrónicos' },
  { id: 'clothing', name: 'Ropa' },
  { id: 'books', name: 'Libros' },
  { id: 'home', name: 'Hogar' },
]

export default function NewProductPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [mainImage, setMainImage] = useState<string>('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [promos, setPromos] = useState<Array<{ cantidad: number; descuento: number; precioFinal: number }>>([])
  const [store, setStore] = useState<Store | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in")
    }
  }, [isSignedIn, router])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      subcategory: '',
      active: true,
      freeShipping: false,
      specialOffer: false,
      newArrival: false,
      featuredBrand: false,
      rating: 0,
      sales: 0,
      srcUrl: '',
      discount: {
        percentage: 0,
        amount: 0
      },
      promos: [],
      videos: [],
      externalLinks: [],
      specifications: {},
      shippingInfo: {
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0
        },
        shippingClass: "standard"
      }
    },
  })

  const handleMainImageChange = async (urls: string[]) => {
    try {
      setIsUploading(true)
      if (urls.length > 0) {
        setMainImage(urls[0])
        form.setValue('srcUrl', urls[0])
      }
    } catch (error) {
      console.error('Error al subir imagen principal:', error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen principal",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleGalleryImagesChange = async (urls: string[]) => {
    setGalleryImages(urls)
  }

  const handlePromoChange = (
    idx: number,
    field: "cantidad" | "descuento",
    value: number
  ) => {
    setPromos((prev) => {
      const newPromos = [...prev];
      const precioUnitario = Number(form.getValues("price")) || 0;
      const cantidad = field === "cantidad" ? value : newPromos[idx]?.cantidad || 1;
      const descuento = field === "descuento" ? value : newPromos[idx]?.descuento || 0;
      const precioFinal = Math.round(precioUnitario * cantidad * (1 - descuento / 100));
      newPromos[idx] = { cantidad, descuento, precioFinal };
      form.setValue("promos", newPromos);
      return newPromos;
    });
  };

  const agregarPromo = () => {
    if (promos.length < 4) {
      const precioUnitario = Number(form.getValues("price")) || 0;
      setPromos((prev) => {
        const newPromos = [...prev, {
          cantidad: 2,
          descuento: 0,
          precioFinal: precioUnitario * 2
        }];
        form.setValue("promos", newPromos);
        return newPromos;
      });
    }
  };

  const eliminarPromo = (idx: number) => {
    setPromos((prev) => {
      const newPromos = prev.filter((_, i) => i !== idx);
      form.setValue("promos", newPromos);
      return newPromos;
    });
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  async function onSubmit(values: FormValues) {
    if (!store) {
      toast({
        title: "Error",
        description: "No se encontró la tienda asociada.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      if (!mainImage) {
        toast({
          title: "Error",
          description: "Debes subir una imagen principal del producto",
          variant: "destructive"
        })
        return
      }

      const productData = {
        ...values,
        storeId: store.id,
        title: values.name,
        price: parseFloat(values.price),
        stock: parseInt(values.stock),
        images: [mainImage, ...galleryImages],
        srcUrl: mainImage,
        rating: values.rating,
        sales: values.sales,
        promos: promos,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      console.log('Datos a guardar:', productData)

      const docRef = await addDoc(collection(db, "products"), productData)
      console.log('Referencia del documento creado:', docRef)
      if (!docRef) {
        throw new Error('No se pudo crear el producto en la base de datos')
      }

      toast({
        title: "Producto creado",
        description: "El producto ha sido creado correctamente",
        variant: "default"
      })
      router.push('/admin/products')
      return
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: "Error",
        description: `No se pudo crear el producto. ${error instanceof Error ? error.message : error}`,
        variant: "destructive"
      })
      return
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Producto</h2>
        <p className="text-muted-foreground">
          Agrega un nuevo producto a tu tienda
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del producto" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este es el nombre que verán tus clientes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Subcategoría" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu producto"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Una descripción detallada del producto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ventas</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="discount.percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descuento (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" step="0.01" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="discount.amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descuento (monto fijo)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Promociones */}
            <div className="sm:col-span-6 bg-gray-50 rounded-lg p-4">
              <UILabel className="block mb-2 text-lg font-semibold">Promociones</UILabel>
              {promos.length === 0 && (
                <div className="text-sm text-muted-foreground mb-2">
                  No hay promociones agregadas.
                </div>
              )}
              <div className="grid gap-4">
                {promos.map((promo, idx) => {
                  const precioUnitario = Number(form.getValues("price")) || 0;
                  const precioNormal = precioUnitario * promo.cantidad;
                  const precioConDescuento = precioNormal - (precioNormal * promo.descuento / 100);
                  const gananciaTotal = precioConDescuento - precioUnitario * promo.cantidad;

                  return (
                    <div key={idx} className="flex items-end gap-3 bg-white rounded-md p-3 shadow-sm border">
                      <div>
                        <UILabel className="text-xs">Cantidad</UILabel>
                        <Input
                          type="number"
                          min={2}
                          max={100}
                          value={promo.cantidad}
                          onChange={(e) => handlePromoChange(idx, "cantidad", Number(e.target.value))}
                          placeholder="Cantidad"
                          className="w-24"
                        />
                      </div>
                      <div>
                        <UILabel className="text-xs">% Desc.</UILabel>
                        <Input
                          type="number"
                          min={0.01}
                          max={100}
                          step={0.01}
                          value={promo.descuento}
                          onChange={(e) => handlePromoChange(idx, "descuento", Number(e.target.value))}
                          placeholder="% Desc."
                          className="w-24"
                        />
                      </div>
                      <div>
                        <UILabel className="text-xs">Precio Normal</UILabel>
                        <Input
                          type="text"
                          value={formatearPrecio(precioNormal)}
                          readOnly
                          className="w-32 bg-gray-100"
                          placeholder="Precio normal"
                        />
                      </div>
                      <div>
                        <UILabel className="text-xs">Precio con Descuento</UILabel>
                        <Input
                          type="text"
                          value={formatearPrecio(precioConDescuento)}
                          readOnly
                          className="w-32 bg-gray-100"
                          placeholder="Precio con descuento"
                        />
                      </div>
                      <div>
                        <UILabel className="text-xs">Descuento Total</UILabel>
                        <Input
                          type="text"
                          value={formatearPrecio(gananciaTotal)}
                          readOnly
                          className="w-32 bg-gray-100"
                          placeholder="Ganancia total"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => eliminarPromo(idx)}
                        title="Eliminar"
                      >
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>
                  );
                })}
              </div>
              {promos.length < 4 && (
                <Button type="button" onClick={agregarPromo} className="mt-4">
                  Agregar Promo
                </Button>
              )}
            </div>

            {/* Imagen principal */}
            <div className="sm:col-span-6 mb-8 flex flex-col items-center">
              <UILabel className="mb-4 text-lg font-semibold">Imagen principal</UILabel>
              <div className="w-full max-w-xs">
                <ImageUploader
                  onImagesChange={handleMainImageChange}
                  maxImages={1}
                  maxSizeMB={2}
                  disabled={isUploading}
                />
                {mainImage && (
                  <div className="mt-4">
                    <img 
                      src={mainImage} 
                      alt="Imagen principal" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Sube la imagen principal del producto. Máximo 2MB.
              </p>
            </div>

            {/* Galería de imágenes */}
            <div className="sm:col-span-6">
              <UILabel className="block mb-2 text-lg font-semibold">Galería de imágenes</UILabel>
              <ImageUploader
                onImagesChange={handleGalleryImagesChange}
                maxImages={2}
                maxSizeMB={2}
                disabled={isUploading}
              />
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {galleryImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Imagen ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Sube imágenes adicionales para la galería. Máximo 2 imágenes, 2MB cada una.
              </p>
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <UILabel className="text-base">Activo</UILabel>
                      <FormDescription>
                        Este producto será visible en la tienda
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="freeShipping"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <UILabel className="text-base">Envío Gratis</UILabel>
                      <FormDescription>
                        Este producto tiene envío gratis
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="specialOffer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <UILabel className="text-base">Oferta Especial</UILabel>
                      <FormDescription>
                        Marca este producto como oferta especial
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="newArrival"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <UILabel className="text-base">Nuevo</UILabel>
                      <FormDescription>
                        Marca este producto como nuevo
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="featuredBrand"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <UILabel className="text-base">Marca Destacada</UILabel>
                      <FormDescription>
                        Marca este producto como marca destacada
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isLoading || isUploading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isUploading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Producto'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 