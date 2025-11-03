"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import react-leaflet pieces to avoid SSR
const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false })
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false })
const CircleMarker = dynamic(async () => (await import("react-leaflet")).CircleMarker, { ssr: false })
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false })

import "leaflet/dist/leaflet.css"
// Note: Using CircleMarker so we don't rely on marker image assets

type LatLng = { lat: number; lng: number }

export type ClientMapProps = {
  className?: string
  height?: number | string
  center?: LatLng
  zoom?: number
  markers?: Array<{ id?: number | string; position: LatLng; label?: string; color?: string }>
  onMarkerClick?: (id: number | string | undefined) => void
}

export default function ClientMap({ className, height = 300, center, zoom = 13, markers = [], onMarkerClick }: ClientMapProps) {
  const [userPos, setUserPos] = useState<LatLng | null>(null)
  const mapCenter = useMemo<LatLng>(() => center || userPos || { lat: 49.8954, lng: -97.1385 }, [center, userPos]) // Default to Winnipeg

  useEffect(() => {
    if (!center && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          // ignore errors; default center stays
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
  }, [center])

  return (
    <div className={className} style={{ height }}>
      <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {userPos && (
          <CircleMarker
            center={[userPos.lat, userPos.lng] as any}
            pathOptions={{ color: "#2563eb", fillColor: "#2563eb" }}
            radius={7}
            stroke={true}
            weight={1}
            fillOpacity={0.9}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}
    {markers.map((m, i) => (
          <CircleMarker
            key={i}
            center={[m.position.lat, m.position.lng] as any}
            pathOptions={{ color: m.color || "#6b7280", fillColor: m.color || "#6b7280" }}
            radius={8}
            stroke={true}
            weight={1}
            fillOpacity={0.95}
      eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
          >
            {m.label && <Popup>{m.label}</Popup>}
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
