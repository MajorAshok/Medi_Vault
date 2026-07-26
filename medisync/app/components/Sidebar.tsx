'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/Supabase'
import type { User } from '@supabase/supabase-js'
import { User as UserIcon, FileText, TrendingUp, ShieldAlert, QrCode, Settings, LogOut, GitCompare} from 'lucide-react'


const navItems = [
  { href: '/profile', label: 'My Profile', icon: UserIcon },
  { href: '/reports', label: 'Summarization', icon: FileText },
  { href: '/trends', label: 'Health Trends', icon: TrendingUp },
  { href: '/compare', label: 'Compare Reports', icon: GitCompare },
  //{ href: '/sos', label: 'SOS & Emergency', icon: ShieldAlert },
  { href: '/sos', label: 'Medical QR Code', icon: QrCode },
  { href: '/upload', label: 'Upload Report', icon: FileText },
]

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-60 shrink-0 h-screen sticky top-0 p-4">
      <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <ShieldAlert className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-semibold text-foreground hidden lg:block">
            MediSync
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10 flex flex-col gap-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}