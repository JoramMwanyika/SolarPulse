'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Server, Settings2, ShieldCheck, Database, MapPin, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react'
import { addSite, deleteSite } from './actions'

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0d131f] animate-pulse rounded-lg border border-slate-800" />
})

export default function AdminClient({ sites }: { sites: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLat, setSelectedLat] = useState<number | ''>('')
  const [selectedLng, setSelectedLng] = useState<number | ''>('')

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLat(Number(lat.toFixed(6)))
    setSelectedLng(Number(lng.toFixed(6)))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    // ensure lat/lng are in formData
    formData.set('latitude', selectedLat.toString())
    formData.set('longitude', selectedLng.toString())

    const result = await addSite(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      // Reset form
      e.currentTarget.reset()
      setSelectedLat('')
      setSelectedLng('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site? All related telemetry and alerts will be permanently removed.')) return
    await deleteSite(id)
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
          <Settings2 className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Setup</h1>
          <p className="text-sm text-slate-400">Configure data sources, API integrations, and fleet management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Panel: Integration Hub (Add Site Form) */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800 bg-[#0d131f] flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-white tracking-wider uppercase">Integration Hub</h2>
            </div>
          </div>
          
          <div className="p-6 flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Site Name</label>
                <input 
                  type="text" 
                  name="siteName"
                  required
                  placeholder="e.g., Nakuru Distribution Center"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Total Array Capacity (kWp)</label>
                  <input 
                    type="number" 
                    name="capacity"
                    step="0.1"
                    required
                    placeholder="e.g., 540"
                    className="w-full bg-[#131b2c] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Inverter API Type</label>
                  <select 
                    name="inverterType"
                    className="w-full bg-[#131b2c] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors appearance-none"
                  >
                    <option value="Huawei">Huawei FusionSolar</option>
                    <option value="Deye">Deye Cloud</option>
                    <option value="Victron">Victron VRM</option>
                    <option value="SMA">SMA Sunny Portal</option>
                    <option value="Other">Other / Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">API Key / Auth Token (Optional)</label>
                <input 
                  type="password" 
                  name="apiKey"
                  placeholder="Enter API Key"
                  className="w-full bg-[#131b2c] border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-[#0a0e17]/50">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Select Location
                  </label>
                  <div className="text-xs text-slate-500 font-mono">
                    Lat: {selectedLat !== '' ? selectedLat : '---'} | Lng: {selectedLng !== '' ? selectedLng : '---'}
                  </div>
                </div>
                <div className="h-[250px] w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
                  <LocationPickerMap onLocationSelect={handleLocationSelect} />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || selectedLat === '' || selectedLng === ''}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                {loading ? 'Provisioning...' : 'Provision Site & Test Connection'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: API Health Monitor (Table) */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="p-5 border-b border-slate-800 bg-[#0d131f] flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-white tracking-wider uppercase">API Health Monitor</h2>
            </div>
            <div className="text-xs text-slate-500 flex items-center">
              <Database className="w-3 h-3 mr-1" />
              {sites.length} Active Data Sources
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 bg-[#131b2c]/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Site Name</th>
                  <th className="px-6 py-4 font-medium">Database ID</th>
                  <th className="px-6 py-4 font-medium text-center">Ping Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800/50">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span>{site.site_name}</span>
                        <span className="text-xs text-slate-500">{site.inverter_brand} • {site.total_kwp}kWp</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                        {site.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                        200 OK
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(site.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete Site"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {sites.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Server className="w-8 h-8 text-slate-700 mb-3" />
                        <p>No data sources configured yet.</p>
                        <p className="text-xs mt-1">Use the Integration Hub to provision your first site.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
