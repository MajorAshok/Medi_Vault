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

type Reading = {
    reading_type: string
    value: number
    unit: string
    reading_date: string | null
    confidence?: 'high' | 'medium' | 'low'
    source_text?: string
}

type Answer = {
    answer: string
    reasoning?: string
    source_text?: string
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [questions, setQuestions] = useState<Record<string, string>>({})

    const [askingId, setAskingId] = useState<string | null>(null)
    const [answers, setAnswers] = useState<Record<string, Answer>>({})
    const [extractingId, setExtractingId] = useState<string | null>(null)
    const [draftReadings, setDraftReadings] = useState<Record<string, Reading[]>>({})
    const [savingId, setSavingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [explanations, setExplanations] = useState<Record<string, string>>({})
    const [explainingId, setExplainingId] = useState<string | null>(null)

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
            setAnswers((prev) => ({ ...prev, [reportId]: data }))
        } else {
            alert(`Error: ${data.error}`)
        }
        setAskingId(null)
    }

    async function handleExplain(reportId: string) {
        const question = questions[reportId]
        const answerObj = answers[reportId]
        if (!question || !answerObj) return

        setExplainingId(reportId)

        const res = await fetch('/api/explain-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, question, answer: answerObj.answer }),
        })

        const data = await res.json()

        if (res.ok) {
            setExplanations((prev) => ({ ...prev, [reportId]: data.explanation }))
        } else {
            alert(`Error: ${data.error}`)
        }

        setExplainingId(null)
    }

    async function handleExtract(reportId: string) {
        setExtractingId(reportId)
        const res = await fetch('/api/extract-readings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId }),
        })
        const data = await res.json()
        if (res.ok) {
            const withDates = (data.readings || []).map((r: Reading) => ({
                ...r,
                reading_date: r.reading_date || new Date().toISOString().split('T')[0],
            }))
            setDraftReadings((prev) => ({ ...prev, [reportId]: withDates }))
        } else {
            alert(`Error: ${data.error}`)
        }
        setExtractingId(null)
    }

    function updateDraftReading(reportId: string, index: number, field: keyof Reading, value: string) {
        setDraftReadings((prev) => {
            const updated = [...(prev[reportId] || [])]
            updated[index] = { ...updated[index], [field]: field === 'value' ? Number(value) : value }
            return { ...prev, [reportId]: updated }
        })
    }

    function removeDraftReading(reportId: string, index: number) {
        setDraftReadings((prev) => {
            const updated = [...(prev[reportId] || [])]
            updated.splice(index, 1)
            return { ...prev, [reportId]: updated }
        })
    }

    async function handleSaveReadings(reportId: string) {
        const readings = draftReadings[reportId]
        if (!readings || readings.length === 0) return

        setSavingId(reportId)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('You must be logged in.')
            setSavingId(null)
            return
        }

        const rows = readings.map((r) => ({
            user_id: user.id,
            reading_type: r.reading_type,
            value: r.value,
            unit: r.unit,
            reading_date: r.reading_date,
        }))

        const { error } = await supabase.from('health_readings').insert(rows)

        if (error) {
            alert(`Error saving: ${error.message}`)
        } else {
            alert('✅ Readings saved to your health data!')
            setDraftReadings((prev) => {
                const updated = { ...prev }
                delete updated[reportId]
                return updated
            })
        }

        setSavingId(null)
    }

    if (loading) return <p className="p-10">Loading...</p>

    const filteredReports = reports.filter((report) => {
        const query = searchQuery.toLowerCase()
        return (
            report.file_name.toLowerCase().includes(query) ||
            (report.ai_summary || '').toLowerCase().includes(query)
        )
    })

    return (
        <main className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Reports</h1>
            <input
                type="text"
                placeholder="Search reports by name or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 w-full mb-4 rounded"
            />

            {filteredReports.length === 0 && <p>No matching reports found.</p>}

            <div className="flex flex-col gap-4">
                {filteredReports.map((report) => (
                    <div key={report.id} className="border rounded p-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <p className="font-semibold">{report.file_name}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(report.uploaded_at).toLocaleString()} — {report.status}
                                </p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
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
                                <button
                                    onClick={() => handleExtract(report.id)}
                                    disabled={extractingId === report.id}
                                    className="bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                    {extractingId === report.id ? 'Extracting...' : 'Extract Health Readings'}
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
                            <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                                <p className="whitespace-pre-wrap">{answers[report.id].answer}</p>
                                {answers[report.id].reasoning && (
                                    <p className="mt-2 text-xs text-gray-600 italic">
                                        {answers[report.id].reasoning}
                                    </p>
                                )}
                                {answers[report.id].source_text && (
                                    <p className="mt-1 text-xs text-gray-500 italic">
                                        {answers[report.id].source_text}
                                    </p>
                                )}
                                <button
                                    onClick={() => handleExplain(report.id)}
                                    disabled={explainingId === report.id}
                                    className="mt-2 text-xs text-blue-700 underline disabled:opacity-50"
                                >
                                    {explainingId === report.id ? 'Explaining...' : 'Explain this answer'}
                                </button>
                                {explanations[report.id] && (
                                    <p className="mt-2 text-xs text-gray-700 border-t pt-2 whitespace-pre-wrap">
                                        {explanations[report.id]}
                                    </p>
                                )}
                            </div>
                        )}

                        {draftReadings[report.id] && (
                            <div className="mt-4 border-t pt-3">
                                <p className="font-semibold text-sm mb-2">
                                    Review extracted readings before saving:
                                </p>

                                {draftReadings[report.id].length === 0 && (
                                    <p className="text-sm text-gray-500">No readings found in this report.</p>
                                )}

                                <div className="flex flex-col gap-2">
                                    {draftReadings[report.id].map((reading, index) => (
                                        <div key={index} className="flex flex-col gap-1 border-b pb-2 mb-1">
                                            <div className="flex gap-2 items-center text-sm flex-wrap">
                                                <input
                                                    type="text"
                                                    value={reading.reading_type}
                                                    onChange={(e) => updateDraftReading(report.id, index, 'reading_type', e.target.value)}
                                                    className="border p-1 rounded w-40"
                                                    placeholder="type"
                                                />
                                                <input
                                                    type="number"
                                                    value={reading.value}
                                                    onChange={(e) => updateDraftReading(report.id, index, 'value', e.target.value)}
                                                    className="border p-1 rounded w-24"
                                                    placeholder="value"
                                                />
                                                <input
                                                    type="text"
                                                    value={reading.unit}
                                                    onChange={(e) => updateDraftReading(report.id, index, 'unit', e.target.value)}
                                                    className="border p-1 rounded w-20"
                                                    placeholder="unit"
                                                />
                                                <input
                                                    type="date"
                                                    value={reading.reading_date || ''}
                                                    onChange={(e) => updateDraftReading(report.id, index, 'reading_date', e.target.value)}
                                                    className="border p-1 rounded"
                                                />
                                                {reading.confidence && (
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full font-medium ${reading.confidence === 'high'
                                                            ? 'bg-green-100 text-green-800'
                                                            : reading.confidence === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        {reading.confidence} confidence
                                                    </span>
                                                )}
                                                <button onClick={() => removeDraftReading(report.id, index)} className="text-red-600 text-xs">
                                                    Remove
                                                </button>
                                            </div>
                                            {reading.source_text && (
                                                <p className="text-xs text-gray-500 italic pl-1">
                                                    Found in report: "{reading.source_text}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {draftReadings[report.id].length > 0 && (
                                    <button
                                        onClick={() => handleSaveReadings(report.id)}
                                        disabled={savingId === report.id}
                                        className="mt-3 bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                    >
                                        {savingId === report.id ? 'Saving...' : 'Save to My Health Data'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </main>
    )
}