'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/Supabase'

type Report = {
  id: string
  file_name: string
  uploaded_at: string
  status: string
  ai_summary: string | null
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [askingId, setAskingId] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (!error && data) setReports(data)
    setLoading(false)
  }

  async function handleSummarize(reportId: string, detail: 'short' | 'detailed') {
    setProcessingId(reportId)

    const res = await fetch('/api/process-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, detail }),
    })

    if (res.ok) {
      await loadReports()
    } else {
      const data = await res.json()
      alert(`Error: ${data.error}`)
    }

    setProcessingId(null)
  }

  async function handleAsk(reportId: string) {
    const question = questions[reportId]
    if (!question) return

    setAskingId(reportId)

    const res = await fetch('/api/ask-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, question }),
    })

    const data = await res.json()

    if (res.ok) {
      setAnswers((prev) => ({ ...prev, [reportId]: data.answer }))
    } else {
      alert(`Error: ${data.error}`)
    }

    setAskingId(null)
  }

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Reports</h1>

      {reports.length === 0 && <p>No reports uploaded yet.</p>}

      <div className="flex flex-col gap-4">
        {reports.map((report) => (
          <div key={report.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{report.file_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(report.uploaded_at).toLocaleString()} — {report.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSummarize(report.id, 'short')}
                  disabled={processingId === report.id}
                  className="bg-black text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  {processingId === report.id ? '...' : 'Quick Summary'}
                </button>
                <button
                  onClick={() => handleSummarize(report.id, 'detailed')}
                  disabled={processingId === report.id}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  {processingId === report.id ? '...' : 'Detailed'}
                </button>
              </div>
            </div>

            {report.ai_summary && (
              <div className="mt-3 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                {report.ai_summary}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Ask a question about this report..."
                value={questions[report.id] || ''}
                onChange={(e) =>
                  setQuestions((prev) => ({ ...prev, [report.id]: e.target.value }))
                }
                className="border p-2 flex-1 rounded text-sm"
              />
              <button
                onClick={() => handleAsk(report.id)}
                disabled={askingId === report.id}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {askingId === report.id ? '...' : 'Ask'}
              </button>
            </div>

            {answers[report.id] && (
              <div className="mt-2 p-3 bg-blue-50 rounded text-sm whitespace-pre-wrap">
                {answers[report.id]}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}