'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/Supabase'
import ReactMarkdown from 'react-markdown'
import {
    FileText,
    Zap,
    ScrollText,
    Activity,
    UserPlus,
    Send,
    ArrowLeft,
    UploadCloud,
    X,
} from 'lucide-react'

// Terminal Markdown renderer styled to match the report overview box
function Md({ text }: { text: string }) {
    return (
        <div className="font-mono text-[13px] leading-relaxed text-foreground/90">
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    h1: ({ children }) => <h1 className="mt-3 mb-1 text-sm font-bold text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="mt-3 mb-1 text-xs font-bold text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="mt-3 mb-1 text-xs font-bold text-foreground">{children}</h3>,
                    ul: ({ children }) => <ul className="mt-2 list-disc space-y-1 pl-4">{children}</ul>,
                    ol: ({ children }) => <ol className="mt-2 list-decimal space-y-1 pl-4">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                    hr: () => <hr className="my-2 border-white/10" />,
                    code: ({ children }) => (
                        <code className="rounded bg-white/10 px-1 py-0.5 text-[11px] text-cyan-300 font-mono">{children}</code>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    )
}

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

type ProfileSuggestion = {
    value: string
    confidence: 'high' | 'medium' | 'low'
    source_text: string
}

type ProfileSuggestions = {
    blood_type?: ProfileSuggestion
    allergies?: ProfileSuggestion
    current_medications?: ProfileSuggestion
    medical_conditions?: ProfileSuggestion
}

const IMG_CANDIDATES = ['/sum.jpg', '/sum.png', '/sum.jpeg', '/sum.webp']

function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function friendlyError(status: number | undefined, raw?: string) {
    if (status === 429) {
        return "The AI assistant has hit its request limit for now. Please wait a bit and try again."
    }
    if (status && status >= 500) {
        return "Something went wrong on our end. Please try again in a moment."
    }
    return raw || 'Something went wrong. Please try again.'
}

function ActionCard({
    gradient,
    icon,
    label,
    onClick,
    disabled,
}: {
    gradient: string
    icon: React.ReactNode
    label: string
    onClick: () => void
    disabled?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br ${gradient} p-3.5 transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100`}
        >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition group-hover:bg-white/30">
                {icon}
            </span>
            <span className="rounded-full bg-white/95 px-4 py-1.5 text-center text-xs font-semibold text-gray-900 shadow-sm font-mono">
                {label}
            </span>
        </button>
    )
}

export default function Reports() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const reportId = searchParams.get('reportId')
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [question, setQuestion] = useState('')
    const [askedQuestion, setAskedQuestion] = useState('')
    const [askingId, setAskingId] = useState<string | null>(null)
    const [answers, setAnswers] = useState<Record<string, Answer>>({})
    const [extractingId, setExtractingId] = useState<string | null>(null)
    const [draftReadings, setDraftReadings] = useState<Record<string, Reading[]>>({})
    const [showVerificationModal, setShowVerificationModal] = useState(false)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [explanations, setExplanations] = useState<Record<string, string>>({})
    const [explainingId, setExplainingId] = useState<string | null>(null)
    const [profileSuggestions, setProfileSuggestions] = useState<Record<string, ProfileSuggestions>>({})
    const [suggestingId, setSuggestingId] = useState<string | null>(null)
    const [savingProfileId, setSavingProfileId] = useState<string | null>(null)
    const [imgIndex, setImgIndex] = useState(0)
    const imgSrc = IMG_CANDIDATES[imgIndex]

    function handleImgError() {
        setImgIndex((i) => Math.min(i + 1, IMG_CANDIDATES.length - 1))
    }

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

    const report = reportId ? reports.find((r) => r.id === reportId) || null : null

    async function handleSummarize(id: string, detail: 'short' | 'detailed') {
        setProcessingId(`${id}-${detail}`)
        const res = await fetch('/api/process-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: id, detail }),
        })
        if (res.ok) {
            await loadReports()
        } else {
            const data = await res.json().catch(() => ({}))
            alert(friendlyError(res.status, data.error))
        }
        setProcessingId(null)
    }

    async function handleAsk(id: string) {
        if (!question.trim()) return
        setAskingId(id)
        setAskedQuestion(question)
        const res = await fetch('/api/ask-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: id, question }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
            setAnswers((prev) => ({ ...prev, [id]: data }))
        } else {
            alert(friendlyError(res.status, data.error))
        }
        setAskingId(null)
    }

    async function handleExplain(id: string) {
        const answerObj = answers[id]
        if (!askedQuestion || !answerObj) return
        setExplainingId(id)
        const res = await fetch('/api/explain-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: id, question: askedQuestion, answer: answerObj.answer }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
            setExplanations((prev) => ({ ...prev, [id]: data.explanation }))
        } else {
            alert(friendlyError(res.status, data.error))
        }
        setExplainingId(null)
    }

    async function handleExtract(id: string) {
        setExtractingId(id)
        const res = await fetch('/api/extract-readings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: id }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
            const withDates = (data.readings || []).map((r: Reading) => ({
                ...r,
                reading_date: r.reading_date || new Date().toISOString().split('T')[0],
            }))
            setDraftReadings((prev) => ({ ...prev, [id]: withDates }))
            setShowVerificationModal(true)
        } else {
            alert(friendlyError(res.status, data.error))
        }
        setExtractingId(null)
    }

    function updateDraftReading(id: string, index: number, field: keyof Reading, value: string) {
        setDraftReadings((prev) => {
            const updated = [...(prev[id] || [])]
            updated[index] = { ...updated[index], [field]: field === 'value' ? Number(value) : value }
            return { ...prev, [id]: updated }
        })
    }

    async function handleSuggestProfileInfo(id: string) {
        setSuggestingId(id)
        const res = await fetch('/api/extract-profile-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId: id }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
            setProfileSuggestions((prev) => ({ ...prev, [id]: data }))
        } else {
            alert(friendlyError(res.status, data.error))
        }
        setSuggestingId(null)
    }

    function updateSuggestion(id: string, field: keyof ProfileSuggestions, value: string) {
        setProfileSuggestions((prev) => ({
            ...prev,
            [id]: { ...prev[id], [field]: { ...prev[id]?.[field], value } },
        }))
    }

    async function handleSaveProfileSuggestions(id: string) {
        const suggestions = profileSuggestions[id]
        if (!suggestions) return
        setSavingProfileId(id)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('You must be logged in.')
            setSavingProfileId(null)
            return
        }
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
        const updates: Record<string, string> = {}
        if (suggestions.blood_type?.value) updates.blood_type = suggestions.blood_type.value
        if (suggestions.allergies?.value) {
            updates.allergies = currentProfile?.allergies
                ? `${currentProfile.allergies}, ${suggestions.allergies.value}`
                : suggestions.allergies.value
        }
        if (suggestions.current_medications?.value) {
            updates.current_medications = currentProfile?.current_medications
                ? `${currentProfile.current_medications}, ${suggestions.current_medications.value}`
                : suggestions.current_medications.value
        }
        if (suggestions.medical_conditions?.value) {
            updates.medical_conditions = currentProfile?.medical_conditions
                ? `${currentProfile.medical_conditions}, ${suggestions.medical_conditions.value}`
                : suggestions.medical_conditions.value
        }
        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
        if (error) {
            alert(`Error saving: ${error.message}`)
        } else {
            alert('✅ Profile updated!')
            setProfileSuggestions((prev) => {
                const updated = { ...prev }
                delete updated[id]
                return updated
            })
        }
        setSavingProfileId(null)
    }

    if (loading) {
        return (
            <main className="flex h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground font-mono">Loading...</p>
            </main>
        )
    }

    return (
        <main className="flex h-screen flex-col overflow-hidden px-6 py-6 md:px-10 md:py-8">
            <style>{`
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.45; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.02); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-glow-pulse { animation: glowPulse 2.8s ease-in-out infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.35s ease; }
            `}</style>
            <div className="mb-5 flex shrink-0 items-center justify-between">
                <h1 className="font-heading text-2xl font-semibold text-foreground tracking-tight">
                    Summarization
                </h1>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-card/50 px-4 py-2 text-sm text-foreground backdrop-blur-md transition hover:bg-card/70 font-mono"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
            </div>
            {!report ? (
                <div className="flex min-h-0 flex-1 flex-col items-center gap-10 rounded-3xl border border-white/15 bg-card/40 backdrop-blur-xl p-8 md:flex-row md:p-10">
                    <div className="flex flex-1 flex-col gap-4">
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-background/50 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                            No report loaded
                        </span>
                        <h2 className="font-heading text-2xl font-semibold text-foreground">
                            Upload a report to get started
                        </h2>
                        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                            Once you upload a medical report, come back here to generate summaries,
                            ask questions about it, and pull out health readings automatically.
                        </p>
                        <Link
                            href="/upload"
                            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-primary to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 font-mono"
                        >
                            <UploadCloud className="h-4 w-4" /> Upload Report
                        </Link>
                    </div>
                    <div className="relative h-[280px] w-full flex-1 overflow-hidden rounded-2xl border border-white/15 md:h-full">
                        <img src={imgSrc} onError={handleImgError} alt="" className="h-full w-full object-cover" />
                    </div>
                </div>
            ) : (
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
                    <div className="flex min-h-0 flex-col gap-5">
                        {/* Report Overview Box matching exact terminal style */}
                        <div className="flex min-h-0 flex-[1.15] flex-col overflow-hidden rounded-2xl border border-white/15 bg-card/60 backdrop-blur-xl">
                            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block"></span>
                                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/80 inline-block"></span>
                                    <span className="ml-2 text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                        OUTPUT
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {report.file_name}
                                    </span>
                                    <FileText className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                                <p className="text-xs text-muted-foreground mb-3 font-mono">
                                    Uploaded on {formatDate(report.uploaded_at)} · Status: {report.status.toLowerCase()}
                                </p>
                                {report.ai_summary ? (
                                    <div className="animate-fade-in-up">
                                        <Md text={report.ai_summary} />
                                    </div>
                                ) : (
                                    <p className="italic text-sm text-muted-foreground font-mono">
                                        No summary generated yet. Click Quick Summary or Detailed below to begin.
                                    </p>
                                )}
                                {profileSuggestions[report.id] && (
                                    <div className="mt-6 border-t border-white/10 pt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 font-mono">
                                            Suggested Profile Updates
                                        </p>
                                        <div className="animate-fade-in-up flex flex-col gap-3">
                                            {(['blood_type', 'allergies', 'current_medications', 'medical_conditions'] as const).map(
                                                (field) => {
                                                    const suggestion = profileSuggestions[report.id][field]
                                                    if (!suggestion || !suggestion.value) return null
                                                    return (
                                                        <div key={field} className="text-sm">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <label className="w-40 capitalize text-muted-foreground font-mono">
                                                                    {field.replace(/_/g, ' ')}:
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={suggestion.value}
                                                                    onChange={(e) => updateSuggestion(report.id, field, e.target.value)}
                                                                    className="min-w-[150px] flex-1 rounded-lg border border-white/15 bg-input/30 p-1.5 text-foreground text-sm font-mono"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )}
                                            <button
                                                onClick={() => handleSaveProfileSuggestions(report.id)}
                                                disabled={savingProfileId === report.id}
                                                className="mt-2 w-fit rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition hover:opacity-90 font-mono"
                                            >
                                                {savingProfileId === report.id ? 'Saving...' : 'Add to My Profile'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-6">
                            <ActionCard
                                gradient="from-blue-600 to-sky-400"
                                icon={<Zap className="h-5 w-5" />}
                                label={processingId === `${report.id}-short` ? 'Working...' : 'Quick Summary'}
                                onClick={() => handleSummarize(report.id, 'short')}
                                disabled={!!processingId}
                            />
                            <ActionCard
                                gradient="from-violet-600 to-fuchsia-500"
                                icon={<ScrollText className="h-5 w-5" />}
                                label={processingId === `${report.id}-detailed` ? 'Working...' : 'Detailed'}
                                onClick={() => handleSummarize(report.id, 'detailed')}
                                disabled={!!processingId}
                            />
                            <ActionCard
                                gradient="from-emerald-600 to-teal-400"
                                icon={<Activity className="h-5 w-5" />}
                                label={extractingId === report.id ? 'Working...' : 'Extract Readings'}
                                onClick={() => handleExtract(report.id)}
                                disabled={!!extractingId}
                            />
                            <ActionCard
                                gradient="from-pink-600 to-rose-400"
                                icon={<UserPlus className="h-5 w-5" />}
                                label={suggestingId === report.id ? 'Working...' : 'Add to Profile'}
                                onClick={() => handleSuggestProfileInfo(report.id)}
                                disabled={!!suggestingId}
                            />
                        </div>
                    </div>
                    
                    {/* Right Column: Chat Input & Full-Height Photo Container with Terminal Overlay */}
                    <div className="flex min-h-0 flex-col gap-4">
                        <div className="relative shrink-0">
                            <div className="animate-glow-pulse absolute -inset-1 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-primary to-cyan-500 blur-lg" />
                            <div className="relative flex items-center gap-2 rounded-2xl border border-white/20 bg-background/90 px-3 py-2.5 backdrop-blur-xl">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAsk(report.id)}
                                    placeholder="Ask a question..."
                                    className="flex-1 bg-transparent text-sm text-foreground focus:outline-none font-mono"
                                />
                                <button
                                    onClick={() => handleAsk(report.id)}
                                    disabled={askingId === report.id}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white transition hover:opacity-90 disabled:opacity-50"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Full Height Photo Container with Scrollable Terminal Box Overlay */}
                        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/15 flex flex-col">
                            <img src={imgSrc} onError={handleImgError} alt="" className="absolute inset-0 h-full w-full object-cover" />
                            
                            {answers[report.id] && (
                                <div className="relative z-10 m-4 flex flex-col max-h-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-white/15 bg-card/90 backdrop-blur-xl shadow-2xl animate-fade-in-up">
                                    <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5 bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500/80 inline-block"></span>
                                            <span className="h-2 w-2 rounded-full bg-yellow-500/80 inline-block"></span>
                                            <span className="h-2 w-2 rounded-full bg-green-500/80 inline-block"></span>
                                            <span className="ml-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                                                ANSWER TO: &quot;{askedQuestion}&quot;
                                            </span>
                                        </div>
                                    </div>
                                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                        <Md text={answers[report.id].answer} />
                                        <button
                                            onClick={() => handleExplain(report.id)}
                                            disabled={explainingId === report.id}
                                            className="mt-3 text-xs font-mono font-medium text-cyan-400 hover:underline disabled:opacity-50 block"
                                        >
                                            {explainingId === report.id ? 'Explaining...' : 'Explain this answer in simpler terms'}
                                        </button>
                                        {explanations[report.id] && (
                                            <p className="mt-2 whitespace-pre-wrap border-t border-white/10 pt-2 text-xs text-muted-foreground font-mono">
                                                {explanations[report.id]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Verification & Edit Modal Popup */}
            {showVerificationModal && report && draftReadings[report.id] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in-up">
                    <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-white/25 bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <h2 className="font-heading text-lg font-semibold text-foreground">
                                    Verify Extracted Readings
                                </h2>
                                <p className="text-xs text-muted-foreground font-mono">
                                    Review and edit the AI-extracted readings before saving them to your health records.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowVerificationModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-foreground transition hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto py-4 space-y-3">
                            {draftReadings[report.id].length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8 font-mono">
                                    No readings found in this report.
                                </p>
                            ) : (
                                draftReadings[report.id].map((reading, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm"
                                    >
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="text"
                                                value={reading.reading_type}
                                                onChange={(e) => updateDraftReading(report.id, index, 'reading_type', e.target.value)}
                                                className="w-36 rounded-lg border border-white/15 bg-input/30 p-1.5 text-xs text-foreground font-mono"
                                                placeholder="Type"
                                            />
                                            <input
                                                type="number"
                                                value={reading.value}
                                                onChange={(e) => updateDraftReading(report.id, index, 'value', e.target.value)}
                                                className="w-20 rounded-lg border border-white/15 bg-input/30 p-1.5 text-xs text-foreground font-mono"
                                                placeholder="Value"
                                            />
                                            <input
                                                type="text"
                                                value={reading.unit}
                                                onChange={(e) => updateDraftReading(report.id, index, 'unit', e.target.value)}
                                                className="w-20 rounded-lg border border-white/15 bg-input/30 p-1.5 text-xs text-foreground font-mono"
                                                placeholder="Unit"
                                            />
                                            <input
                                                type="date"
                                                value={reading.reading_date || ''}
                                                onChange={(e) => updateDraftReading(report.id, index, 'reading_date', e.target.value)}
                                                className="rounded-lg border border-white/15 bg-input/30 p-1.5 text-xs text-foreground font-mono"
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}