'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User, Mail, Lock, Building2 } from 'lucide-react'
import { signup } from '../actions'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden text-slate-200">
      {/* Background dark gradient / image placeholder */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072&auto=format&fit=crop')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/40 z-0"></div>

      <div className="z-10 w-full max-w-lg p-8 md:p-12 ml-0 lg:ml-[10%] xl:ml-[15%] flex flex-col justify-center">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">Solar<br/><span className="text-[0.6rem] text-slate-400 font-normal leading-none block">Pulse</span></span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-slate-400">Join thousands of users monitoring their solar systems</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Create a strong password"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="password" 
                  name="confirmPassword"
                  required
                  placeholder="Confirm your password"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Organization (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  name="organization"
                  placeholder="Enter organization name"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 rounded border-slate-700 bg-slate-900/50 text-amber-500 focus:ring-amber-500/50" />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I agree to the <Link href="#" className="text-amber-500 hover:underline">Terms of Service</Link> and <Link href="#" className="text-amber-500 hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-2.5 px-4 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            
            <div className="relative py-3 flex items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase">OR</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="space-y-3">
              <button type="button" className="w-full flex items-center justify-center space-x-2 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-lg py-2.5 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span className="text-sm text-slate-300">Sign up with Google</span>
              </button>
            </div>
            
            <div className="pt-4 text-center">
              <span className="text-sm text-slate-400">
                Already have an account? <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium">Login</Link>
              </span>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-xs text-slate-600 text-center">
          © 2026 SolarPulse. All rights reserved.
        </div>
      </div>
    </div>
  )
}
