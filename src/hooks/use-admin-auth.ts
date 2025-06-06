import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_CREDENTIALS } from '@/lib/admin-auth'
import Cookies from 'js-cookie'

export function useAdminAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(() => {
    try {
      const credentials = Cookies.get('adminCredentials')
      if (!credentials) {
        setIsAuthenticated(false)
        return false
      }

      const [email, password] = atob(credentials).split(':')
      const isValid = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
      
      setIsAuthenticated(isValid)
      return isValid
    } catch (error) {
      console.error('Error checking auth:', error)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  useEffect(() => {
    checkAuth()
    setIsLoading(false)
  }, [checkAuth])

  const login = useCallback((email: string, password: string) => {
    try {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const credentials = btoa(`${email}:${password}`)
        Cookies.set('adminCredentials', credentials, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        setIsAuthenticated(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Error during login:', error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    try {
      Cookies.remove('adminCredentials', { path: '/' })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }, [])

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth
  }
} 