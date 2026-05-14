'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Zap, Sun, Clock, MoreHorizontal, Filter } from 'lucide-react'
import MapWrapper from '@/components/MapWrapper'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { createClientComponentClient } from '@/utils/supabase/client'

// Simple mock sparklines for history since we only get latest telemetry here
const generateData = (points: number, min: number, max: number, trend: 'up' | 'down' | 'flat' = 'flat') => {
  return Array.from({ length: points }).map((_, i) => ({
    value: Math.max(min, Math.min(max, min + (max - min) * Math.random() + (trend === 'up' ? i : trend === 'down' ? -i : 0)))
  }))
}

export default function DashboardClient({ 
  initialSites, 
  initialTelemetry, 
  initialAlerts 
}: { 
  initialSites: any[], 
  initialTelemetry: any[],
  initialAlerts: any[]
}) {
  const [sites, setSites] = useState(initialSites)
  const [telemetry, setTelemetry] = useState(initialTelemetry)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [selectedSiteId, setSelectedSiteId] = useState('all')
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Subscribe to realtime telemetry
    const telemetrySubscription = supabase
      .channel('public:telemetry')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'telemetry' }, payload => {
        setTelemetry(prev => {
          // Keep only the latest telemetry for each site
          const updated = [...prev]
          const existingIndex = updated.findIndex(t => t.site_id === payload.new.site_id)
          if (existingIndex >= 0) {
            updated[existingIndex] = payload.new
          } else {
            updated.push(payload.new)
          }
          return updated
        })
      })
      .subscribe()

    // Subscribe to realtime alerts
    const alertsSubscription = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        setAlerts(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(telemetrySubscription)
      supabase.removeChannel(alertsSubscription)
    }
  }, [supabase])

  // Compute live KPIs based on filter
  const filteredSites = selectedSiteId === 'all' ? sites : sites.filter(s => s.id === selectedSiteId)
  const filteredTelemetry = telemetry.filter(t => selectedSiteId === 'all' || t.site_id === selectedSiteId)
  const filteredAlerts = alerts.filter(a => selectedSiteId === 'all' || a.site_id === selectedSiteId)

  const totalCapacity = filteredSites.reduce((sum, site) => sum + Number(site.total_kwp || 0), 0)
  const liveGeneration = filteredTelemetry.reduce((sum, t) => sum + Number(t.current_power_kw || 0), 0)
  const todaysYield = filteredTelemetry.reduce((sum, t) => sum + Number(t.daily_energy_kwh || 0), 0)
  const activeAlertsCount = filteredAlerts.filter(a => !a.is_resolved).length

  // Build map markers
  const mapMarkers = filteredSites.map(site => {
    const latestTele = filteredTelemetry.find(t => t.site_id === site.id)
    const statusStr = latestTele?.status?.toLowerCase() || 'unknown'
    const status = (statusStr === 'normal' || statusStr === 'online') ? 'green' 
      : statusStr === 'underperforming' ? 'yellow' 
      : 'red'
    return {
      id: site.id,
      name: site.site_name,
      lat: site.latitude,
      lng: site.longitude,
      status: status as any,
      power: latestTele?.current_power_kw || 0
    }
  })

  // Format time since
  const timeSince = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d131f] p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
            <Filter className="w-5 h-5 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fleet Overview</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <select 
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            <option value="all">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Total Fleet Capacity</h3>
            <div className="p-1.5 bg-slate-800/50 rounded-lg text-emerald-400"><Sun className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2 mb-4">
            <span className="text-3xl font-bold text-white">{totalCapacity.toFixed(0)}</span>
            <span className="text-slate-400 font-medium mb-1">kWp</span>
          </div>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateData(20, totalCapacity - 50, totalCapacity, 'up')}>
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Live Generation</h3>
            <div className="p-1.5 bg-slate-800/50 rounded-lg text-amber-400"><Zap className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2 mb-4">
            <span className="text-3xl font-bold text-white">{liveGeneration.toFixed(1)}</span>
            <span className="text-slate-400 font-medium mb-1">kW</span>
          </div>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateData(30, liveGeneration - 20, liveGeneration + 20, 'flat')}>
                <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Today's Yield</h3>
            <div className="p-1.5 bg-slate-800/50 rounded-lg text-emerald-400"><Activity className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2 mb-4">
            <span className="text-3xl font-bold text-white">{todaysYield.toFixed(0)}</span>
            <span className="text-slate-400 font-medium mb-1">kWh</span>
          </div>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateData(20, todaysYield - 100, todaysYield, 'up')}>
                <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1a1111] border border-red-900/50 rounded-2xl p-5 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden group hover:border-red-800 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-red-400 text-xs font-bold tracking-wider uppercase">Active Alerts</h3>
              <div className="p-1.5 bg-red-950 rounded-lg text-red-500"><AlertTriangle className="w-4 h-4" /></div>
            </div>
            <div className="flex items-end space-x-2 mb-4">
              <span className="text-3xl font-bold text-red-500">{activeAlertsCount}</span>
            </div>
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateData(15, activeAlertsCount, activeAlertsCount + 2, 'flat')}>
                  <YAxis domain={[0, 10]} hide />
                  <Line type="stepAfter" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Map and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Map Container */}
        <div className="lg:col-span-2 bg-[#0d131f] border border-slate-800 rounded-2xl flex flex-col relative overflow-hidden shadow-lg">
          <div className="absolute top-4 left-4 z-10">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase px-4 py-2 bg-[#0A0E17]/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg">Fleet Map</h2>
          </div>
          
          <div className="absolute bottom-4 left-4 z-10 bg-[#0A0E17]/90 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-lg space-y-2">
            <div className="flex items-center text-xs text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div> Normal</div>
            <div className="flex items-center text-xs text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></div> Underperforming</div>
            <div className="flex items-center text-xs text-slate-300"><div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></div> Offline</div>
          </div>
          
          <div className="flex-1 w-full h-full relative z-0">
            <MapWrapper sites={mapMarkers} />
          </div>
        </div>

        {/* Live Alert Feed */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl flex flex-col shadow-lg overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Live Alert Feed</h2>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center">
              View all alerts <ArrowUpRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
               <div className="p-4 text-sm text-slate-500 text-center">No recent alerts.</div>
            ) : filteredAlerts.slice(0, 20).map((alert, i) => {
              const siteName = sites.find(s => s.id === alert.site_id)?.site_name || 'Unknown Site'
              const isCrit = alert.severity?.toLowerCase() === 'critical'
              const colorClass = isCrit ? 'red' : alert.severity?.toLowerCase() === 'warning' ? 'amber' : 'blue'
              const ColorIcon = isCrit || colorClass === 'amber' ? AlertTriangle : Activity
              
              return (
                <div key={alert.id || i} className={`p-3 bg-${colorClass}-950/20 border border-${colorClass}-900/30 rounded-xl hover:bg-${colorClass}-950/30 transition-colors`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center text-xs text-slate-400">
                      <ColorIcon className={`w-3.5 h-3.5 text-${colorClass}-500 mr-1.5`} />
                      <span className="font-semibold text-slate-200 ml-1.5">{siteName}</span>
                    </div>
                    <span className={`text-xs text-${colorClass}-400`}>{timeSince(alert.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-300 pl-5">{alert.message}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Fleet Performance Table */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0d131f]">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase">Fleet Performance</h2>
          <button className="p-1 text-slate-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 bg-[#131b2c]/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Site Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Inverter Brand</th>
                <th className="px-6 py-4 font-medium text-right">Current Power (kW)</th>
                <th className="px-6 py-4 font-medium text-right">Specific Yield (Yf)</th>
                <th className="px-6 py-4 font-medium">Last Sync Time</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {filteredSites.map(site => {
                const latestTele = filteredTelemetry.find(t => t.site_id === site.id)
                const statusStr = latestTele?.status || 'Unknown'
                const isNormal = statusStr.toLowerCase() === 'normal' || statusStr.toLowerCase() === 'online'
                const isWarning = statusStr.toLowerCase() === 'underperforming'
                const power = latestTele?.current_power_kw || 0
                const yieldYf = site.total_kwp > 0 ? ((latestTele?.daily_energy_kwh || 0) / site.total_kwp).toFixed(2) : '0.00'
                const lastSync = latestTele?.timestamp ? timeSince(latestTele.timestamp) : 'Never'

                return (
                  <tr key={site.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-200">{site.site_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isNormal ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : isWarning ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></div>
                        <span className={`${isNormal ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-red-400'} font-medium`}>{statusStr}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{site.inverter_brand || 'Unknown'}</td>
                    <td className={`px-6 py-4 text-right font-medium ${power > 0 ? 'text-slate-200' : 'text-slate-500'}`}>{power.toFixed(1)}</td>
                    <td className={`px-6 py-4 text-right ${yieldYf !== '0.00' ? 'text-slate-300' : 'text-slate-500'}`}>{yieldYf} kWh/kWp</td>
                    <td className="px-6 py-4 text-slate-400 text-xs flex items-center">
                      <Clock className={`w-3.5 h-3.5 mr-1.5 ${!isNormal && !isWarning ? 'text-red-500/50' : ''}`} /> 
                      <span className={!isNormal && !isWarning ? 'text-red-400/80' : ''}>{lastSync}</span>
                    </td>
                  </tr>
                )
              })}
              {filteredSites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No sites found. Visit <a href="/api/seed" className="text-amber-500 hover:underline">/api/seed</a> to populate your database with dummy data!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
