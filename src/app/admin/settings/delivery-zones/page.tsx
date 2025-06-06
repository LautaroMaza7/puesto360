"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { LoadScript, Autocomplete } from "@react-google-maps/api"

// Importación dinámica para evitar problemas de SSR con Leaflet
const Map = dynamic(() => import("@/components/admin/DeliveryMap"), { ssr: false })

interface Location {
  nombre: string
  direccion: string
  lat: number
  lng: number
  radio: number // metros
}

export default function DeliveryZonesPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Cargar sucursales desde Firestore al iniciar
  useEffect(() => {
    async function fetchLocations() {
      setIsLoading(true)
      try {
        const docRef = doc(db, "settings", "general")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setLocations(data.locations || [])
        } else {
          setLocations([])
        }
      } catch (error) {
        toast.error("Error al cargar las sucursales")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLocations()
  }, [])

  // Guardar sucursales editadas en Firestore
  async function handleSave() {
    setIsSaving(true)
    try {
      const docRef = doc(db, "settings", "general")
      await setDoc(docRef, { locations }, { merge: true })
      toast.success("Zonas de entrega guardadas correctamente")
    } catch (error) {
      toast.error("Error al guardar las zonas de entrega")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current
    if (autocomplete) {
      const place = autocomplete.getPlace()
      const lat = place.geometry?.location?.lat()
      const lng = place.geometry?.location?.lng()
      if (lat && lng) {
        setLocations(prev => [
          ...prev,
          {
            nombre: place.name || "Sucursal",
            direccion: place.formatted_address || "",
            lat,
            lng,
            radio: 5000,
          },
        ])
        if (inputRef.current) inputRef.current.value = ""
      } else {
        toast.error("No se pudo obtener la ubicación. Selecciona una dirección válida.")
      }
    }
  }

  // Filtrar sucursales válidas (con lat/lng definidos)
  const validLocations = locations.filter(
    loc => typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng)
  )

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Zonas de Entrega</h2>
        <p className="text-muted-foreground">
          Gestiona los radios de entrega de tus sucursales y visualízalos en el mapa.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Sucursales y Zonas de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Cargando mapa...</div>
          ) : validLocations.length === 0 ? (
            <div className="text-center py-10">
              No hay sucursales con ubicación válida.<br />
              Agrega una sucursal para ver el mapa.<br />
              <div className="mt-4">
                <Map locations={[{ nombre: 'Referencia', direccion: 'Buenos Aires', lat: -34.6037, lng: -58.3816, radio: 5000 }]} onChangeLocations={() => {}} />
              </div>
            </div>
          ) : (
            <Map locations={validLocations} onChangeLocations={setLocations} />
          )}
        </CardContent>
      </Card>

      {/* Input de autocompletado de Google Places */}
      <div className="my-6 max-w-xl">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places"]}>
          <Autocomplete
            onLoad={ref => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar dirección para agregar sucursal..."
              className="w-full px-3 py-2 border rounded shadow"
            />
          </Autocomplete>
        </LoadScript>
      </div>

      {/* Tabla de sucursales */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Lista de Sucursales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Nombre</th>
                  <th className="p-2 border">Dirección</th>
                  <th className="p-2 border">Radio (m)</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2 border">
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={loc.nombre}
                        onChange={e => {
                          const newLocs = [...locations]
                          newLocs[idx].nombre = e.target.value
                          setLocations(newLocs)
                        }}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={loc.direccion}
                        onChange={e => {
                          const newLocs = [...locations]
                          newLocs[idx].direccion = e.target.value
                          setLocations(newLocs)
                        }}
                      />
                    </td>
                    <td className="p-2 border" style={{ minWidth: 100 }}>
                      <input
                        type="number"
                        min={500}
                        max={15000}
                        step={100}
                        className="w-full px-2 py-1 border rounded"
                        value={loc.radio}
                        onChange={e => {
                          const newLocs = [...locations]
                          newLocs[idx].radio = Number(e.target.value)
                          setLocations(newLocs)
                        }}
                      />
                    </td>
                    <td className="p-2 border text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setLocations(locations.filter((_, i) => i !== idx))
                        }}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  )
} 