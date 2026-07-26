import { supabase } from '@/lib/Supabase'

export default async function SosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabase
    .from('sos_info')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <main className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">No emergency info found</h1>
      </main>
    )
  }

  const avatarUrl = data.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(data.avatar_path).data.publicUrl
    : null

  function calculateAge(dob: string | null) {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  const age = calculateAge(data.date_of_birth)

  return (
    <main className="p-10 max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">🚨 Emergency Info</h1>

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={data.full_name || 'Profile photo'}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      )}

      <div className="border rounded p-6 text-left flex flex-col gap-2">
        <p><strong>Name:</strong> {data.full_name || 'Not provided'}</p>
        {age !== null && <p><strong>Age:</strong> {age}</p>}
        <p><strong>Blood Type:</strong> {data.blood_type || 'Not provided'}</p>
        <p><strong>Allergies:</strong> {data.allergies || 'None listed'}</p>
        <p><strong>Current Medications:</strong> {data.current_medications || 'None listed'}</p>
        <p><strong>Medical Conditions:</strong> {data.medical_conditions || 'None listed'}</p>
        <p><strong>Organ Donor:</strong> {data.organ_donor ? 'Yes' : 'No'}</p>
        <p><strong>Primary Emergency Contact:</strong> {data.primary_emergency_contact || 'Not provided'}</p>
        <p><strong>Secondary Emergency Contact:</strong> {data.secondary_emergency_contact || 'Not provided'}</p>
      </div>
    </main>
  )
}