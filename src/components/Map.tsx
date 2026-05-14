'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default icon path issues in Next.js
const createIcon = (color: 'green' | 'yellow' | 'red') => {
  const colorMap = {
    green: '#10b981', // emerald-500
    yellow: '#f59e0b', // amber-500
    red: '#ef4444', // red-500
  }
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${colorMap[color]}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #000; box-shadow: 0 0 10px ${colorMap[color]};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

interface SiteLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: 'green' | 'yellow' | 'red'
  power: number
}

export default function Map({ sites }: { sites: SiteLocation[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-full h-full bg-[#0d131f] animate-pulse rounded-2xl" />

  return (
    <MapContainer 
      center={[-1.2921, 36.8219]} 
      zoom={6} 
      className="w-full h-full rounded-2xl border border-slate-800"
      zoomControl={false}
    >
      {/* Colored OpenStreetMap tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {sites.map(site => (
        <Marker 
          key={site.id} 
          position={[site.lat, site.lng]}
          icon={createIcon(site.status)}
        >
          <Popup className="dark-popup">
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-slate-800 text-lg mb-1">{site.name}</h3>
              <div className="text-sm text-slate-600 mb-2">Current Output: <span className="font-bold">{site.power.toFixed(1)} kW</span></div>
              <div className="flex items-center text-sm">
                <span className="mr-2">Status:</span>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${site.status === 'green' ? 'bg-emerald-500' : site.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                  <span className={`font-semibold ${site.status === 'green' ? 'text-emerald-600' : site.status === 'yellow' ? 'text-amber-600' : 'text-red-600'}`}>
                    {site.status === 'green' ? 'Healthy' : site.status === 'yellow' ? 'Underperforming' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
