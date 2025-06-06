'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useUser, useClerk } from "@clerk/nextjs";

export const useAuth = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const logout = async () => {
    try {
      await signOut();
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      })

      // Redirigir al login
      router.push('/')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al cerrar sesión',
      })
    }
  }

  return { isSignedIn, user, logout }
} 