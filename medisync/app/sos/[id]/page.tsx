import { supabase } from '@/lib/Supabase'
import SosView from '@/components/SosView'

export default async function SosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data, error } = await supabase
    .from('sos_info')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B0A10] p-10 text-center font-mono">
        <div>
          <h1 className="text-xl font-bold text-[#FF5470]">
            No emergency info found
          </h1>
          <p className="mt-2 text-sm text-[#C9C4D6]">
            कोई आपातकालीन जानकारी नहीं मिली
          </p>
        </div>
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
    const monthDifference = today.getMonth() - birthDate.getMonth()

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }

    return age
  }

  const age = calculateAge(data.date_of_birth)

  return <SosView data={data} avatarUrl={avatarUrl} age={age} />
}