'use client'

import { useState } from 'react'
import { supabase } from '@/lib/Supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('Login response:', { data, error })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ Logged in successfully!')
    }
  }

  return (
    <main className="p-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Log In</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Log In
      </button>
      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}