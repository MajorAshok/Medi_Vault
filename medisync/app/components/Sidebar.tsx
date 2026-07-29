'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/Supabase'
import type { User } from '@supabase/supabase-js'
import {
  User as UserIcon,
  FileText,
  TrendingUp,
  QrCode,
  Settings,
  LogOut,
  GitCompare,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const navItems = [
  { href: '/profile', labelKey: 'myProfile', icon: UserIcon },
  { href: '/upload', labelKey: 'uploadReport', icon: FileText },
  { href: '/reports', labelKey: 'summarization', icon: FileText },
  { href: '/trends', labelKey: 'healthTrends', icon: TrendingUp },
  { href: '/compare', labelKey: 'compareReports', icon: GitCompare },
  { href: '/sos', labelKey: 'medicalQrCode', icon: QrCode },
  
] as const

const publicRoutes = ['/login', '/signup', '/Signup']

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const { t } = useLanguage()

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

  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/sos/')

  if (!user || isPublicRoute) return null

  const username = user.email ? user.email.split('@')[0] : 'User'

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-72 shrink-0 h-screen sticky top-0 p-4 z-20">
      <div className="flex flex-col h-full rounded-3xl bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 overflow-hidden text-white">
        <div className="p-4 lg:p-5 flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30 shadow-sm">
            <UserIcon className="h-4.5 w-4.5 text-white" />
          </div>

          <div className="hidden lg:block overflow-hidden">
            <span className="text-[11px] text-purple-200 font-medium block">
              {t('goodMorning')}
            </span>

            <span className="text-sm font-bold text-white truncate capitalize block">
              {username}
            </span>
          </div>
        </div>

        <div className="px-3 lg:px-4 mt-2">
          <p className="hidden lg:block text-[11px] font-semibold tracking-wider text-purple-300 uppercase px-3 mb-2">
            {t('menu')}
          </p>

          <nav className="flex flex-col gap-1.5">
            {navItems.map(({ href, labelKey, icon: Icon }) => {
              const active = pathname === href

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition font-medium ${
                    active
                      ? 'bg-purple-600/80 text-white shadow-lg shadow-purple-900/40 border border-purple-400/30'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="hidden lg:inline">{t(labelKey)}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="px-3 lg:px-4 pb-4">
          <p className="hidden lg:block text-[11px] font-semibold tracking-wider text-purple-300 uppercase px-3 mb-2">
            {t('settings')}
          </p>

          <div className="flex flex-col gap-1.5">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden lg:inline">{t('settings')}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/80 hover:bg-rose-500/20 hover:text-rose-300 transition"
            >
              <LogOut className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden lg:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}