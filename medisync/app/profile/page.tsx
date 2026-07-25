'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/Supabase'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in to view this page.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      setMessage(`Error loading profile: ${error.message}`)
    } else if (data) {
      setFullName(data.full_name || '')
      setBloodType(data.blood_type || '')
      setEmergencyContact(data.emergency_contact || '')
    }

    setLoading(false)
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in to save.')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        blood_type: bloodType,
        emergency_contact: emergencyContact,
      })
      .eq('id', user.id)

    if (error) {
      setMessage(`Error saving: ${error.message}`)
    } else {
      setMessage('✅ Profile saved!')
    }
  }

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <main className="p-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Blood Type"
        value={bloodType}
        onChange={(e) => setBloodType(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Emergency Contact"
        value={emergencyContact}
        onChange={(e) => setEmergencyContact(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Save Profile
      </button>
      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}