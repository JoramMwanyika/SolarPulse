import Link from 'next/link'
import { CheckCircle2, BarChart2, BellRing, Shield, Play } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-200 font-sans selection:bg-amber-500/30">
      {/* Background Image / Overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-[800px] bg-cover bg-center opacity-30 mix-blend-overlay z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-[#0A0E17]/20 via-[#0A0E17]/80 to-[#0A0E17] z-0"></div>

      <div className="relative z-10">
        {/* Navigation */}
        <header className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">Solar<br/><span className="text-[0.6rem] text-slate-400 font-normal leading-none block">Pulse</span></span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link href="#" className="hover:text-white transition-colors">Features</Link>
            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-white transition-colors">About</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/login" className="px-5 py-2 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-colors">
              Sign Up
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-20 pb-24 max-w-7xl">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-500 text-xs font-semibold tracking-wide mb-6 bg-amber-500/10">
              Smart Monitoring. Maximum Performance.
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Take Control of Your <br />
              <span className="text-amber-500">Solar</span> Performance
            </h1>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl leading-relaxed">
              SolarPulse helps you monitor, analyze, and optimize your solar energy systems in real-time. Increase efficiency, reduce costs, and maximize your savings.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/signup" className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                Get Started Free
              </Link>
              <button className="px-8 py-4 flex items-center text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 rounded-lg transition-all font-semibold">
                <Play className="w-5 h-5 mr-2 text-amber-500" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0d131f]/80 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl flex items-center">
              <div className="p-3 bg-emerald-500/10 rounded-lg mr-4 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
              <div>
                <div className="text-2xl font-bold text-white">120+</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Installations</div>
              </div>
            </div>
            <div className="bg-[#0d131f]/80 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-lg mr-4 text-blue-500"><ActivityIcon className="w-6 h-6" /></div>
              <div>
                <div className="text-2xl font-bold text-white">98.8%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">System Uptime</div>
              </div>
            </div>
            <div className="bg-[#0d131f]/80 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl flex items-center">
              <div className="p-3 bg-amber-500/10 rounded-lg mr-4 text-amber-500"><ZapIcon className="w-6 h-6" /></div>
              <div>
                <div className="text-2xl font-bold text-white">2.4GWh</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Energy Monitored</div>
              </div>
            </div>
            <div className="bg-[#0d131f]/80 backdrop-blur-md border border-slate-800/60 p-6 rounded-2xl flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-lg mr-4 text-purple-500"><ClockIcon className="w-6 h-6" /></div>
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="bg-[#0A0E17] py-24 border-t border-slate-800/50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <div className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">Powerful Features</div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything You Need to Manage<br/>Your Solar Systems</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">Advanced monitoring, intelligent analytics, and real-time alerts to keep your solar systems performing at their best.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0d131f] border border-slate-800 p-8 rounded-2xl hover:border-slate-600 transition-colors group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Monitoring</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Monitor your solar systems 24/7 with real-time data and instant updates.</p>
              </div>

              <div className="bg-[#0d131f] border border-slate-800 p-8 rounded-2xl hover:border-slate-600 transition-colors group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                  <ActivityIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Advanced Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Get detailed insights and reports to optimize your energy production.</p>
              </div>

              <div className="bg-[#0d131f] border border-slate-800 p-8 rounded-2xl hover:border-slate-600 transition-colors group">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform border border-amber-500/20">
                  <BellRing className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Alerts</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Receive instant notifications about system performance and potential issues.</p>
              </div>

              <div className="bg-[#0d131f] border border-slate-800 p-8 rounded-2xl hover:border-slate-600 transition-colors group">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform border border-purple-500/20">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Secure & Reliable</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Enterprise-grade security with 99.9% uptime guarantee.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 bg-[#0A0E17] pt-16 pb-8">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white uppercase tracking-widest">Solar<span className="text-[0.5rem] text-slate-400 font-normal leading-none block">Pulse</span></span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">Empowering a sustainable future through intelligent solar monitoring.</p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between">
              <div className="text-slate-600 text-sm mb-4 md:mb-0">
                © 2026 SolarPulse. All rights reserved.
              </div>
              <div className="flex space-x-4 text-slate-500">
                {/* Social Icons Placeholder */}
                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center hover:text-white hover:border-white transition-colors cursor-pointer"><span className="text-[10px]">f</span></div>
                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center hover:text-white hover:border-white transition-colors cursor-pointer"><span className="text-[10px]">t</span></div>
                <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center hover:text-white hover:border-white transition-colors cursor-pointer"><span className="text-[10px]">in</span></div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  )
}

function ZapIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  )
}

function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
