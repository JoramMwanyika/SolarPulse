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
  
  const svgIcon = `
    <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" fill="${colorMap[color]}" stroke="#000" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="display:flex; justify-content:center; align-items:flex-end; height:100%; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.5));">${svgIcon}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
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
