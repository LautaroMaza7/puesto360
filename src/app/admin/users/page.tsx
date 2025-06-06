"use client"

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { User, UserX } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { collection, getDocs, updateDoc, doc, query, where, Query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UserData {
  id: string
  name: string
  fullName?: string
  email: string
  primaryEmailAddress?: {
    emailAddress: string
  }
  role: string
  createdAt: Date
  active: boolean
  orders?: number
  totalSpent?: number
}

export default function UsersPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [userStates, setUserStates] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in")
    }
  }, [isSignedIn, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users')
        let usersQuery: Query = usersCollection
        
        // Aplicar filtro de rol si no es 'all'
        if (roleFilter !== 'all') {
          usersQuery = query(usersCollection, where('role', '==', roleFilter))
        }

        const usersSnapshot = await getDocs(usersQuery)
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as UserData[]
        
        // Obtener estadísticas de órdenes para cada usuario
        const usersWithStats = await Promise.all(
          usersData.map(async (user) => {
            const ordersQuery = query(
              collection(db, 'orders'),
              where('userId', '==', user.id)
            )
            const ordersSnapshot = await getDocs(ordersQuery)
            const orders = ordersSnapshot.docs.map(doc => doc.data())
            
            return {
              ...user,
              orders: orders.length,
              totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0)
            }
          })
        )
        
        setUsers(usersWithStats)
        setUserStates(
          usersWithStats.reduce((acc, user) => ({ ...acc, [user.id]: user.active }), {})
        )
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isSignedIn) {
      fetchUsers()
    }
  }, [isSignedIn, roleFilter])

  const handleToggle = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId)
      const newState = !userStates[userId]
      
      await updateDoc(userRef, {
        active: newState,
        updatedAt: new Date()
      })

      setUserStates(prev => ({
        ...prev,
        [userId]: newState
      }))
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">
            Gestiona los usuarios de tu tienda
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="customer">Clientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de registro</TableHead>
              <TableHead>Órdenes</TableHead>
              <TableHead>Total gastado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName || user.name}</TableCell>
                <TableCell>{user.primaryEmailAddress?.emailAddress || user.email}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </TableCell>
                <TableCell>
                  {format(user.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </TableCell>
                <TableCell>{user.orders || 0}</TableCell>
                <TableCell>${(user.totalSpent || 0).toLocaleString('es-AR')}</TableCell>
                <TableCell>
                  <Toggle
                    pressed={userStates[user.id]}
                    onPressedChange={() => handleToggle(user.id)}
                    aria-label="Toggle user status"
                  >
                    {userStates[user.id] ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                  </Toggle>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 