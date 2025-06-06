"use client"

import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import Providers from '@/app/providers'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const content = (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 md:ml-64">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )

  return (
    <Providers>
      <AdminRoute>{content}</AdminRoute>
    </Providers>
  )
} 