"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut
} from 'lucide-react'
import { useAdminAuth } from '@/hooks/use-admin-auth'

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Package
  },
  {
    title: 'Productos',
    href: '/admin/products',
    icon: Package
  },
  {
    title: 'Pedidos',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  {
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings
  }
]

export default function AdminNav() {
  const pathname = usePathname()
  const { logout } = useAdminAuth()

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </div>
      
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
} 