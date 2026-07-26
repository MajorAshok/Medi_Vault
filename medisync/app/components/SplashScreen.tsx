'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  const brandName = 'MediSync'

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 600)
    }, 2400)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden transition-opacity duration-600 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <style>{`
        @keyframes bg-sweep {
          0% { transform: scale(1) rotate(0deg); opacity: 0.3; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 0.6; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.3; }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.3); opacity: 0.9; border-width: 3px; }
          100% { transform: scale(2.6); opacity: 0; border-width: 0.5px; }
        }
        @keyframes icon-entrance {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          55% { transform: scale(1.15) rotate(8deg); opacity: 1; }
          75% { transform: scale(0.95) rotate(-4deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes icon-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(16,185,129,0.5)); }
          50% { filter: drop-shadow(0 0 22px rgba(16,185,129,0.9)); }
        }
        @keyframes letter-in {
          0% { transform: translateY(14px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes tagline-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer-sweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        .bg-sweep { animation: bg-sweep 6s ease-in-out infinite; }
        .ring-1 { animation: ring-expand 2s cubic-bezier(0.2,0.6,0.4,1) 0.1s infinite; }
        .ring-2 { animation: ring-expand 2s cubic-bezier(0.2,0.6,0.4,1) 0.7s infinite; }
        .ring-3 { animation: ring-expand 2s cubic-bezier(0.2,0.6,0.4,1) 1.3s infinite; }
        .icon-wrap {
          animation: icon-entrance 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards,
                     icon-glow 2s ease-in-out 0.9s infinite;
        }
        .letter {
          display: inline-block;
          animation: letter-in 0.5s cubic-bezier(0.2,0.8,0.3,1) forwards;
          opacity: 0;
        }
        .tagline {
          animation: tagline-in 0.6s ease-out 1.4s forwards;
          opacity: 0;
        }
        .shimmer {
          animation: shimmer-sweep 2.4s ease-in-out 1.9s infinite;
        }
      `}</style>

      {/* rotating ambient background */}
      <div className="bg-sweep pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[110px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* pulse rings + icon */}
        <div className="relative h-24 w-24 flex items-center justify-center mb-6">
          <div className="ring-1 absolute inset-0 rounded-full border border-emerald-400" />
          <div className="ring-2 absolute inset-0 rounded-full border border-cyan-400" />
          <div className="ring-3 absolute inset-0 rounded-full border border-fuchsia-400" />

          <div className="icon-wrap relative h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-xl">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 L20 5 V11 C20 16.5 16.5 20.7 12 22 C7.5 20.7 4 16.5 4 11 V5 Z" />
              <path d="M12 8 V15 M8.5 11.5 H15.5" />
            </svg>
          </div>
        </div>

        {/* letter-by-letter brand name */}
        <h1 className="font-heading text-4xl font-bold text-foreground tracking-tight relative overflow-hidden">
          {brandName.split('').map((char, i) => (
            <span
              key={i}
              className="letter"
              style={{ animationDelay: `${0.9 + i * 0.06}s` }}
            >
              {char}
            </span>
          ))}
          <span className="shimmer pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </h1>

        <p className="tagline text-sm text-muted-foreground mt-2 tracking-wide">
          Your health, always within reach
        </p>
      </div>
    </div>
  )
}