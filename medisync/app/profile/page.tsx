'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/Supabase'
import { Button } from '@/components/ui/button'
import QRCode from 'react-qr-code'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [allergies, setAllergies] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [medicalConditions, setMedicalConditions] = useState('')
  const [organDonor, setOrganDonor] = useState(false)
  const [primaryEmergencyContact, setPrimaryEmergencyContact] = useState('')
  const [secondaryEmergencyContact, setSecondaryEmergencyContact] = useState('')
  const [avatarPath, setAvatarPath] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setUserId(user.id)

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
      setGender(data.gender || '')
      setAddress(data.address || '')
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
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth || null,
        gender: gender,
        address: address,
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
      setMessage('Profile saved.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading...
      </main>
    )
  }

  const age = calculateAge(dateOfBirth)
  const avatarUrl = getAvatarUrl(avatarPath)

  const inputClass =
    "w-full rounded-lg border border-border bg-input/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
  const labelClass = "text-xs font-medium text-muted-foreground mb-1 block"

  return (
    <main className="relative min-h-screen overflow-hidden">
      <style>{`
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .avatar-ring {
          background: conic-gradient(
            from 0deg,
            #10b981, #06b6d4, #8b5cf6, #ec4899, #f59e0b, #10b981
          );
          animation: ring-spin 4s linear infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-0 h-[30rem] w-[30rem] rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="absolute top-0 right-0 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[22rem] w-[22rem] rounded-full bg-chart-2/15 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8 lg:px-10">
        <h1 className="font-heading text-2xl font-semibold text-foreground mb-6 tracking-tight">
          My Profile
        </h1>

        <section className="relative rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl p-8 mb-6 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-fuchsia-500/10" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">

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
              className="relative shrink-0 group h-[9.5rem] w-[9.5rem] sm:h-[10.5rem] sm:w-[10.5rem] rounded-full"
            >
              {/* rotating ring layer — behind everything, only this spins */}
              <div className="absolute inset-0 rounded-full avatar-ring" />

              {/* static photo layer — sits on top, does not rotate */}
              <div className="absolute inset-[3px] rounded-full bg-background p-1">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No photo
                  </div>
                )}
              </div>

              <div className="absolute inset-[3px] rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                {uploadingAvatar ? 'Uploading...' : 'Change'}
              </div>
            </button>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-heading text-xl font-semibold text-foreground">
                {fullName || 'Your Name'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
              <p className="text-xs text-muted-foreground mt-3">
                Tap your photo to change it
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-sm font-semibold text-foreground mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={inputClass}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Age</label>
                  <div className={`${inputClass} flex items-center text-muted-foreground`}>
                    {age !== null ? age : '—'}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Blood Type</label>
                  <input
                    type="text"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. O+"
                  />
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
            </section>

            {userId && (
              <section className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-xl shrink-0">
                  <QRCode value={`${window.location.origin}/sos/${userId}`} size={120} />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="font-heading text-sm font-semibold text-foreground mb-1">
                    Your Emergency QR Code
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Scan to view your emergency info — blood type and emergency contact only, visible without logging in.
                  </p>
                </div>
              </section>
            )}
          </div>

          <section className="relative rounded-2xl border border-white/10 bg-card/40 backdrop-blur-xl p-5 shadow-lg overflow-hidden self-start">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-fuchsia-500/10" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <h2 className="font-heading text-sm font-semibold text-foreground">
                  Emergency Information
                </h2>
              </div>

              <div>
                <label className={labelClass}>Allergies</label>
                <textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <label className={labelClass}>Current Medications</label>
                <textarea
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <label className={labelClass}>Medical Conditions</label>
                <textarea
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className={inputClass}
                  rows={2}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={organDonor}
                  onChange={(e) => setOrganDonor(e.target.checked)}
                  className="rounded border-border"
                />
                Organ Donor
              </label>

              <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
                <div>
                  <label className={labelClass}>Primary Emergency Contact</label>
                  <input
                    type="text"
                    value={primaryEmergencyContact}
                    onChange={(e) => setPrimaryEmergencyContact(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Secondary Emergency Contact</label>
                  <input
                    type="text"
                    value={secondaryEmergencyContact}
                    onChange={(e) => setSecondaryEmergencyContact(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {message || 'Changes are saved only when you click Save.'}
          </p>
          <Button onClick={handleSave}>Save Profile</Button>
        </div>
      </div>
    </main>
  )
}