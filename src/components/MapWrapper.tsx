'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0d131f] animate-pulse rounded-2xl flex items-center justify-center border border-slate-800">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
    </div>
  ),
})

interface SiteLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: 'green' | 'yellow' | 'red'
  power: number
}

export default function MapWrapper({ sites }: { sites: SiteLocation[] }) {
  return <Map sites={sites} />
}
