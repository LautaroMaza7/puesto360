"use client"
/*  */
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Product } from '@/types/product'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { toast } = useToast()
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"))
      const productsData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        // Convertir el timestamp de Firebase a Date
        let createdAt: Date
        try {
          createdAt = data.createdAt?.toDate?.() || new Date()
        } catch (error) {
          console.warn('Error al convertir timestamp:', error)
          createdAt = new Date()
        }

        // Asegurar que todas las propiedades requeridas estén presentes
        return {
          id: doc.id,
          active: data.active ?? true,
          category: data.category || '',
          createdAt: createdAt,
          description: data.description || '',
          discount: data.discount || { amount: 0, percentage: 0 },
          featuredBrand: data.featuredBrand ?? false,
          freeShipping: data.freeShipping ?? false,
          images: data.images || [],
          name: data.name || '',
          newArrival: data.newArrival ?? false,
          price: data.price || 0,
          promos: data.promos || [],
          rating: data.rating || 0,
          sales: data.sales || 0,
          specialOffer: data.specialOffer ?? false,
          srcUrl: data.srcUrl || '',
          stock: data.stock || 0,
          subcategory: data.subcategory || '',
          title: data.title || '',
          updatedAt: data.updatedAt || createdAt.toISOString()
        } as Product
      })
      
      // Ordenar por fecha de creación (más recientes primero)
      productsData.sort((a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime()
      )
      
      setProducts(productsData)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId))
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
        variant: "default"
      })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive"
      })
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'image',
      header: 'Imagen',
      enableSorting: false,
      cell: ({ row }) => {
        const imageUrl = row.original.srcUrl || 
                        (row.original.images && row.original.images.length > 0 ? 
                         row.original.images[0] : null);

        if (!imageUrl) {
          return (
            <div className="relative h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <span className="text-muted-foreground text-xs">No img</span>
            </div>
          );
        }

        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="relative h-12 w-12 rounded-lg overflow-hidden"
          >
            <Image
              src={imageUrl}
              alt={row.original.name || "Producto"}
              fill
              className="object-cover transition-transform duration-300 hover:scale-110"
              unoptimized
            />
          </motion.div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <button 
          type="button" 
          className="flex items-center gap-1 hover:text-primary transition-colors duration-200" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          {column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
          {column.getIsSorted() === 'desc' && <ArrowDown className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <button 
          type="button" 
          className="flex items-center gap-1 hover:text-primary transition-colors duration-200" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Categoría
          {column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
          {column.getIsSorted() === 'desc' && <ArrowDown className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <button 
          type="button" 
          className="flex items-center gap-1 hover:text-primary transition-colors duration-200" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Precio
          {column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
          {column.getIsSorted() === 'desc' && <ArrowDown className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            ${row.original.price.toFixed(2)}
          </span>
          {row.original.discount.percentage > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              -{row.original.discount.percentage}%
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: ({ column }) => (
        <button 
          type="button" 
          className="flex items-center gap-1 hover:text-primary transition-colors duration-200" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Stock
          {column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
          {column.getIsSorted() === 'desc' && <ArrowDown className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <div className={cn(
          "font-medium",
          row.original.stock <= 5 ? "text-destructive" : 
          row.original.stock <= 10 ? "text-yellow-600" : 
          "text-green-600"
        )}>
          {row.original.stock}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fecha de Creación
          {column.getIsSorted() === 'desc' && <ArrowDown className="w-3 h-3" />}
          {column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => {
        const dateStr = row.original.createdAt
        try {
          const date = new Date(dateStr || 0)
          return (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )
        } catch (error) {
          console.warn('Error al formatear fecha:', error)
          return <span className="text-sm text-muted-foreground">Fecha inválida</span>
        }
      },
    },
    {
      accessorKey: 'active',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Estado
          {column.getIsSorted() === 'desc' && <ArrowDown className="w-3 h-3" />}
          {column.getIsSorted() === 'asc' && <ArrowUp className="w-3 h-3" />}
        </button>
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.active ? "default" : "destructive"}
          className={cn(
            "animate-pulse",
            row.original.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}
        >
          {row.original.active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild
                  className="hover:bg-primary/10 transition-colors duration-200"
                >
                  <Link href={`/admin/products/${row.original.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar producto</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
                        {' '}{row.original.name} y todos sus datos asociados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(row.original.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar producto</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  })

  const uniqueCategories = Array.from(new Set(products.map(product => product.category)))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="rounded-md border">
          <div className="p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Productos
          </h2>
          <p className="text-muted-foreground">
            Gestiona los productos de tu tienda
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Link>
          </Button>
        </motion.div>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar productos..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm transition-all duration-300 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              const filterValue = value === "all" ? "" : value;
              setCategoryFilter(value)
              setGlobalFilter(filterValue)
            }}
          >
            <SelectTrigger className="w-[180px] transition-all duration-300 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {uniqueCategories
                .filter((category) => category && category.trim() !== '')
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <svg
                          className="w-12 h-12 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        No se encontraron productos.
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="transition-all duration-300 hover:bg-primary/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Página anterior</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="transition-all duration-300 hover:bg-primary/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Siguiente página</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <div>Página</div>
            <strong className="text-foreground">
              {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </strong>
          </span>
        </div>
      </Card>
    </motion.div>
  )
} 