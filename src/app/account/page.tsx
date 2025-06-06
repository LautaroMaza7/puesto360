"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, MapPin, Shield, Bell, CreditCard, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AccountPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) {
    return null;
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{user?.fullName}</h2>
                    <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Miembro desde {new Date(user?.createdAt || "").toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Button>
                  <Button
                    variant={activeTab === "orders" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("orders")}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Mis Pedidos
                  </Button>
                  <Button
                    variant={activeTab === "wishlist" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("wishlist")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Lista de Deseos
                  </Button>
                  <Button
                    variant={activeTab === "payment" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("payment")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Métodos de Pago
                  </Button>
                  <Button
                    variant={activeTab === "security" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("security")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Seguridad
                  </Button>
                  <Button
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notificaciones
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Gestiona tu información personal y preferencias</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="mr-2 h-4 w-4" />
                          Nombre Completo
                        </div>
                        <p className="font-medium">{user?.fullName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </div>
                        <p className="font-medium">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="mr-2 h-4 w-4" />
                          Teléfono
                        </div>
                        <p className="font-medium">
                          {user?.phoneNumbers[0]?.phoneNumber || "No agregado"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="mr-2 h-4 w-4" />
                          Fecha de Registro
                        </div>
                        <p className="font-medium">
                          {new Date(user?.createdAt || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Direcciones</CardTitle>
                    <CardDescription>Gestiona tus direcciones de entrega</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No hay direcciones guardadas</p>
                        <Button variant="outline" className="mt-2">
                          Agregar Dirección
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Pedidos</CardTitle>
                    <CardDescription>Historial de tus pedidos recientes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No hay pedidos realizados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist">
                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Deseos</CardTitle>
                    <CardDescription>Productos que te gustaría comprar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <Heart className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Tu lista de deseos está vacía</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Métodos de Pago</CardTitle>
                    <CardDescription>Gestiona tus métodos de pago</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <CreditCard className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No hay métodos de pago guardados</p>
                        <Button variant="outline" className="mt-2">
                          Agregar Método de Pago
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad</CardTitle>
                    <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Cambiar Contraseña</div>
                          <div className="text-sm text-gray-500">Actualiza tu contraseña regularmente</div>
                        </div>
                        <Button variant="outline">Cambiar</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Autenticación de Dos Factores</div>
                          <div className="text-sm text-gray-500">Añade una capa extra de seguridad</div>
                        </div>
                        <Button variant="outline">Activar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notificaciones</CardTitle>
                    <CardDescription>Gestiona tus preferencias de notificaciones</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Notificaciones por Email</div>
                          <div className="text-sm text-gray-500">Recibe actualizaciones por correo electrónico</div>
                        </div>
                        <Button variant="outline">Configurar</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Notificaciones Push</div>
                          <div className="text-sm text-gray-500">Recibe notificaciones en tiempo real</div>
                        </div>
                        <Button variant="outline">Configurar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 