"use client"

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.email) {
      signIn()
      return
    }

    const checkAdmin = async () => {
      const userRef = doc(db, 'users', session.user.email)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists() && userSnap.data().role === 'admin') {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
        router.replace('/')
      }
    }

    checkAdmin()
  }, [session, status, router])

  if (status === 'loading' || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) return null

  return <>{children}</>
} 