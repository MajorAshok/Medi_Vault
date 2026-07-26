'use client'

import { useState } from 'react'
import { supabase } from '@/lib/Supabase'
import SplashScreen from '@/app/components/SplashScreen'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
    } else {
      setShowSplash(true)
    }
  }

  if (showSplash) {
    return <SplashScreen onDone={() => { window.location.href = '/profile' }} />
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Main Split Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col lg:flex-row overflow-hidden relative z-10">

        {/* LEFT — Form Section (solid white) */}
        <div className="w-full lg:w-1/2 p-10 lg:p-14 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-10 overflow-visible">
              <img
                src="/medisync-logo.png"
                alt="MediSync"
                className="h-32 w-32 object-contain shrink-0"
              />
              <span
                className="text-5xl tracking-wide font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-teal-500 to-rose-500"
                style={{ fontFamily: 'var(--font-brand)', lineHeight: 1.2 }}
              >
                MediSync
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Welcome Back!
            </h1>
            <p className="text-sm text-neutral-500 mb-8">
              Please Log in to your account.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between my-5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-600">
                <input type="checkbox" className="rounded border-neutral-300 text-teal-600 focus:ring-teal-500" />
                Remember me
              </label>
              <a href="#" className="text-rose-500 hover:underline font-medium">Forgot password?</a>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 rounded-xl bg-[#0f5144] text-white text-sm font-semibold py-3.5 transition hover:bg-[#0c4136] disabled:opacity-60 shadow-lg shadow-teal-900/10"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <a
                href="/Signup"
                className="flex-1 text-center rounded-xl border border-neutral-200 text-neutral-700 text-sm font-semibold py-3.5 transition hover:bg-neutral-50"
              >
                Create account
              </a>
            </div>

            {message && (
              <p className="mt-4 text-xs text-center text-neutral-500">{message}</p>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 mt-10 leading-relaxed">
            By logging up you agree to our term and that you have read our data policy.
          </p>
        </div>

        {/* RIGHT — Centered Background Video Section */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-neutral-950 flex items-center justify-center">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center scale-110"
          >
            <source src="/login-bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

      </div>
    </main>
  )
}