'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/Supabase'
import { FileText, X, Edit2, Save, Sparkles, Search } from 'lucide-react'

type Report = {
  id: string
  file_name: string
  uploaded_at: string
  status: string
}

export default function Upload() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [editableName, setEditableName] = useState('')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [reports, setReports] = useState<Report[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  // Search query state for filtering timeline
  const [searchQuery, setSearchQuery] = useState('')

  // State for inline timeline renaming
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newNameVal, setNewNameVal] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('id, file_name, uploaded_at, status')
      .order('uploaded_at', { ascending: false })

    if (!error && data) setReports(data)
    setLoadingReports(false)
  }

  function handleFileChange(selected: File | null) {
    setFile(selected)
    if (selected) {
      const dot = selected.name.lastIndexOf('.')
      setEditableName(dot > 0 ? selected.name.slice(0, dot) : selected.name)
    }
  }

  async function handleUpload() {
    if (!file) {
      setMessage('Please choose a file first.')
      return
    }

    setUploading(true)
    setMessage('')
    setProgress(0)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in to upload.')
      setUploading(false)
      return
    }

    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
    const finalName = `${editableName.trim() || file.name}${editableName.includes('.') ? '' : ext}`
    const filePath = `${user.id}/${Date.now()}_${finalName}`

    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.random() * 15 : p))
    }, 200)

    const { error: uploadError } = await supabase.storage
      .from('report')
      .upload(filePath, file)

    clearInterval(progressTimer)

    if (uploadError) {
      setProgress(0)
      setMessage(`Error: ${uploadError.message}`)
      setUploading(false)
      return
    }

    setProgress(100)

    const { error: dbError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_name: finalName,
        status: 'Completed'
      })

    if (dbError) {
      setMessage(`File uploaded, but failed to save record: ${dbError.message}`)
    } else {
      setMessage('✅ File uploaded and recorded successfully!')
      setFile(null)
      setEditableName('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadReports()
    }

    setTimeout(() => setProgress(0), 800)
    setUploading(false)
  }

  async function handleSaveRename(id: string) {
    if (!newNameVal.trim()) return
    const { error } = await supabase
      .from('reports')
      .update({ file_name: newNameVal.trim() })
      .eq('id', id)

    if (!error) {
      setReports(reports.map(r => r.id === id ? { ...r, file_name: newNameVal.trim() } : r))
      setEditingId(null)
      setNewNameVal('')
    }
  }

  // Navigate to the Summarization page (sidebar) scoped to just this one report.
  function handleSummarizeClick(reportId: string) {
    router.push(`/reports?reportId=${reportId}`)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
      year: d.getFullYear(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStringFormatted: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`.toLowerCase()
    }
  }

  // Filter reports based on search query matching name, month, day, or year
  const filteredReports = reports.filter((report) => {
    const d = formatDate(report.uploaded_at)
    const query = searchQuery.toLowerCase()
    const matchesName = report.file_name.toLowerCase().includes(query)
    const matchesDate = d.dateStringFormatted.includes(query) || d.year.toString().includes(query) || d.month.toLowerCase().includes(query)
    return matchesName || matchesDate
  })

  return (
    <main className="relative min-h-screen overflow-hidden pb-20">
      <style>{`
        @keyframes flowDash {
          to { stroke-dashoffset: -40; }
        }
        .animate-flow {
          stroke-dasharray: 8 12;
          animation: flowDash 3s linear infinite;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* Colorful gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br from-fuchsia-500/20 via-orange-400/10 to-cyan-500/20" />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-0 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-[100px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-orange-400/20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-heading text-2xl font-semibold text-foreground mb-6 tracking-tight">
          Upload Report
        </h1>

        {/* Glassmorphism upload card */}
        <section className="relative rounded-3xl border border-white/20 bg-card/40 backdrop-blur-xl shadow-lg p-6 mb-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-cyan-500/10" />

          <div className="relative flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/20 bg-input/30 px-4 py-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:text-secondary-foreground"
            />

            {file && (
              <div className="rounded-xl border border-white/20 bg-background/40 p-4">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  File name (editable before upload)
                </label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="flex-1 rounded-lg border border-white/20 bg-input/30 px-3 py-2 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    onClick={() => {
                      setFile(null)
                      setEditableName('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {uploading && (
              <div className="w-full">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-primary to-cyan-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-right">{Math.round(progress)}%</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="rounded-xl bg-gradient-to-r from-fuchsia-600 via-primary to-cyan-600 text-white px-4 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>

            {message && (
              <p className="text-xs text-muted-foreground">{message}</p>
            )}
          </div>
        </section>

        {/* Section Header & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Upload History Timeline
          </h2>

          {/* Search Document Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-card/60 backdrop-blur-md pl-10 pr-4 py-2 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {loadingReports ? (
          <p className="text-sm text-muted-foreground">Loading timeline...</p>
        ) : filteredReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching reports found.</p>
        ) : (
          <div className="relative w-full py-6">
            {/* Background Winding SVG Path */}
            <div className="absolute inset-0 pointer-events-none flex justify-center">
              <svg
                className="w-full h-full min-h-[600px]"
                viewBox="0 0 400 800"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 200 20 C 350 150, 50 300, 200 450 C 350 600, 50 750, 200 850"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 200 20 C 350 150, 50 300, 200 450 C 350 600, 50 750, 200 850"
                  className="animate-flow"
                  stroke="url(#gradient-flow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient-flow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Timeline Nodes Staggered Left and Right */}
            <div className="relative flex flex-col gap-24">
              {filteredReports.map((report, i) => {
                const d = formatDate(report.uploaded_at)
                const isEven = i % 2 === 0
                const isEditing = editingId === report.id

                return (
                  <div
                    key={report.id}
                    className={`flex items-center w-full ${isEven ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className="w-[85%] sm:w-[75%] animate-float">
                      <div className="relative rounded-2xl border border-white/15 bg-card/70 backdrop-blur-md p-5 shadow-xl hover:border-primary/50 transition group">

                        {/* Milestone indicator glow dot */}
                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-background shadow-lg ${
                          i === 0 && !searchQuery ? 'bg-emerald-400 animate-ping' : ''
                        } ${isEven ? '-right-[42px] sm:-right-[54px]' : '-left-[42px] sm:-left-[54px]'}`} />

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              {isEditing ? (
                                <div className="flex items-center gap-2 my-1">
                                  <input
                                    type="text"
                                    value={newNameVal}
                                    onChange={(e) => setNewNameVal(e.target.value)}
                                    className="w-full rounded-lg border border-primary/50 bg-input/50 px-2.5 py-1 text-sm text-foreground outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveRename(report.id)}
                                    className="p-1.5 rounded-lg bg-primary text-white hover:opacity-90"
                                  >
                                    <Save className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 rounded-lg bg-secondary text-secondary-foreground"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 group/edit">
                                  <p className="text-sm font-semibold text-foreground">{report.file_name}</p>
                                  <button
                                    onClick={() => {
                                      setEditingId(report.id)
                                      setNewNameVal(report.file_name)
                                    }}
                                    className="opacity-0 group-hover/edit:opacity-100 transition p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-primary"
                                    title="Edit Report Name"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground mt-1">
                                {d.time} • <span className="text-emerald-400 font-medium">{report.status}</span>
                              </p>
                            </div>

                            {/* Date Badge */}
                            <div className="rounded-xl border border-white/10 bg-background/50 px-3 py-1.5 text-center shrink-0">
                              <p className="text-xs font-bold text-muted-foreground uppercase">{d.month}</p>
                              <p className="text-lg font-extrabold text-foreground leading-none">{d.day}</p>
                              <p className="text-[10px] text-muted-foreground">{d.year}</p>
                            </div>
                          </div>

                          {/* Action Button: Summarize -> goes to Summarization page, scoped to this report */}
                          <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                            <button
                              onClick={() => handleSummarizeClick(report.id)}
                              className="flex items-center gap-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 text-xs font-semibold transition border border-primary/30"
                            >
                              <Sparkles className="h-3.5 w-3.5" /> Summarize Report
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}