import { supabase } from '@/lib/Supabase'

export default async function Home() {
  const { data, error } = await supabase.auth.getSession()

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <p className="text-green-600">✅ Connected to Supabase successfully!</p>
      )}
    </main>
  )
}