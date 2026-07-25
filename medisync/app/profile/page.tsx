'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/Supabase'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [allergies, setAllergies] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [medicalConditions, setMedicalConditions] = useState('')
  const [organDonor, setOrganDonor] = useState(false)
  const [primaryEmergencyContact, setPrimaryEmergencyContact] = useState('')
  const [secondaryEmergencyContact, setSecondaryEmergencyContact] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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

    setEmail(user.email || '')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      setMessage(`Error loading profile: ${error.message}`)
    } else if (data) {
      setFullName(data.full_name || '')
      setPhoneNumber(data.phone_number || '')
      setDateOfBirth(data.date_of_birth || '')
      setBloodType(data.blood_type || '')
      setAllergies(data.allergies || '')
      setCurrentMedications(data.current_medications || '')
      setMedicalConditions(data.medical_conditions || '')
      setOrganDonor(data.organ_donor || false)
      setPrimaryEmergencyContact(data.primary_emergency_contact || '')
      setSecondaryEmergencyContact(data.secondary_emergency_contact || '')
      setAvatarPath(data.avatar_path || '')
    }

    setLoading(false)
  }

  function calculateAge(dob: string) {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return

    setUploadingAvatar(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploadingAvatar(false)
      return
    }

    const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) {
      setMessage(`Error uploading photo: ${uploadError.message}`)
      setUploadingAvatar(false)
      return
    }

    setAvatarPath(filePath)
    setMessage('✅ Photo uploaded — click Save Profile to confirm.')
    setUploadingAvatar(false)
  }

  function getAvatarUrl(path: string) {
    if (!path) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
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
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth || null,
        blood_type: bloodType,
        allergies: allergies,
        current_medications: currentMedications,
        medical_conditions: medicalConditions,
        organ_donor: organDonor,
        primary_emergency_contact: primaryEmergencyContact,
        secondary_emergency_contact: secondaryEmergencyContact,
        avatar_path: avatarPath,
      })
      .eq('id', user.id)

    if (error) {
      setMessage(`Error saving: ${error.message}`)
    } else {
      setMessage('✅ Profile saved!')
    }
  }

  if (loading) return <p className="p-10">Loading...</p>

  const age = calculateAge(dateOfBirth)
  const avatarUrl = getAvatarUrl(avatarPath)

  return (
    <main className="p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      {avatarUrl && (
        <img src={avatarUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-2" />
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
        className="text-sm mb-2"
      />
      <button
        onClick={handleAvatarUpload}
        disabled={!avatarFile || uploadingAvatar}
        className="bg-gray-700 text-white px-3 py-1 rounded text-sm mb-4 disabled:opacity-50"
      >
        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
      </button>

      <p className="text-sm text-gray-500 mb-4">Email: {email}</p>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <label className="text-sm text-gray-600">Date of Birth</label>
      <input
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        className="border p-2 w-full mb-1 rounded"
      />
      {age !== null && <p className="text-sm text-gray-500 mb-2">Age: {age}</p>}

      <h2 className="font-semibold mt-4 mb-2">🚑 Emergency Information</h2>

      <input
        type="text"
        placeholder="Blood Type"
        value={bloodType}
        onChange={(e) => setBloodType(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <textarea
        placeholder="Allergies"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
        rows={2}
      />
      <textarea
        placeholder="Current Medications"
        value={currentMedications}
        onChange={(e) => setCurrentMedications(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
        rows={2}
      />
      <textarea
        placeholder="Medical Conditions"
        value={medicalConditions}
        onChange={(e) => setMedicalConditions(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
        rows={2}
      />
      <label className="flex items-center gap-2 mb-2 text-sm">
        <input
          type="checkbox"
          checked={organDonor}
          onChange={(e) => setOrganDonor(e.target.checked)}
        />
        Organ Donor
      </label>
      <input
        type="text"
        placeholder="Primary Emergency Contact"
        value={primaryEmergencyContact}
        onChange={(e) => setPrimaryEmergencyContact(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Secondary Emergency Contact"
        value={secondaryEmergencyContact}
        onChange={(e) => setSecondaryEmergencyContact(e.target.value)}
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