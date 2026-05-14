import Link from 'next/link'
import { Map, BarChart3, Settings, Bell, LogOut } from 'lucide-react'
import { signout } from '../(auth)/actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-200 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/60 bg-[#0d131f] flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SolarPulse</span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 mt-4">
            <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl bg-[#131b2c] text-emerald-400 border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all">
              <Map className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Fleet Map</span>
            </Link>
            
            <Link href="/dashboard/analytics" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Analytics</span>
            </Link>

            <Link href="/dashboard/admin" className="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Admin Setup</span>
            </Link>

            <Link href="/dashboard/alerts" className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
              <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Alerts</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* Database Status and Signout */}
        <div className="p-6 border-t border-slate-800/60 flex flex-col space-y-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <span className="text-sm font-semibold text-emerald-500">Database Live</span>
            </div>
            <span className="text-xs text-slate-500 ml-5.5">Connected to Supabase</span>
          </div>
          
          <form action={signout}>
            <button type="submit" className="w-full flex items-center justify-center px-4 py-2 mt-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-red-950/30 hover:border-red-900/50 transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/60 bg-[#0A0E17]">
          <h1 className="text-sm font-bold text-slate-300 tracking-wider uppercase">Global Fleet Overview</h1>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span>Auto-refresh: 30s</span>
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
            
            <div className="flex items-center space-x-2 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg bg-[#0d131f]">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>May 23, 2026 | 12:42:15 PM</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 bg-[#0A0E17]">
          {children}
        </div>
      </main>
    </div>
  )
}
