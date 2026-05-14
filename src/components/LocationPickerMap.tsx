'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon issues
const defaultIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px rgba(245,158,11,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null)
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  )
}

export default function LocationPickerMap({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-full h-full bg-[#0d131f] animate-pulse rounded-lg border border-slate-800" />

  return (
    <MapContainer 
      center={[-1.2921, 36.8219]} 
      zoom={5} 
      className="w-full h-full rounded-lg border border-slate-800 z-0"
      zoomControl={true}
    >
      {/* Colored OpenStreetMap tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  )
}
