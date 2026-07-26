'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/Supabase'

type Report = {
  id: string
  file_name: string
  uploaded_at: string
  ai_summary: string | null
}

type ReadingRow = {
  reading_type: string
  unit: string
  valueA: number | null
  dateA: string | null
  valueB: number | null
  dateB: string | null
}

export default function Compare() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [reportIdA, setReportIdA] = useState('')
  const [reportIdB, setReportIdB] = useState('')
  const [comparing, setComparing] = useState(false)
  const [comparison, setComparison] = useState('')
  const [readingRows, setReadingRows] = useState<ReadingRow[]>([])

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    const { data, error } = await supabase
      .from('reports')
      .select('id, file_name, uploaded_at, ai_summary')
      .order('uploaded_at', { ascending: false })

    if (!error && data) setReports(data)
    setLoading(false)
  }

  async function handleCompare() {
    if (!reportIdA || !reportIdB || reportIdA === reportIdB) {
      alert('Please select two different reports.')
      return
    }

    setComparing(true)
    setComparison('')
    setReadingRows([])

    const reportA = reports.find((r) => r.id === reportIdA)
    const reportB = reports.find((r) => r.id === reportIdB)

    // Fetch health readings near each report's upload date to build the side-by-side table
    const { data: readingsA } = await supabase
      .from('health_readings')
      .select('*')
      .gte('reading_date', reportA?.uploaded_at.split('T')[0])
      .lte('reading_date', reportA?.uploaded_at.split('T')[0])

    const { data: readingsB } = await supabase
      .from('health_readings')
      .select('*')
      .gte('reading_date', reportB?.uploaded_at.split('T')[0])
      .lte('reading_date', reportB?.uploaded_at.split('T')[0])

    const types = Array.from(
      new Set([...(readingsA || []), ...(readingsB || [])].map((r) => r.reading_type))
    )

    const rows: ReadingRow[] = types.map((type) => {
      const a = readingsA?.find((r) => r.reading_type === type)
      const b = readingsB?.find((r) => r.reading_type === type)
      return {
        reading_type: type,
        unit: a?.unit || b?.unit || '',
        valueA: a?.value ?? null,
        dateA: a?.reading_date ?? null,
        valueB: b?.value ?? null,
        dateB: b?.reading_date ?? null,
      }
    })
    setReadingRows(rows)

    const res = await fetch('/api/compare-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportIdA, reportIdB }),
    })

    const data = await res.json()

    if (res.ok) {
      setComparison(data.comparison)
    } else {
      alert(`Error: ${data.error}`)
    }

    setComparing(false)
  }

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Compare Reports</h1>

      {reports.length < 2 && <p>You need at least 2 uploaded reports to compare.</p>}

      {reports.length >= 2 && (
        <>
          <div className="flex gap-4 mb-4">
            <select
              value={reportIdA}
              onChange={(e) => setReportIdA(e.target.value)}
              className="border p-2 rounded flex-1"
            >
              <option value="">Select Report A</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name} — {new Date(r.uploaded_at).toLocaleDateString()}
                </option>
              ))}
            </select>

            <select
              value={reportIdB}
              onChange={(e) => setReportIdB(e.target.value)}
              className="border p-2 rounded flex-1"
            >
              <option value="">Select Report B</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.file_name} — {new Date(r.uploaded_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={comparing}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {comparing ? 'Comparing...' : 'Compare'}
          </button>

          {readingRows.length > 0 && (
            <table className="w-full mt-6 text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Reading</th>
                  <th className="text-left p-2">Report A</th>
                  <th className="text-left p-2">Report B</th>
                </tr>
              </thead>
              <tbody>
                {readingRows.map((row) => {
                  const diff =
                    row.valueA !== null && row.valueB !== null ? row.valueB - row.valueA : null
                  return (
                    <tr key={row.reading_type} className="border-b">
                      <td className="p-2 capitalize">{row.reading_type.replace(/_/g, ' ')}</td>
                      <td className="p-2">
                        {row.valueA !== null ? `${row.valueA} ${row.unit}` : '—'}
                      </td>
                      <td className="p-2">
                        {row.valueB !== null ? `${row.valueB} ${row.unit}` : '—'}
                        {diff !== null && diff !== 0 && (
                          <span className={diff > 0 ? 'text-red-600 ml-2' : 'text-green-600 ml-2'}>
                            ({diff > 0 ? '+' : ''}{diff})
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {comparison && (
            <div className="mt-6 p-4 bg-gray-50 rounded text-sm whitespace-pre-wrap">
              {comparison}
            </div>
          )}
        </>
      )}
    </main>
  )
}