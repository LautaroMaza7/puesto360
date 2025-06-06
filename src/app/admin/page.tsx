"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  TrendingUp
} from 'lucide-react'

const stats = [
  {
    title: 'Ingresos Totales',
    value: '$0.00',
    icon: DollarSign,
    description: 'Cargando datos...',
  },
  {
    title: 'Clientes',
    value: '0',
    icon: Users,
    description: 'Cargando datos...',
  },
  {
    title: 'Productos',
    value: '0',
    icon: Package,
    description: 'Cargando datos...',
  },
  {
    title: 'Ventas',
    value: '0',
    icon: TrendingUp,
    description: 'Cargando datos...',
  },
]

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general de tu tienda
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Gráfico de ventas a implementar
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Tabla de productos más vendidos a implementar
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Tabla de pedidos recientes a implementar
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estados de pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              Gráfico de estados de pedidos a implementar
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 