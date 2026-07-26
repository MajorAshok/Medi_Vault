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

  return (
    <main className="p-10 max-w-sm mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">🚨 Emergency Info</h1>
      <div className="border rounded p-6 text-left">
        <p className="mb-2"><strong>Blood Type:</strong> {data.blood_type || 'Not provided'}</p>
        <p><strong>Emergency Contact:</strong> {data.emergency_contact || 'Not provided'}</p>
      </div>
    </main>
  )
}