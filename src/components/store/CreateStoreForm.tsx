"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createStore } from "@/services/storeService";
import { ImageUploader } from "@/components/admin/ImageUploader";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un email válido.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateStoreForm() {
  const { user } = useAuth0();
  const router = useRouter();
  const { toast } = useToast();
  const [logo, setLogo] = useState<string>("");
  const [banner, setBanner] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      email: user?.email || "",
      phone: "",
      address: "",
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user?.sub) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una tienda.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const storeData = {
        name: data.name,
        description: data.description,
        logo,
        banner,
        ownerId: user.sub,
        contactInfo: {
          email: data.email,
          phone: data.phone,
          address: data.address,
          socialMedia: {
            facebook: data.facebook || undefined,
            instagram: data.instagram || undefined,
            twitter: data.twitter || undefined,
          },
        },
        categories: [],
        settings: {
          shippingEnabled: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active' as 'active' | 'inactive' | 'suspended',
        rating: 0,
        totalSales: 0,
        totalProducts: 0
      };

      const store = await createStore(storeData);
      toast({
        title: "¡Éxito!",
        description: "Tu tienda ha sido creada correctamente.",
      });
      router.push(`/store/${store.id}`);
    } catch (error) {
      console.error("Error creating store:", error);
      toast({
        title: "Error",
        description: "Hubo un error al crear la tienda. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de la tienda</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Mi Tienda"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Describe tu tienda..."
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label>Logo de la tienda</Label>
          <ImageUploader
            onImagesChange={(urls) => setLogo(urls[0] || '')}
            initialImages={logo ? [logo] : []}
            maxImages={1}
            maxSizeMB={2}
          />
        </div>

        <div>
          <Label>Banner de la tienda</Label>
          <ImageUploader
            onImagesChange={(urls) => setBanner(urls[0] || '')}
            initialImages={banner ? [banner] : []}
            maxImages={1}
            maxSizeMB={2}
          />
        </div>

        <div>
          <Label htmlFor="email">Email de contacto</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="contacto@mitienda.com"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input
            id="phone"
            {...form.register("phone")}
            placeholder="+54 11 1234-5678"
          />
        </div>

        <div>
          <Label htmlFor="address">Dirección (opcional)</Label>
          <Input
            id="address"
            {...form.register("address")}
            placeholder="Calle Principal 123"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Redes sociales (opcionales)</h3>
          
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              {...form.register("facebook")}
              placeholder="https://facebook.com/mitienda"
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              {...form.register("instagram")}
              placeholder="https://instagram.com/mitienda"
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              {...form.register("twitter")}
              placeholder="https://twitter.com/mitienda"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creando tienda..." : "Crear tienda"}
      </Button>
    </form>
  );
} 