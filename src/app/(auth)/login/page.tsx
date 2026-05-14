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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-200">
      {/* Background dark gradient / image placeholder */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 to-slate-950 z-0"></div>

      <div className="z-10 w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">SolarPulse</h1>
          <p className="text-slate-400 text-sm">Login To Your Account</p>
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
  )
}
