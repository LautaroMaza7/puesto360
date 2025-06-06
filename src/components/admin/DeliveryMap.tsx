import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import L from "leaflet"
import { useEffect } from "react"

// Icono personalizado para los marcadores
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
})

interface Location {
  nombre: string
  direccion: string
  lat: number
  lng: number
  radio: number // metros
}

interface DeliveryMapProps {
  locations: Location[]
  onChangeLocations?: (locs: Location[]) => void
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap()
  useEffect(() => {
    if (!locations.length) return
    const group = new L.FeatureGroup(
      locations.map(loc => L.marker([loc.lat, loc.lng]))
    )
    map.fitBounds(group.getBounds().pad(0.5))
  }, [locations, map])
  return null
}

export default function DeliveryMap({ locations, onChangeLocations }: DeliveryMapProps) {
  return (
    <div style={{ width: "100%", height: 400, borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={[locations[0]?.lat || 0, locations[0]?.lng || 0]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <FitBounds locations={locations} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, idx) => (
          <>
            <Marker
              key={"marker-" + idx}
              position={[loc.lat, loc.lng]}
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target
                  const { lat, lng } = marker.getLatLng()
                  if (onChangeLocations) {
                    const newLocs = [...locations]
                    newLocs[idx] = { ...newLocs[idx], lat, lng }
                    onChangeLocations(newLocs)
                  }
                },
              }}
            >
              <Popup minWidth={220}>
                <b>{loc.nombre}</b><br />
                {loc.direccion}<br />
                <div style={{ marginTop: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 500 }}>
                    Radio de entrega:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="range"
                      min={500}
                      max={15000}
                      step={100}
                      value={loc.radio}
                      style={{ flex: 1 }}
                      onChange={e => {
                        if (onChangeLocations) {
                          const newLocs = [...locations]
                          newLocs[idx] = { ...newLocs[idx], radio: Number(e.target.value) }
                          onChangeLocations(newLocs)
                        }
                      }}
                    />
                    <input
                      type="number"
                      min={500}
                      max={15000}
                      step={100}
                      value={loc.radio}
                      style={{ width: 70 }}
                      onChange={e => {
                        if (onChangeLocations) {
                          const newLocs = [...locations]
                          newLocs[idx] = { ...newLocs[idx], radio: Number(e.target.value) }
                          onChangeLocations(newLocs)
                        }
                      }}
                    />
                    <span style={{ fontSize: 12 }}>m</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {(loc.radio / 1000).toFixed(2)} km
                  </div>
                </div>
              </Popup>
            </Marker>
            <Circle
              key={"circle-" + idx}
              center={[loc.lat, loc.lng]}
              radius={loc.radio}
              pathOptions={{ color: "#007bff", fillColor: "#007bff", fillOpacity: 0.15 }}
            />
          </>
        ))}
      </MapContainer>
    </div>
  )
} 