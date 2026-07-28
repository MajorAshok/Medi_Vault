'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/Supabase'
import { Button } from '@/components/ui/button'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [allergies, setAllergies] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [medicalConditions, setMedicalConditions] = useState('')
  const [organDonor, setOrganDonor] = useState('No')
  const [primaryEmergencyContact, setPrimaryEmergencyContact] = useState('')
  const [secondaryEmergencyContact, setSecondaryEmergencyContact] = useState('')
  
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [secondaryContactName, setSecondaryContactName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const calculateAge = (dobString: string) => {
    if (!dobString) return ''
    const dob = new Date(dobString)
    const diff = Date.now() - dob.getTime()
    const ageDate = new Date(diff)
    const calculated = Math.abs(ageDate.getUTCFullYear() - 1970)
    return isNaN(calculated) ? '' : `${calculated} years`
  }

  const ageText = calculateAge(dateOfBirth)

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

    if (!error && data) {
      setFullName(data.full_name || '')
      setPhoneNumber(data.phone_number || '')
      setDateOfBirth(data.date_of_birth || '')
      setGender(data.gender || '')
      setAddress(data.address || '')
      setBloodType(data.blood_type || '')
      setAvatarPath(data.avatar_path || '')
      setAllergies(data.allergies || '')
      setCurrentMedications(data.current_medications || '')
      setMedicalConditions(data.medical_conditions || '')
      if (typeof data.organ_donor === 'boolean') {
        setOrganDonor(data.organ_donor ? 'Yes' : 'No')
      } else {
        setOrganDonor(data.organ_donor || 'No')
      }
      setPrimaryEmergencyContact(data.primary_emergency_contact || '')
      setSecondaryEmergencyContact(data.secondary_emergency_contact || '')
     
      setPrimaryContactName(data.primary_contact_name || '')
      setSecondaryContactName(data.secondary_contact_name || '')
    }

    setLoading(false)
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setUploadingAvatar(false)
      return
    }

    const filePath = `${user.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      setMessage(`Error uploading photo: ${uploadError.message}`)
      setUploadingAvatar(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_path: filePath })
      .eq('id', user.id)

    if (updateError) {
      setMessage(`Photo uploaded but failed to save: ${updateError.message}`)
    } else {
      setMessage('Profile photo updated.')
    }

    setAvatarPath(filePath)
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
      .upsert({
        id: user.id,
        full_name: fullName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth || null,
        gender: gender,
        address: address,
        blood_type: bloodType,
        avatar_path: avatarPath,
        allergies: allergies,
        current_medications: currentMedications,
        medical_conditions: medicalConditions,
        organ_donor: organDonor,
        primary_emergency_contact: primaryEmergencyContact,
        secondary_emergency_contact: secondaryEmergencyContact,
        // [TWILIO - ADDED] save the two new name columns
        primary_contact_name: primaryContactName,
        secondary_contact_name: secondaryContactName,
      })

    if (error) {
      setMessage(`Error saving: ${error.message}`)
    } else {
      setMessage('Profile saved successfully.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400 text-sm">
        Loading...
      </main>
    )
  }

  const avatarUrl = getAvatarUrl(avatarPath)

  const inputClass =
    "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100"
  const labelClass = "text-xs font-semibold text-neutral-500 mb-1.5 block tracking-wide uppercase"

  return (
    <main className="relative min-h-screen flex-1 overflow-y-auto p-6 lg:p-10 bg-gradient-to-br from-[#c084fc] via-[#f472b6] to-[#fb7185]">

      {/* Heavy blurred ambient background glowing circles */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[45rem] w-[45rem] rounded-full bg-orange-300/60 blur-[160px]" />
        <div className="absolute top-1/3 right-0 h-[42rem] w-[42rem] rounded-full bg-pink-400/50 blur-[160px]" />
        <div className="absolute -bottom-20 left-1/3 h-[45rem] w-[45rem] rounded-full bg-purple-500/60 blur-[180px]" />
      </div>

      <div className="relative max-w-5xl mx-auto w-full">
        <div className="rounded-3xl bg-white/95 backdrop-blur-3xl shadow-2xl overflow-hidden border border-white/50">

          {/* Banner strip — MediSync brand mark */}
          <div className="h-42 bg-gradient-to-r from-orange-300 via-pink-300 to-violet-400 relative p-4 lg:px-8 flex flex-col items-center justify-start pt-6 text-center">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px]" />
            <div className="absolute top-10 right-6 z-10">
              <Button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 rounded-xl px-6 font-semibold"
              >
                Save profile
              </Button>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center gap-0">
              <div className="flex items-center justify-center gap-4 overflow-visible">
                <img
                  src="/medisync-logo.png"
                  alt="MediSync"
                  className="h-28 w-24 object-contain shrink-0"
                />
                <span
                  className="text-5xl tracking-wide font-extrabold bg-gradient-to-r from-neutral-950 via-teal-500 to-rose-500"
                  style={{
                    fontFamily: 'var(--font-brand)',
                    lineHeight: 1.2,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  MediSync
                </span>
              </div>
              <p className="text-xs lg:text-sm text-neutral-800 font-bold tracking-wide -mt-2 uppercase max-w-md mx-auto ml-9">
                Your intelligent health & emergency companion
              </p>
            </div>
          </div>

          {/* Header row with Profile Photo Avatar */}
          <div className="px-8 pt-0 pb-6 -mt-17 flex items-end justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-end gap-5">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarUpload(file)
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="relative shrink-0 group h-36 w-36 rounded-full ring-4 ring-white shadow-2xl overflow-hidden bg-purple-100"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-purple-600 text-sm font-semibold">
                    Add photo
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                  {uploadingAvatar ? 'Uploading...' : 'Change photo'}
                </div>
              </button>

              <div className="pb-2 pt-3">
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  {fullName || 'Your Name'}
                </h1>
                <p className="text-sm text-neutral-500">{email}</p>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="px-8 pb-12 space-y-8">

            {/* Personal Details Section */}
            <div className="mt-4">
              <h2 className="text-sm font-bold text-purple-700 tracking-wider uppercase mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={inputClass}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className={labelClass}>Date of birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Age (Auto-calculated)</label>
                  <input
                    type="text"
                    readOnly
                    value={ageText}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-600 outline-none cursor-not-allowed font-medium"
                    placeholder="Auto-calculated"
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className={labelClass}>Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClass}
                    placeholder="Street, city, state"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="pt-3 border-t border-neutral-100">
              <h2 className="text-sm font-bold text-purple-700 tracking-wider uppercase mb-4">Medical Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className={labelClass}>Blood type</label>
                  <input
                    type="text"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. O+, A-"
                  />
                </div>
                <div>
                  <label className={labelClass}>Organ donor status</label>
                  <select
                    value={organDonor}
                    onChange={(e) => setOrganDonor(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Allergies</label>
                  <textarea
                    rows={2}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className={inputClass}
                    placeholder="List any drug, food, or environmental allergies..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Current medications</label>
                  <textarea
                    rows={2}
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    className={inputClass}
                    placeholder="List prescription medications, dosages, or supplements..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Medical conditions</label>
                  <textarea
                    rows={2}
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    className={inputClass}
                    placeholder="List chronic conditions, past surgeries, or medical notes..."
                  />
                </div>
              </div>
            </div>

            
            <div className="pt-6 border-t border-neutral-100">
              <h2 className="text-sm font-bold text-purple-700 tracking-wider uppercase mb-4">Emergency Contacts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className={labelClass}>Primary contact name</label>
                  
                  <input
                    type="text"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Mom, Ravi Sharma"
                  />
                </div>
                <div>
                  <label className={labelClass}>Primary emergency contact</label>
                  <input
                    type="text"
                    value={primaryEmergencyContact}
                    onChange={(e) => setPrimaryEmergencyContact(e.target.value)}
                    className={inputClass}
                    placeholder="phone number"
                  />
                </div>
                <div>
                  <label className={labelClass}>Secondary contact name</label>
                  
                  <input
                    type="text"
                    value={secondaryContactName}
                    onChange={(e) => setSecondaryContactName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Dad, Priya Patel"
                  />
                </div>
                <div>
                  <label className={labelClass}>Secondary emergency contact</label>
                  <input
                    type="text"
                    value={secondaryEmergencyContact}
                    onChange={(e) => setSecondaryEmergencyContact(e.target.value)}
                    className={inputClass}
                    placeholder="phone number"
                  />
                </div>
              </div>
            </div>

            {/* Read-Only Email Display */}
            <div className="pt-6 border-t border-neutral-100">
              <p className={labelClass}>My email address (Read-only)</p>
              <div className="flex items-center gap-3.5 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 font-bold">
                  ✉
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{email}</p>
                  <p className="text-xs text-neutral-400">Authenticated primary account</p>
                </div>
              </div>
            </div>

            {message && (
              <p className="text-xs font-medium text-purple-700 bg-purple-50 p-3 rounded-xl border border-purple-100">{message}</p>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}