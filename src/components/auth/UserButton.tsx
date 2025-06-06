"use client";

import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react"; // Asegúrate de tener lucide-react instalado
import { useRouter } from "next/navigation";

export default function UserButtonComponent() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isSignedIn) {
    // Si el usuario no está logueado, podrías renderizar algo diferente, o nada.
    // Por ahora, no renderizamos nada si no hay sesión activa aquí.
    return null; 
  }

  return (
    <DropdownMenu>
      {/* Usamos el UserButton de Clerk como trigger */}
      <DropdownMenuTrigger asChild>
        {/* Envolvemos UserButton en un div para asegurar que el trigger de Shadcn funcione */}
        <div className="cursor-pointer">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                // Ocultamos el popover por defecto de Clerk
                userButtonPopoverCard: "hidden",
                // Aseguramos que el área exterior no tenga comportamiento por defecto
                userButtonOuterIdentifier: "pointer-events-none",
                // Estilos para el avatar/botón
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </div>
      </DropdownMenuTrigger>
      
      {/* Contenido del DropdownMenu personalizado de Shadcn UI */}
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Información del usuario */}
        <DropdownMenuItem className="cursor-default">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName || user?.username || "Usuario"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress || "N/A"}
            </p>
          </div>
        </DropdownMenuItem>

        {/* Enlaces personalizados */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Mi perfil</span>
          </Link>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/mis-tiendas" className="flex items-center w-full">
             {/* Cambia el icono si tienes uno de tienda */}
            <Settings className="mr-2 h-4 w-4" />
            <span>Mis tiendas</span>
          </Link>
        </DropdownMenuItem>
         <DropdownMenuItem asChild>
          <Link href="/soporte" className="flex items-center w-full">
             {/* Cambia el icono si tienes uno de soporte */}
            <Settings className="mr-2 h-4 w-4" />
            <span>Soporte</span>
          </Link>
        </DropdownMenuItem>

        {/* Opción de Cerrar Sesión usando la función de Clerk */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => signOut(() => router.push('/'))}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 