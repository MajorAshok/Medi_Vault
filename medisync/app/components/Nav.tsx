'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/Supabase'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="p-4 border-b flex gap-4 items-center">
      <Link href="/" className="font-bold">Aura Vault</Link>

      {user ? (
        <>
          <Link href="/profile">My Profile</Link>
          <Link href="/upload">Upload Report</Link>
          <Link href="/reports">My Reports</Link>
          <span className="text-sm text-gray-500 ml-auto">{user.email}</span>
          <button onClick={handleLogout} className="bg-black text-white px-3 py-1 rounded">
            Log Out
          </button>
        </>
      ) : (
        <>
          <Link href="/login">Log In</Link>
          <Link href="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  )
}