'use client'

import { Bell, Sun, Moon, LogOut, Settings, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import { useToast } from '@/components/ui/use-toast'
import { useAdminAuth } from '@/hooks/use-admin-auth'

export function AdminHeader() {
  const { theme, setTheme } = useTheme()
  const { user, setUser } = useAuth()
  const { logout: auth0Logout, isAuthenticated: isAuth0User } = useAuth0()
  const { logout: adminLogout } = useAdminAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      if (isAuth0User) {
        auth0Logout({ 
          logoutParams: {
            returnTo: '/'
          }
        })
        return
      }

      // Primero limpiamos el estado de autenticación de admin
      adminLogout()

      // Luego intentamos el logout de la API si es necesario
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Error al cerrar sesión')
        }

        setUser(null)
      } catch (error) {
        console.error('Error en logout de API:', error)
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
        variant: "default"
      })

    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar la sesión",
        variant: "destructive"
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 shadow">
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1"></div>
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {user && typeof user.notifications_count === 'number' && user.notifications_count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                {user.notifications_count}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || ''} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : 'AD'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="cursor-default">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Usuario'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'usuario@ejemplo.com'}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 