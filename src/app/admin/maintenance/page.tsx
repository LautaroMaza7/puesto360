"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updateProductDates } from '@/scripts/updateProductDates'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function MaintenancePage() {
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateDates = async () => {
    try {
      setIsUpdating(true)
      const result = await updateProductDates()
      
      if (result.success) {
        toast({
          title: "Actualización completada",
          description: `Se actualizaron ${result.updatedProducts} de ${result.totalProducts} productos.`,
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mantenimiento</h2>
        <p className="text-muted-foreground">
          Herramientas de mantenimiento y actualización
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actualizar Fechas de Productos</CardTitle>
            <CardDescription>
              Agrega fechas de creación y actualización a los productos que no las tengan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleUpdateDates} 
              disabled={isUpdating}
            >
              {isUpdating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUpdating ? 'Actualizando...' : 'Actualizar Fechas'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 