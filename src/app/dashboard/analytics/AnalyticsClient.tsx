'use client'

import { useState, useMemo } from 'react'
import { 
  BarChart3, Calendar, Filter, Zap, Activity, Clock, Award, 
  BrainCircuit, CloudRain, Sun, AlertTriangle, Download, Share2
} from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts'

// SIMULATOR ENGINE -------------------------------------------------------------
// We simulate historical data because the DB currently only has real-time inserts.

const generateTimeSeriesData = (period: string, expectedBase: number) => {
  const points = period === 'Today' ? 24 : period === 'Week' ? 7 : period === 'Month' ? 30 : 12
  const labels = period === 'Today' ? Array.from({length: 24}, (_, i) => `${i}:00`) 
    : period === 'Week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : Array.from({length: points}, (_, i) => `Day ${i+1}`)

  return labels.map((label, i) => {
    // Add some random variation, and a distinct "drop" for anomaly simulation
    const isAnomaly = period === 'Week' && i === 3 // Thursday drop
    const expected = expectedBase + (Math.sin(i) * expectedBase * 0.2)
    const actual = isAnomaly ? expected * 0.4 : expected * (0.85 + Math.random() * 0.2)
    
    return {
      time: label,
      expected: Number(expected.toFixed(1)),
      actual: Number(actual.toFixed(1)),
    }
  })
}

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
  const [selectedPeriod, setSelectedPeriod] = useState('Week')
  const [selectedVendor, setSelectedVendor] = useState('all')
  
  // 1. Simulators based on filters
  const timeSeriesData = useMemo(() => {
    const base = selectedSite === 'all' ? sites.reduce((sum, s) => sum + (s.total_kwp || 0), 0) : 
      (sites.find(s => s.id === selectedSite)?.total_kwp || 100)
    return generateTimeSeriesData(selectedPeriod, base / 2)
  }, [selectedSite, selectedPeriod, sites])

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
            <option value="Today">Today</option>
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
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Area type="monotone" dataKey="expected" name="Expected (kW)" stroke="#64748b" strokeWidth={2} fill="none" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="actual" name="Actual (kW)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
            </AreaChart>
          </ResponsiveContainer>
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
            <button className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium">
              <Download className="w-4 h-4 mr-2" /> Download CSV
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium">
              <Share2 className="w-4 h-4 mr-2" /> Share PDF Report
            </button>
          </div>
        </div>

      </div>

    </div>
  )
}
