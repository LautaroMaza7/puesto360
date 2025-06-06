"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Tag,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/products', icon: Package },
  { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Categorías', href: '/admin/categories', icon: Tag },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className={cn(
        "md:hidden fixed top-4 left-4 z-50",
        isOpen && "hidden"
      )}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 z-40 flex flex-col w-64 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-6 w-6',
                        isActive
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 