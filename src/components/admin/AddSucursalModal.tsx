import { useRef } from "react"
import { LoadScript, Autocomplete } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"

interface AddSucursalModalProps {
  open: boolean
  onClose: () => void
  onAddSucursal: (sucursal: { nombre: string, direccion: string, lat: number, lng: number }) => void
}

export default function AddSucursalModal({ open, onClose, onAddSucursal }: AddSucursalModalProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current
    if (autocomplete) {
      const place = autocomplete.getPlace()
      const lat = place.geometry?.location?.lat()
      const lng = place.geometry?.location?.lng()
      if (lat && lng) {
        onAddSucursal({
          nombre: place.name || "Sucursal",
          direccion: place.formatted_address || "",
          lat,
          lng,
        })
        onClose()
      } else {
        alert("No se pudo obtener la ubicación. Selecciona una dirección válida.")
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">Agregar sucursal</h2>
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={["places"]}>
          <Autocomplete
            onLoad={ref => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar dirección..."
              className="w-full px-3 py-2 border rounded mb-2"
              autoFocus
            />
          </Autocomplete>
        </LoadScript>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  )
} 