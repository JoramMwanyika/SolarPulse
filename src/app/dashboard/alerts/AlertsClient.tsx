'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Bell, Search, Filter, AlertTriangle, AlertCircle, 
  CheckCircle2, Info, X, Clock, Wrench, Download, Zap, ChevronRight, Activity
} from 'lucide-react'
import { createClientComponentClient } from '@/utils/supabase/client'
import { resolveAlert, acknowledgeAlert } from './actions'

// Helpers
const timeSince = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const getDuration = (dateString: string) => {
  const mins = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000)
  if (mins < 60) return `${mins} mins`
  return `${Math.floor(mins / 60)} hrs ${mins % 60} mins`
}

export default function AlertsClient({ sites, initialAlerts }: { sites: any[], initialAlerts: any[] }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('open')
  const [filterSite, setFilterSite] = useState('all')

  const supabase = createClientComponentClient()

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, payload => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
        } else if (payload.eventType === 'DELETE') {
          setAlerts(prev => prev.filter(a => a.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Filter Logic
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const siteName = sites.find(s => s.id === a.site_id)?.site_name?.toLowerCase() || ''
      const msg = a.message.toLowerCase()
      
      if (search && !siteName.includes(search.toLowerCase()) && !msg.includes(search.toLowerCase())) return false
      if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false
      
      const isAck = a.message.startsWith('[ACK]')
      if (filterStatus === 'open' && a.is_resolved) return false
      if (filterStatus === 'resolved' && !a.is_resolved) return false
      if (filterStatus === 'acknowledged' && (!isAck || a.is_resolved)) return false
      
      if (filterSite !== 'all' && a.site_id !== filterSite) return false
      
      return true
    })
  }, [alerts, search, filterSeverity, filterStatus, filterSite, sites])

  // KPIs
  const kpiOpen = alerts.filter(a => !a.is_resolved).length
  const kpiCritical = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length
  const kpiWarning = alerts.filter(a => !a.is_resolved && a.severity === 'warning').length
  const kpiResolved = alerts.filter(a => a.is_resolved).length // Simplified for demo, usually filtered by "today"

  // Selected Alert Context
  const selectedAlert = alerts.find(a => a.id === selectedAlertId)
  const selectedSite = selectedAlert ? sites.find(s => s.id === selectedAlert.site_id) : null

  // Recommended Actions Logic
  const getRecommendations = (msg: string) => {
    const lowerMsg = msg.toLowerCase()
    if (lowerMsg.includes('offline') || lowerMsg.includes('communication')) {
      return [
        'Verify internet connectivity at the site router',
        'Check inverter communication module status LEDs',
        'Restart data logger/communication dongle'
      ]
    }
    if (lowerMsg.includes('battery') || lowerMsg.includes('soc')) {
      return [
        'Reduce immediate load demand if possible',
        'Verify grid or solar charging source is active',
        'Inspect battery temperature and cycle logs'
      ]
    }
    if (lowerMsg.includes('output') || lowerMsg.includes('generation') || lowerMsg.includes('threshold')) {
      return [
        'Review current local weather conditions (irradiance/cloud cover)',
        'Check for physical shading or heavy panel soiling',
        'Verify DC input voltage from PV strings'
      ]
    }
    return ['Acknowledge alert and monitor system state', 'Dispatch field technician if issue persists']
  }

  // Handlers
  const handleResolve = async (id: string) => {
    await resolveAlert(id)
    if (selectedAlertId === id) setSelectedAlertId(null)
  }

  const handleAcknowledge = async (id: string) => {
    await acknowledgeAlert(id)
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-10 flex flex-col h-full overflow-hidden">
      
      {/* SECTION 1: FILTERS BAR */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-4 shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center w-full md:w-auto space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#131b2c] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <select 
            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="open">Status: Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="all">All Statuses</option>
          </select>

          <select 
            value={filterSite} onChange={(e) => setFilterSite(e.target.value)}
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">Site: All</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
          </select>
        </div>
      </div>

      {/* SECTION 2: KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-4"><Bell className="w-5 h-5 text-slate-400" /></div>
          <div>
            <div className="text-2xl font-bold text-white">{kpiOpen}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Open Alerts</div>
          </div>
        </div>
        <div className="bg-[#1a1111] border border-red-900/30 rounded-2xl p-4 shadow-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-red-950 flex items-center justify-center mr-4"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div>
            <div className="text-2xl font-bold text-red-500">{kpiCritical}</div>
            <div className="text-xs text-red-500/70 uppercase tracking-wider font-semibold">Critical Alerts</div>
          </div>
        </div>
        <div className="bg-[#1a160d] border border-amber-900/30 rounded-2xl p-4 shadow-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-amber-950 flex items-center justify-center mr-4"><AlertCircle className="w-5 h-5 text-amber-500" /></div>
          <div>
            <div className="text-2xl font-bold text-amber-500">{kpiWarning}</div>
            <div className="text-xs text-amber-500/70 uppercase tracking-wider font-semibold">Warning Alerts</div>
          </div>
        </div>
        <div className="bg-[#0d1a15] border border-emerald-900/30 rounded-2xl p-4 shadow-lg flex items-center">
          <div className="w-10 h-10 rounded-full bg-emerald-950 flex items-center justify-center mr-4"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">{kpiResolved}</div>
            <div className="text-xs text-emerald-500/70 uppercase tracking-wider font-semibold">Resolved Today</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT: FEED & DRAWER */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[600px] overflow-hidden">
        
        {/* SECTION 3: LIVE ALERT FEED */}
        <div className={`bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg flex flex-col flex-1 transition-all duration-300 ${selectedAlertId ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#131b2c]/30 rounded-t-2xl">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center">
              <Activity className="w-4 h-4 mr-2 text-amber-500" />
              Live Feed
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
               <div className="text-center py-10 text-slate-500 text-sm">No alerts match your filters.</div>
            ) : filteredAlerts.map(alert => {
              const isCrit = alert.severity === 'critical'
              const isWarn = alert.severity === 'warning'
              const colorBase = isCrit ? 'red' : isWarn ? 'amber' : 'blue'
              const Icon = isCrit ? AlertTriangle : isWarn ? AlertCircle : Info
              const siteName = sites.find(s => s.id === alert.site_id)?.site_name || 'Unknown Site'
              const isAck = alert.message.startsWith('[ACK]')
              const msg = isAck ? alert.message.replace('[ACK]', '').trim() : alert.message
              const isSelected = selectedAlertId === alert.id

              return (
                <div 
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    isSelected ? `bg-${colorBase}-950/40 border-${colorBase}-500 shadow-[0_0_15px_rgba(var(--color-${colorBase}-500),0.1)]` 
                    : `bg-slate-900/50 border-slate-800 hover:border-${colorBase}-900 hover:bg-slate-800/50`
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg bg-${colorBase}-950 text-${colorBase}-500`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-bold tracking-wider uppercase text-${colorBase}-500`}>
                          {alert.severity}
                        </div>
                        <div className="font-semibold text-white text-sm">{siteName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{timeSince(alert.created_at)}</div>
                      <div className="text-xs text-slate-500 flex items-center justify-end mt-0.5">
                        <Clock className="w-3 h-3 mr-1" /> {getDuration(alert.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">{msg}</p>
                  
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      {alert.is_resolved ? (
                        <span className="px-2 py-1 bg-emerald-950/50 text-emerald-400 text-xs rounded border border-emerald-900/50 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                        </span>
                      ) : isAck ? (
                        <span className="px-2 py-1 bg-blue-950/50 text-blue-400 text-xs rounded border border-blue-900/50">
                          Acknowledged
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded">
                          Open
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!alert.is_resolved && !isAck && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id) }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!alert.is_resolved && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleResolve(alert.id) }}
                          className={`px-3 py-1 bg-${colorBase}-950 hover:bg-${colorBase}-900 text-${colorBase}-400 text-xs rounded transition-colors`}
                        >
                          Resolve
                        </button>
                      )}
                      <button className="px-2 py-1 text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTION 4: ALERT DETAIL DRAWER */}
        {selectedAlert && selectedSite && (
          <div className="w-full lg:w-1/2 bg-[#131b2c] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#182235]">
              <h2 className="text-sm font-bold text-white tracking-wider uppercase">Incident Console</h2>
              <button onClick={() => setSelectedAlertId(null)} className="p-1 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              
              {/* Context Summary */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${selectedAlert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'} shadow-[0_0_10px_rgba(currentColor,0.5)]`}></div>
                  <h3 className="text-xl font-bold text-white">{selectedSite.site_name}</h3>
                </div>
                
                <div className="bg-[#0a0e17] rounded-xl p-4 border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Started</div>
                    <div className="text-sm text-slate-200 font-medium">{new Date(selectedAlert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Duration</div>
                    <div className="text-sm text-slate-200 font-medium">{getDuration(selectedAlert.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Status</div>
                    <div className="text-sm text-slate-200 font-medium">
                      {selectedAlert.is_resolved ? 'Resolved' : selectedAlert.message.startsWith('[ACK]') ? 'Acknowledged' : 'Open'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Severity</div>
                    <div className="text-sm uppercase font-bold" style={{ color: selectedAlert.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                      {selectedAlert.severity}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: RECOMMENDED ACTIONS */}
              {!selectedAlert.is_resolved && (
                <div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-amber-500" /> Suggested Actions
                  </h4>
                  <div className="space-y-2">
                    {getRecommendations(selectedAlert.message).map((rec, i) => (
                      <label key={i} className="flex items-start p-3 bg-slate-800/30 border border-slate-800 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <input type="checkbox" className="mt-0.5 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/50" />
                        <span className="ml-3 text-sm text-slate-300">{rec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 6: ALERT TIMELINE */}
              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" /> Lifecycle Timeline
                </h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-800 bg-amber-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-800 bg-[#0a0e17] shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-200 text-sm">Alert Created</div>
                        <time className="font-mono text-xs text-slate-500">{new Date(selectedAlert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                      </div>
                      <div className="text-slate-400 text-xs">System detected an anomaly and generated this incident.</div>
                    </div>
                  </div>

                  {selectedAlert.message.startsWith('[ACK]') && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-800 bg-blue-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-800 bg-[#0a0e17] shadow">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-200 text-sm">Acknowledged</div>
                        </div>
                        <div className="text-slate-400 text-xs">Operator acknowledged the alert and began investigation.</div>
                      </div>
                    </div>
                  )}

                  {selectedAlert.is_resolved && (
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-800 bg-emerald-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-slate-800 bg-[#0a0e17] shadow">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-200 text-sm">Resolved</div>
                        </div>
                        <div className="text-slate-400 text-xs">Issue has been marked as resolved and closed.</div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* SECTION 7: ACTIONS FOOTER */}
            <div className="p-4 border-t border-slate-700 bg-[#182235] flex items-center justify-between">
              <button className="flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Download className="w-4 h-4 mr-2" /> Export Log
              </button>
              
              <div className="flex space-x-3">
                {!selectedAlert.is_resolved && !selectedAlert.message.startsWith('[ACK]') && (
                  <button onClick={() => handleAcknowledge(selectedAlert.id)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Acknowledge
                  </button>
                )}
                {!selectedAlert.is_resolved && (
                  <button onClick={() => handleResolve(selectedAlert.id)} className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-lg transition-colors">
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
