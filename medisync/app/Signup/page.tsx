'use client'

import { useState } from 'react'
import { supabase } from '@/lib/Supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ Signed up! Check your email to confirm (or check Supabase Auth users list).')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex bg-white">
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-2%, 2%); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .drift-slow { animation: drift 10s ease-in-out infinite; }
        .drift-slower { animation: drift 16s ease-in-out infinite reverse; }
        .float-card { animation: float-slow 6s ease-in-out infinite; }
      `}</style>

      {/* LEFT — image panel with increased brightness */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1502394202744-021cfbb17454?q=80&w=1200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-125 contrast-105"
        />
        <div className="drift-slow pointer-events-none absolute -top-10 -left-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-[90px]" />
        <div className="drift-slower pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-400/15 blur-[100px]" />
        {/* Lighter scrim to maintain brightness while keeping text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        <div className="relative h-full flex flex-col justify-center px-14 max-w-xl">
          <h1 className="font-heading text-6xl font-extrabold text-white leading-[1.05] drop-shadow-lg">
            Create your<br />Free Account
          </h1>

          {/* Floating square rounded glassmorphism container wrapping tightly to the tagline */}
          <div className="mt-8 -ml-3 inline-block float-card backdrop-blur-xl bg-black/45 border border-white/20 p-8 max-w-[420px] rounded-[2.5rem] shadow-[0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
            <p
              className="text-white text-lg font-normal uppercase text-center"
              style={{
                fontFamily: 'var(--font-tagline)',
                letterSpacing: '0.3em',
                lineHeight: 1.6,
                textShadow: '0 2px 10px rgba(0,0,0,0.9)',
              }}
            >
              STORE YOUR MEDICAL RECORDS AND GET EMERGENCY-READY.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* MediSync brand mark — Gradient combo: black, teal, and rose */}
          <div className="flex items-center gap-4 mb-8 py-4 overflow-visible">
            <img
              src="/medisync-logo.png"
              alt="MediSync"
              className="h-32 w-32 object-contain shrink-0"
            />
            <span
              className="text-6xl tracking-wide font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-teal-500 to-rose-500"
              style={{
                fontFamily: 'var(--font-brand)',
                lineHeight: 1.4,
                display: 'inline-block',
              }}
            >
              MediSync
            </span>
          </div>

          <h2 className="font-heading text-5xl font-bold text-neutral-900 mb-2">
            Sign up
          </h2>
          <p className="text-base text-neutral-500 mb-8">
            Already have an account?{' '}
            <a href="/login" className="text-emerald-600 font-medium hover:underline">
              Sign In
            </a>
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <label className="font-heading text-sm font-medium text-neutral-800 mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="font-heading text-sm font-medium text-neutral-800 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3.5 text-base text-neutral-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="font-heading w-full mt-8 rounded-xl bg-gradient-to-r from-emerald-800 to-neutral-900 text-white text-base font-semibold py-4 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create an Account'}
          </button>

          {message && (
            <p className="mt-4 text-sm text-center text-neutral-500">{message}</p>
          )}
        </div>
      </div>
    </main>
  )
}