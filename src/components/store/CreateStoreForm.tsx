"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateStoreForm() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Debes iniciar sesión para crear una tienda");
      return;
    }

    setLoading(true);
    try {
      const storeData = {
        ...formData,
        ownerId: user.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        categories: [],
        rating: 0,
        totalSales: 0,
        totalProducts: 0,
        contactInfo: {
          email: user.primaryEmailAddress?.emailAddress || '',
          phone: formData.phone,
          address: formData.address
        },
        settings: {
          shippingEnabled: true
        }
      };

      const docRef = await addDoc(collection(db, "stores"), storeData);
      toast.success("Tienda creada exitosamente");
      router.push(`/store/${docRef.id}`);
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error("Error al crear la tienda");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Nombre de la tienda</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Mi Tienda"
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Describe tu tienda..."
        />
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Calle y número"
        />
      </div>

      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          placeholder="Ciudad"
        />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+54 11 1234-5678"
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear tienda"}
      </Button>
    </form>
  );
} 