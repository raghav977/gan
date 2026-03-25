import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export default function TrainerMap({
  location,
  radiusKm,
  zoom = 13,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)

  // 1️⃣ Initialize map ONCE
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // 2️⃣ Update marker & circle when location / radius changes
  useEffect(() => {
    if (!location || !mapRef.current) return

    const { lat, lng } = location

    mapRef.current.setView([lat, lng], zoom)

    // Marker
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
    } else {
      markerRef.current.setLatLng([lat, lng])
    }

    // Radius circle
    const radiusMeters = Number(radiusKm) * 1000

    if (!circleRef.current) {
      circleRef.current = L.circle([lat, lng], {
        radius: radiusMeters,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.15,
      }).addTo(mapRef.current)
    } else {
      circleRef.current
        .setLatLng([lat, lng])
        .setRadius(radiusMeters)
    }
  }, [location, radiusKm, zoom])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden"
    />
  )
}
