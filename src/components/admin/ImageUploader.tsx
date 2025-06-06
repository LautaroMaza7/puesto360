"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ProductImage } from '@/components/ui/ProductImage'

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void
  maxImages?: number
  maxSizeMB?: number
  initialImages?: string[]
  disabled?: boolean
}

export function ImageUploader({ 
  onImagesChange, 
  maxImages = 5, 
  maxSizeMB = 2,
  initialImages = [],
  disabled = false
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages)
  const { data: session } = useSession()

  // Actualizar las URLs de vista previa cuando cambian las imágenes iniciales
  useEffect(() => {
    setPreviewUrls(initialImages)
  }, [initialImages])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Validar cantidad máxima de imágenes
    const totalImages = previewUrls.length + acceptedFiles.length
    if (totalImages > maxImages) {
      toast.error(`No puedes subir más de ${maxImages} imágenes en total`)
      return
    }

    // Filtrar archivos válidos
    const validFiles = acceptedFiles.filter(file => {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        toast.error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG o GIF')
        return false
      }

      // Validar tamaño
      const maxSize = maxSizeMB * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`El archivo es demasiado grande. El tamaño máximo es ${maxSizeMB}MB`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    // Crear URLs de vista previa
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])

    // Subir imágenes
    setIsUploading(true)
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al subir la imagen')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const allUrls = [...previewUrls, ...uploadedUrls]
      onImagesChange(allUrls)
      toast.success('Imágenes subidas correctamente')
    } catch (error) {
      console.error('Error al subir imágenes:', error)
      toast.error(`Error al subir imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      // Limpiar las URLs de vista previa en caso de error
      setPreviewUrls(prev => prev.slice(0, -validFiles.length))
    } finally {
      setIsUploading(false)
    }
  }, [previewUrls, maxImages, maxSizeMB, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    disabled: disabled || isUploading
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Subiendo imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Suelta las imágenes aquí'
                : 'Arrastra imágenes o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG o GIF (máximo {maxSizeMB}MB)
            </p>
            <p className="text-xs text-muted-foreground">
              {previewUrls.length} de {maxImages} imágenes
            </p>
          </div>
        )}
      </div>

      {!session && (
        <div className="text-center text-sm text-muted-foreground">
          Debes iniciar sesión para subir imágenes
        </div>
      )}
    </div>
  )
} 