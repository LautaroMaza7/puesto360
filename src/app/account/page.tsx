"use client";

import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  dni: string;
  createdAt?: any;
  updatedAt?: any;
  isFavorite?: boolean;
}

interface Address {
  id: string;
  address: string;
  city: string;
  deliveryMethod: string;
  postalCode: string;
  isFavorite?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export default function AccountPage() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !user?.sub) return;
      
      try {
        console.log("=== DATOS DE FIRESTORE ===");
        console.log("Email del usuario:", user.email);
        
        // Buscar perfiles por email en la colección profiles dentro de users
        const profilesRef = collection(db, `users/${user.email}/profiles`);
        const profilesSnapshot = await getDocs(profilesRef);
        
        console.log("\n=== PERFILES ENCONTRADOS ===");
        if (!profilesSnapshot.empty) {
          const userProfiles = profilesSnapshot.docs.map(doc => ({
            id: doc.id,
            fullName: doc.data().fullName || "",
            email: doc.data().email || "",
            phone: doc.data().phone || "",
            dni: doc.data().dni || "",
            createdAt: doc.data().createdAt || "",
            updatedAt: doc.data().updatedAt || "",
            isFavorite: doc.data().isFavorite || false
          })) as UserProfile[];
          
          console.log("Perfiles:", JSON.stringify(userProfiles, null, 2));
          setProfiles(userProfiles);
          
          // Seleccionar el perfil más reciente por defecto
          const latestProfile = userProfiles.reduce((latest, current) => {
            const latestDate = new Date(latest.createdAt || "");
            const currentDate = new Date(current.createdAt || "");
            return currentDate > latestDate ? current : latest;
          });
          
          console.log("Perfil seleccionado:", JSON.stringify(latestProfile, null, 2));
          setSelectedProfile(latestProfile);
          
          // Obtener direcciones del usuario
          const addressesRef = collection(db, `users/${user.email}/addresses`);
          const addressesSnapshot = await getDocs(addressesRef);
          
          console.log("\n=== DIRECCIONES ENCONTRADAS ===");
          const userAddresses: Address[] = [];
          addressesSnapshot.forEach((doc) => {
            const addressData = { 
              id: doc.id, 
              ...doc.data(),
              isFavorite: doc.data().isFavorite || false
            };
            userAddresses.push(addressData as Address);
            console.log("Dirección:", JSON.stringify(addressData, null, 2));
          });
          
          setAddresses(userAddresses);
        } else {
          console.log("No se encontraron perfiles para este email");
          setProfiles([]);
          setSelectedProfile(null);
          setAddresses([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error al cargar los datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchUserData();
    }
  }, [isAuthenticated, user, isLoading]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !editingProfile?.id || !user?.email) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, `users/${user.email}/profiles`, editingProfile.id), {
        ...editingProfile,
        updatedAt: serverTimestamp()
      });
      
      // Actualizar el perfil en el estado local
      setProfiles(profiles.map(p => p.id === editingProfile.id ? editingProfile : p));
      if (selectedProfile?.id === editingProfile.id) {
        setSelectedProfile(editingProfile);
      }
      
      toast.success("Perfil actualizado correctamente");
      setEditingProfile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.email) return;

    setSaving(true);
    try {
      const newProfileRef = doc(collection(db, `users/${user.email}/profiles`));
      const newProfile: UserProfile = {
        id: newProfileRef.id,
        fullName: editingProfile?.fullName || "",
        email: user.email,
        phone: editingProfile?.phone || "",
        dni: editingProfile?.dni || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: editingProfile?.isFavorite || false
      };
      
      await setDoc(newProfileRef, newProfile);
      
      setProfiles([...profiles, newProfile]);
      setSelectedProfile(newProfile);
      toast.success("Perfil creado correctamente");
      setEditingProfile(null);
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Error al crear el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!isAuthenticated || !user?.email) return;

    try {
      await deleteDoc(doc(db, `users/${user.email}/profiles`, profileId));
      setProfiles(profiles.filter(p => p.id !== profileId));
      
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(profiles.find(p => p.id !== profileId) || null);
      }
      
      toast.success("Perfil eliminado correctamente");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Error al eliminar el perfil");
    }
  };

  const handleToggleFavoriteProfile = async (profileId: string) => {
    if (!isAuthenticated || !user?.email) return;

    try {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      const newIsFavorite = !profile.isFavorite;
      
      // Actualizar en Firestore
      await updateDoc(doc(db, `users/${user.email}/profiles`, profileId), {
        isFavorite: newIsFavorite,
        updatedAt: serverTimestamp()
      });

      // Actualizar estado local
      const updatedProfiles = profiles.map(p => 
        p.id === profileId ? { ...p, isFavorite: newIsFavorite } : p
      );
      setProfiles(updatedProfiles);

      // Si se marca como favorito, desmarcar los demás
      if (newIsFavorite) {
        const otherProfiles = updatedProfiles.filter(p => p.id !== profileId);
        for (const otherProfile of otherProfiles) {
          if (otherProfile.isFavorite && otherProfile.id) {
            await updateDoc(doc(db, `users/${user.email}/profiles`, otherProfile.id), {
              isFavorite: false,
              updatedAt: serverTimestamp()
            });
          }
        }
        setProfiles(updatedProfiles.map(p => 
          p.id !== profileId ? { ...p, isFavorite: false } : p
        ));
      }

      toast.success(newIsFavorite ? "Perfil marcado como favorito" : "Perfil desmarcado como favorito");
    } catch (error) {
      console.error("Error toggling favorite profile:", error);
      toast.error("Error al actualizar el perfil favorito");
    }
  };

  const handleAddressUpdate = async (address: Address) => {
    if (!isAuthenticated || !user?.email) return;

    setSaving(true);
    try {
      const addressesRef = collection(db, `users/${user.email}/addresses`);
      
      if (editingAddress?.id) {
        // Actualizar dirección existente
        await updateDoc(doc(addressesRef, address.id), {
          ...address,
          updatedAt: serverTimestamp()
        });
        
        setAddresses(addresses.map(a => a.id === address.id ? address : a));
        toast.success("Dirección actualizada");
      } else {
        // Crear nueva dirección
        const newAddressRef = doc(addressesRef);
        const newAddress: Address = {
          address: address.address,
          city: address.city,
          deliveryMethod: address.deliveryMethod,
          postalCode: address.postalCode,
          id: newAddressRef.id,
          isFavorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(newAddressRef, newAddress);
        
        setAddresses([...addresses, newAddress]);
        toast.success("Dirección agregada");
      }
      
      setEditingAddress(null);
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Error al actualizar la dirección");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!isAuthenticated || !user?.email) return;

    try {
      const addressRef = doc(db, `users/${user.email}/addresses`, addressId);
      await deleteDoc(addressRef);
      setAddresses(addresses.filter(a => a.id !== addressId));
      toast.success("Dirección eliminada");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Error al eliminar la dirección");
    }
  };

  const handleToggleFavoriteAddress = async (addressId: string) => {
    if (!isAuthenticated || !user?.email) return;

    try {
      const address = addresses.find(a => a.id === addressId);
      if (!address) return;

      const newIsFavorite = !address.isFavorite;
      
      // Actualizar en Firestore
      await updateDoc(doc(db, `users/${user.email}/addresses`, addressId), {
        isFavorite: newIsFavorite,
        updatedAt: serverTimestamp()
      });

      // Actualizar estado local
      const updatedAddresses = addresses.map(a => 
        a.id === addressId ? { ...a, isFavorite: newIsFavorite } : a
      );
      setAddresses(updatedAddresses);

      // Si se marca como favorito, desmarcar los demás
      if (newIsFavorite) {
        const otherAddresses = updatedAddresses.filter(a => a.id !== addressId);
        for (const otherAddress of otherAddresses) {
          if (otherAddress.isFavorite) {
            await updateDoc(doc(db, `users/${user.email}/addresses`, otherAddress.id), {
              isFavorite: false,
              updatedAt: serverTimestamp()
            });
          }
        }
        setAddresses(updatedAddresses.map(a => 
          a.id !== addressId ? { ...a, isFavorite: false } : a
        ));
      }

      toast.success(newIsFavorite ? "Dirección marcada como favorita" : "Dirección desmarcada como favorita");
    } catch (error) {
      console.error("Error toggling favorite address:", error);
      toast.error("Error al actualizar la dirección favorita");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Acceso restringido</h2>
        <p className="mb-6">Debes iniciar sesión para acceder a tu cuenta.</p>
        <Button onClick={() => window.location.href = "/"}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Error de autenticación</h2>
        <p className="mb-6 text-red-500">{authError}</p>
        <div className="flex space-x-4">
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-frame mx-auto px-4 xl:px-0 py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Perfiles</TabsTrigger>
          <TabsTrigger value="addresses">Direcciones</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mis Perfiles</h2>
                <Button
                  onClick={() => setEditingProfile({
                    id: "",
                    fullName: "",
                    email: user?.email || "",
                    phone: "",
                    dni: "",
                    createdAt: "",
                    updatedAt: "",
                    isFavorite: false
                  })}
                >
                  Agregar Perfil
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`border rounded-lg p-4 relative hover:shadow-md transition-shadow}`}
                  >
                    <div className="absolute top-4 right-4 space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProfile(profile)}
                      >
                        Editar
                      </Button>
                      {profiles.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => profile.id && handleDeleteProfile(profile.id)}
                        >
                          Eliminar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => profile.id && handleToggleFavoriteProfile(profile.id)}
                        className={profile.isFavorite ? "text-yellow-500" : ""}
                      >
                        {profile.isFavorite ? "★" : "☆"}
                      </Button>
                    </div>
                    <div 
                      className="space-y-2 pr-24 cursor-pointer"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <p className="font-medium">{profile.fullName}</p>
                      <p>{profile.email}</p>
                      <p>Tel: {profile.phone || "No especificado"}</p>
                      <p>DNI: {profile.dni || "No especificado"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {editingProfile && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <Card className="w-full max-w-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {editingProfile.id ? "Editar" : "Agregar"} Perfil
                    </h3>
                    <form
                      onSubmit={editingProfile.id ? handleProfileUpdate : handleCreateProfile}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nombre Completo</Label>
                          <Input
                            id="fullName"
                            value={editingProfile.fullName}
                            onChange={(e) => setEditingProfile(prev => ({ ...prev!, fullName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editingProfile.email}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={editingProfile.phone}
                            onChange={(e) => setEditingProfile(prev => ({ ...prev!, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dni">DNI</Label>
                          <Input
                            id="dni"
                            value={editingProfile.dni}
                            onChange={(e) => setEditingProfile(prev => ({ ...prev!, dni: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingProfile(null)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Guardar
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mis Direcciones</h2>
                <Button
                  onClick={() => setEditingAddress({
                    id: "",
                    address: "",
                    city: "",
                    deliveryMethod: "",
                    postalCode: ""
                  })}
                >
                  Agregar Dirección
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border rounded-lg p-4 relative hover:shadow-md transition-shadow"
                  >
                    <div className="absolute top-4 right-4 space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAddress(address)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Eliminar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavoriteAddress(address.id)}
                        className={address.isFavorite ? "text-yellow-500" : ""}
                      >
                        {address.isFavorite ? "★" : "☆"}
                      </Button>
                    </div>
                    <div className="space-y-2 pr-24">
                      <p className="font-medium">{address.address}</p>
                      <p>{address.city}</p>
                      <p>CP: {address.postalCode}</p>
                      <p>Método de entrega: {address.deliveryMethod}</p>
                    </div>
                  </div>
                ))}
              </div>

              {editingAddress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                  <Card className="w-full max-w-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {editingAddress.id ? "Editar" : "Agregar"} Dirección
                    </h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddressUpdate(editingAddress);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Dirección</Label>
                          <Input
                            id="address"
                            value={editingAddress.address}
                            onChange={(e) => setEditingAddress(prev => ({ ...prev!, address: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Ciudad</Label>
                          <Input
                            id="city"
                            value={editingAddress.city}
                            onChange={(e) => setEditingAddress(prev => ({ ...prev!, city: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Código Postal</Label>
                          <Input
                            id="postalCode"
                            value={editingAddress.postalCode}
                            onChange={(e) => setEditingAddress(prev => ({ ...prev!, postalCode: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryMethod">Método de Entrega</Label>
                          <Input
                            id="deliveryMethod"
                            value={editingAddress.deliveryMethod}
                            onChange={(e) => setEditingAddress(prev => ({ ...prev!, deliveryMethod: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingAddress(null)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Guardar
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      
    </main>
  );
} 