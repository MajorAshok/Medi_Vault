'use client'

import { useState } from 'react'
import { supabase } from '@/lib/Supabase'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSignUp() {
    console.log('Sign up clicked')
    const { data, error } = await supabase.auth.signUp({ email, password })
    console.log('Response:', { data, error })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ Signed up! Check your email to confirm (or check Supabase Auth users list).')
    }
  }

  return (
    <main className="p-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
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
        onClick={handleSignUp}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Sign Up
      </button>
      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}