'use client'

import Link from 'next/link'
import { useState } from 'react'
import { login } from '../actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden text-slate-200">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute bottom-16 left-12 right-12">
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Monitor Your Solar<br/><span className="text-amber-500">Performance</span></h2>
          <p className="text-slate-300 text-lg max-w-md">Access your intelligent solar monitoring dashboard and take control of your clean energy production today.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative p-8">
        {/* original background for mobile */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 lg:hidden"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 to-slate-950 z-0 lg:hidden"></div>

        <div className="z-10 w-full max-w-md p-8 lg:p-10 bg-slate-900/40 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border border-slate-800/60 lg:border-none rounded-2xl">
          <div className="flex flex-col items-center mb-10 lg:items-start lg:text-left text-center">
            <div className="lg:hidden w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm">Login to your SolarPulse account</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">E-mail</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-900/50 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-slate-950" />
              <span className="text-slate-400">Remember Me</span>
            </label>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-900 font-semibold py-3 px-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/signup" className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
            Create New Account
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-xs text-slate-600 z-10">
        Powered by SolarPulse
      </div>
      </div>
    </div>
  )
}
