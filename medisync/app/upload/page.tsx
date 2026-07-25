'use client'

import { useState } from 'react'
import { supabase } from '../../lib/Supabase'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleUpload() {
    if (!file) {
      setMessage('Please choose a file first.')
      return
    }

    setUploading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in to upload.')
      setUploading(false)
      return
    }

    const filePath = `${user.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('report')
      .upload(filePath, file)

    if (uploadError) {
      setMessage(`Error: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_name: file.name,
      })

    if (dbError) {
      setMessage(`File uploaded, but failed to save record: ${dbError.message}`)
    } else {
      setMessage('✅ File uploaded and recorded successfully!')
      setFile(null)
    }

    setUploading(false)
  }

  return (
    <main className="p-10 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Report</h1>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}