'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { 
  BarChart3, Calendar, Filter, Zap, Activity, Clock, Award, 
  BrainCircuit, CloudRain, Sun, AlertTriangle, Download, Share2
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts'

// We no longer simulate historical data for the graph as we now fetch from the database.

const generateHeatmapData = (sites: any[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  return sites.map(site => ({
    site: site.site_name,
    data: days.map(day => {
      const rand = Math.random()
      return {
        day,
        status: rand > 0.9 ? 'red' : rand > 0.7 ? 'yellow' : 'green'
      }
    })
  }))
}

// MAIN COMPONENT ---------------------------------------------------------------

export default function AnalyticsClient({ sites, initialAlerts }: { sites: any[], initialAlerts: any[] }) {
  const [selectedSite, setSelectedSite] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('Live (Minutes)')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [liveData, setLiveData] = useState<any[]>([])
  const [graphData, setGraphData] = useState<any[]>([])
  // Keep raw data in state to make realtime aggregation accurate
  const [rawData, setRawData] = useState<any[]>([])

  useEffect(() => {
    const channel = supabase.channel('analytics-telemetry-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry' },
        (payload) => {
          const site = sites.find(s => s.id === payload.new.site_id)
          if (selectedSite === 'all' || selectedSite === payload.new.site_id) {
            setLiveData(prev => {
              const newData = [{ ...payload.new, site_name: site?.site_name || 'Unknown' }, ...prev]
              return newData.slice(0, 10)
            })

            // Add to raw data and let the useMemo handle the re-aggregation
            setRawData(prev => [...prev, payload.new])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sites, selectedSite])

  // Fetch initial graph data
  useEffect(() => {
    let isMounted = true
    const fetchGraphData = async () => {
      let startTime = new Date()
      if (selectedPeriod === 'Live (Minutes)') {
        startTime.setHours(startTime.getHours() - 1)
      } else if (selectedPeriod === 'Today (Hourly)') {
        startTime.setHours(startTime.getHours() - 24)
      } else if (selectedPeriod === 'Week') {
        startTime.setDate(startTime.getDate() - 7)
      } else if (selectedPeriod === 'Month') {
        startTime.setDate(startTime.getDate() - 30)
      } else {
        startTime.setFullYear(startTime.getFullYear() - 1)
      }

      let query = supabase.from('telemetry').select('*').gte('timestamp', startTime.toISOString()).order('timestamp', { ascending: true })
      if (selectedSite !== 'all') {
        query = query.eq('site_id', selectedSite)
      }

      const { data, error } = await query
      if (error || !isMounted || !data) return
      setRawData(data)
    }

    fetchGraphData()
    return () => { isMounted = false }
  }, [selectedPeriod, selectedSite])

  // Aggregate raw data into graph format
  useEffect(() => {
    if (rawData.length === 0) return

    const grouped: Record<string, Record<string, { total: number; count: number }>> = {}
    
    rawData.forEach(row => {
      const d = new Date(row.timestamp)
      let key = ''
      if (selectedPeriod === 'Live (Minutes)') {
        key = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      } else if (selectedPeriod === 'Today (Hourly)') {
        key = `${d.getHours().toString().padStart(2, '0')}:00`
      } else {
        key = d.toISOString().split('T')[0]
      }

      if (!grouped[key]) grouped[key] = {}
      if (!grouped[key][row.site_id]) grouped[key][row.site_id] = { total: 0, count: 0 }
      
      grouped[key][row.site_id].total += Number(row.current_power_kw || 0)
      grouped[key][row.site_id].count += 1
    })

    const capacity = selectedSite === 'all' ? sites.reduce((sum, s) => sum + (s.total_kwp || 0), 0) : (sites.find(s => s.id === selectedSite)?.total_kwp || 10)
    
    const formatted = Object.keys(grouped).map(key => {
      let bucketTotal = 0;
      Object.keys(grouped[key]).forEach(siteId => {
        bucketTotal += grouped[key][siteId].total / grouped[key][siteId].count
      })

      return {
        time: key,
        expected: capacity,
        actual: Number(bucketTotal.toFixed(2))
      }
    })

    // Sort chronologically just in case
    formatted.sort((a, b) => a.time.localeCompare(b.time))
    
    // For live view, only keep the latest 60 points to avoid squishing
    if (selectedPeriod === 'Live (Minutes)' && formatted.length > 60) {
      setGraphData(formatted.slice(-60))
    } else {
      setGraphData(formatted)
    }
  }, [rawData, selectedPeriod, selectedSite, sites])

  const heatmapData = useMemo(() => generateHeatmapData(sites), [sites])

  // 2. Calculated KPIs (Simulated based on selected period/site)
  const isAll = selectedSite === 'all'
  const yf = isAll ? 4.8 : 5.2 + (Math.random() * 0.8 - 0.4) // Specific Yield
  const pr = isAll ? 91 : 94 + (Math.random() * 4 - 2) // Performance Ratio %
  const downtime = isAll ? 45 : Math.floor(Math.random() * 30) // Minutes
  const efficiency = pr * 0.95 + (Math.random() * 5) // Efficiency Score %

  // Gauge setup
  const gaugeData = [
    { name: 'Yield', value: yf, fill: yf > 5 ? '#10b981' : yf > 3 ? '#f59e0b' : '#ef4444' },
    { name: 'Remaining', value: 7 - yf, fill: '#1e293b' }
  ]

  // Ranking setup
  const rankedSites = [...sites].map(s => ({
    ...s,
    pr: 85 + Math.random() * 12
  })).sort((a, b) => b.pr - a.pr)
  // Export handlers
  const handleDownloadCSV = () => {
    const headers = ['Time', 'Expected (kW)', 'Actual (kW)'];
    const csvContent = [
      headers.join(','),
      ...graphData.map(row => `${row.time},${row.expected},${row.actual}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `solarpulse_export_${selectedSite}_${selectedPeriod.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSharePDF = () => {
    window.print();
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d131f] p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
            <Filter className="w-5 h-5 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Analytics Engine</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <select 
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            <option value="all">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.site_name}</option>)}
          </select>

          <select 
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="Live (Minutes)">Live (Minutes)</option>
            <option value="Today (Hourly)">Today (Hourly)</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
            <option value="Year">This Year</option>
          </select>

          <select 
            className="bg-[#131b2c] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          >
            <option value="all">All Vendors</option>
            <option value="huawei">Huawei</option>
            <option value="deye">Deye</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Specific Yield</h3>
            <div className="p-1.5 bg-slate-800/50 rounded-lg text-emerald-400"><Zap className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-white">{yf.toFixed(1)}</span>
            <span className="text-slate-400 font-medium mb-1">kWh/kWp</span>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Performance Ratio</h3>
            <div className="p-1.5 bg-slate-800/50 rounded-lg text-amber-400"><Activity className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-white">{pr.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Downtime</h3>
            <div className="p-1.5 bg-slate-800/50 rounded-lg text-red-400"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-white">{downtime}</span>
            <span className="text-slate-400 font-medium mb-1">mins</span>
          </div>
        </div>

        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-amber-500 text-xs font-bold tracking-wider uppercase">Efficiency Score</h3>
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500"><Award className="w-4 h-4" /></div>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-3xl font-bold text-white">{efficiency.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* HERO GRAPH */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Generation vs Expected</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="expected" name="Expected (kW)" stroke="#64748b" strokeWidth={2} fill="none" strokeDasharray="5 5" dot={{ r: 2, fill: '#64748b' }} />
              <Area type="monotone" dataKey="actual" name="Actual (kW)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" dot={{ r: 4, fill: '#10b981', stroke: '#0d131f', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LIVE TELEMETRY FEED */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 bg-[#131b2c] flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Live Telemetry Feed</h2>
          </div>
          <div className="text-xs text-slate-400 flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            Listening for live data
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#0d131f] border-b border-slate-800 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Site</th>
                <th className="px-6 py-4">Power (kW)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {liveData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Waiting for live data points... Ensure the simulator script is running.
                  </td>
                </tr>
              ) : (
                liveData.map((data, idx) => (
                  <tr key={data.id || idx} className="hover:bg-slate-800/30 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {data.site_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-400">{Number(data.current_power_kw).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        data.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {data.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GAUGE & RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Specific Yield Gauge */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center relative">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase absolute top-6 left-6">Specific Yield</h2>
          
          <div className="h-[200px] w-full mt-8 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2">
              <span className="text-4xl font-bold text-white">{yf.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-medium">kWh/kWp</span>
            </div>
          </div>
          <div className="flex justify-between w-full mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider px-8">
            <span className="text-red-500">Poor</span>
            <span className="text-emerald-500">Excellent</span>
          </div>
        </div>

        {/* Fleet Ranking */}
        <div className="lg:col-span-2 bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Fleet Performance Ranking</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {rankedSites.map((site, idx) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{site.site_name}</div>
                    <div className="text-xs text-slate-500">{site.total_kwp} kWp Capacity</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${site.pr > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{site.pr.toFixed(1)}%</div>
                  <div className="text-xs text-slate-500">PR Score</div>
                </div>
              </div>
            ))}
            {rankedSites.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-8">No sites available to rank.</div>
            )}
          </div>
        </div>
      </div>

      {/* HEATMAP & INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Efficiency Heatmap */}
        <div className="lg:col-span-2 bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Efficiency Heatmap (Last 5 Days)</h2>
          
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Header row */}
              <div className="flex mb-2">
                <div className="w-48"></div>
                <div className="flex-1 flex justify-between px-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                    <div key={day} className="text-xs font-bold text-slate-500 uppercase w-10 text-center">{day}</div>
                  ))}
                </div>
              </div>
              
              {/* Data rows */}
              <div className="space-y-2">
                {heatmapData.map((row, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-48 text-sm font-medium text-slate-300 truncate pr-4">{row.site}</div>
                    <div className="flex-1 flex justify-between px-2">
                      {row.data.map((cell, j) => (
                        <div 
                          key={j} 
                          className={`w-10 h-10 rounded-lg border border-slate-800/50 ${
                            cell.status === 'green' ? 'bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 
                            cell.status === 'yellow' ? 'bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                            'bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
                {heatmapData.length === 0 && (
                  <div className="text-slate-500 text-sm py-4">No sites configured.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-[#1a1528] border border-purple-900/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(147,51,234,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center space-x-2 mb-6">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">AI Insights</h2>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="p-4 bg-purple-950/30 border border-purple-900/50 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">Underperformance Detected</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Site Alpha is underperforming expected generation by 35%. Irradiance is high. Possible panel soiling or shading issue detected.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-950/30 border border-purple-900/50 rounded-xl">
              <div className="flex items-start space-x-3">
                <Activity className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">Battery Degradation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Charge cycles for Site Gamma have increased by 15% this week. High ambient temperatures correlate with this change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ANOMALY TIMELINE */}
      <div className="bg-[#0d131f] border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 bg-[#0d131f] flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">Anomaly Timeline</h2>
          </div>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="flex space-x-8 min-w-max pb-2">
            {[
              { time: '10:20 AM', msg: 'Output dropped below expected', type: 'warning' },
              { time: '11:45 AM', msg: 'Battery SOC low', type: 'warning' },
              { time: '12:30 PM', msg: 'Inverter offline', type: 'critical' },
              { time: '1:15 PM', msg: 'Generation restored', type: 'normal' }
            ].map((event, i) => (
              <div key={i} className="flex flex-col relative pl-6 min-w-[200px]">
                <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                  event.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                  event.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 
                  'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                }`}></div>
                {i !== 3 && <div className="absolute left-[5px] top-4 bottom-[-20px] w-0.5 bg-slate-800/50"></div>}
                <div className="text-xs font-bold text-slate-500 mb-1">{event.time}</div>
                <div className={`text-sm ${
                  event.type === 'critical' ? 'text-red-400' : 
                  event.type === 'warning' ? 'text-amber-400' : 
                  'text-emerald-400'
                }`}>{event.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEATHER & EXPORT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Weather Correlation */}
        <div className="md:col-span-2 bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-2">Weather Context</h2>
            <p className="text-xs text-slate-400">Comparing expected generation models against local weather APIs.</p>
          </div>
          
          <div className="flex space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1 text-slate-400"><Sun className="w-4 h-4 mr-1"/> Temp</div>
              <div className="text-xl font-bold text-white">29°C</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1 text-slate-400"><CloudRain className="w-4 h-4 mr-1"/> Clouds</div>
              <div className="text-xl font-bold text-white">12%</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1 text-slate-400"><Zap className="w-4 h-4 mr-1"/> Irradiance</div>
              <div className="text-xl font-bold text-white">920 <span className="text-xs font-normal text-slate-500">W/m²</span></div>
            </div>
          </div>
        </div>

        {/* Export Panel */}
        <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-center">
          <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Export Reports</h2>
          <div className="space-y-3">
            <button 
              onClick={handleDownloadCSV}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </button>
            <button 
              onClick={handleSharePDF}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share PDF Report
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
