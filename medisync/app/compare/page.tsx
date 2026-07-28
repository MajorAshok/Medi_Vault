'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/Supabase'
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  FileText,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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

const compareText = {
  en: {
    loading: 'Loading...',
    title: 'Compare Reports',
    subtitle:
      'Select two different medical reports to analyze biometric metric shifts and clinical trajectory side by side.',
    needTwoReports:
      'You need at least 2 uploaded reports to run a comparative analysis.',
    selectDifferentReports: 'Please select two different reports.',
    reportA: 'Report A',
    reportB: 'Report B',
    selectReferenceRecord: 'Select Reference Record',
    selectTargetRecord: 'Select Target Record',
    chooseReferenceReport: '✨ Choose reference report...',
    chooseTargetReport: '✨ Choose target report...',
    active: 'Active',
    analyzing: 'Analyzing Biometrics...',
    runDeepComparison: 'Run Deep Comparison',
    biometricReading: 'Biometric Reading',
    reportAValue: 'Report A Value',
    reportBDelta: 'Report B Delta',
    stable: 'stable',
    aiClinicalSynthesis: 'AI Clinical Synthesis',
    advancedAssessment: 'Advanced longitudinal metric assessment',
    error: 'Error',
  },
  hi: {
    loading: 'लोड हो रहा है...',
    title: 'रिपोर्ट तुलना',
    subtitle:
      'दो अलग-अलग मेडिकल रिपोर्ट चुनें और बायोमेट्रिक बदलावों को साथ-साथ समझें।',
    needTwoReports:
      'तुलना करने के लिए कम से कम 2 अपलोड की गई रिपोर्ट चाहिए।',
    selectDifferentReports: 'कृपया दो अलग-अलग रिपोर्ट चुनें।',
    reportA: 'रिपोर्ट A',
    reportB: 'रिपोर्ट B',
    selectReferenceRecord: 'रेफरेंस रिकॉर्ड चुनें',
    selectTargetRecord: 'टार्गेट रिकॉर्ड चुनें',
    chooseReferenceReport: '✨ रेफरेंस रिपोर्ट चुनें...',
    chooseTargetReport: '✨ टार्गेट रिपोर्ट चुनें...',
    active: 'सक्रिय',
    analyzing: 'बायोमेट्रिक्स का विश्लेषण हो रहा है...',
    runDeepComparison: 'गहरी तुलना चलाएँ',
    biometricReading: 'बायोमेट्रिक रीडिंग',
    reportAValue: 'रिपोर्ट A वैल्यू',
    reportBDelta: 'रिपोर्ट B बदलाव',
    stable: 'स्थिर',
    aiClinicalSynthesis: 'AI क्लिनिकल सारांश',
    advancedAssessment: 'उन्नत लंबी अवधि का मूल्यांकन',
    error: 'त्रुटि',
  },
}

export default function Compare() {
  const { language } = useLanguage()
  const text = compareText[language]

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
      alert(text.selectDifferentReports)
      return
    }

    setComparing(true)
    setComparison('')
    setReadingRows([])

    const reportA = reports.find((r) => r.id === reportIdA)
    const reportB = reports.find((r) => r.id === reportIdB)

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
      body: JSON.stringify({ reportIdA, reportIdB, language }),
    })

    const data = await res.json()

    if (res.ok) {
      setComparison(data.comparison)
    } else {
      alert(`${text.error}: ${data.error}`)
    }

    setComparing(false)
  }

  const reportA = reports.find((r) => r.id === reportIdA)
  const reportB = reports.find((r) => r.id === reportIdB)

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center font-sans bg-[#0c101d] text-slate-100">
        <p className="text-sm tracking-wide text-slate-400">{text.loading}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full px-6 py-8 md:px-12 md:py-10 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden bg-[#0c101d] text-slate-100">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl shadow-blue-500/20 bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20">
            <GitCompare className="h-6 w-6 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {text.title}
          </h1>

          <p className="text-xs md:text-sm max-w-lg text-slate-300 font-medium">
            {text.subtitle}
          </p>
        </div>

        {reports.length < 2 && (
          <div className="rounded-3xl p-8 text-sm text-center shadow-xl backdrop-blur-xl bg-slate-900/60 border border-white/10 text-slate-300">
            {text.needTwoReports}
          </div>
        )}

        {reports.length >= 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`rounded-3xl p-6 transition-all duration-300 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-5 ${
                  reportA
                    ? 'bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900/90 border-2 border-blue-500/50 shadow-blue-500/15'
                    : 'bg-slate-900/60 border border-white/10 hover:border-blue-500/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-full h-44 md:h-52 rounded-2xl overflow-hidden relative shadow-inner bg-slate-950/80 border border-blue-500/20 flex items-center justify-center group">
                    <img
                      src="/image1.jpg"
                      alt={text.reportA}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-600/30 backdrop-blur-md text-blue-200 border border-blue-400/30 shadow-lg flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 animate-pulse" /> {text.reportA}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold px-1">
                      <span className="text-blue-400">
                        {text.selectReferenceRecord}
                      </span>

                      {reportA && (
                        <span className="text-blue-300/80 font-medium">
                          {new Date(reportA.uploaded_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="relative group/select">
                      <select
                        value={reportIdA}
                        onChange={(e) => setReportIdA(e.target.value)}
                        style={{ transformOrigin: 'top' }}
                        className="w-full appearance-none rounded-2xl px-4 py-3.5 pr-10 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-400 bg-gradient-to-r from-blue-950/60 via-slate-950/90 to-slate-950/90 border border-blue-500/30 text-slate-100 font-semibold shadow-lg hover:border-blue-400/50 cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">
                          {text.chooseReferenceReport}
                        </option>

                        {reports.map((r) => (
                          <option
                            key={r.id}
                            value={r.id}
                            className="bg-slate-900 text-slate-100 py-2"
                          >
                            📄 {r.file_name} ({new Date(r.uploaded_at).toLocaleDateString()})
                          </option>
                        ))}
                      </select>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400 group-hover/select:translate-y-[-40%] transition-transform">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {reportA && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-blue-500/10 to-transparent border border-blue-500/30 flex items-center justify-between text-xs text-blue-200 animate-fadeIn shadow-sm">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                      <span className="truncate font-bold tracking-wide">
                        {reportA.file_name}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-blue-200 shrink-0 bg-blue-500/30 px-2.5 py-1 rounded-full border border-blue-400/40 shadow-sm">
                      <CheckCircle2 className="h-3 w-3 text-blue-300" /> {text.active}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`rounded-3xl p-6 transition-all duration-300 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-5 ${
                  reportB
                    ? 'bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-900/90 border-2 border-purple-500/50 shadow-purple-500/15'
                    : 'bg-slate-900/60 border border-white/10 hover:border-purple-500/30'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-full h-44 md:h-52 rounded-2xl overflow-hidden relative shadow-inner bg-slate-950/80 border border-purple-500/20 flex items-center justify-center group">
                    <img
                      src="/image2.jpg"
                      alt={text.reportB}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-600/30 backdrop-blur-md text-purple-200 border border-purple-400/30 shadow-lg flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 animate-pulse" /> {text.reportB}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold px-1">
                      <span className="text-purple-400">
                        {text.selectTargetRecord}
                      </span>

                      {reportB && (
                        <span className="text-purple-300/80 font-medium">
                          {new Date(reportB.uploaded_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="relative group/select">
                      <select
                        value={reportIdB}
                        onChange={(e) => setReportIdB(e.target.value)}
                        style={{ transformOrigin: 'top' }}
                        className="w-full appearance-none rounded-2xl px-4 py-3.5 pr-10 text-sm outline-none transition-all duration-300 focus:ring-2 focus:ring-purple-400 bg-gradient-to-r from-purple-950/60 via-slate-950/90 to-slate-950/90 border border-purple-500/30 text-slate-100 font-semibold shadow-lg hover:border-purple-400/50 cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">
                          {text.chooseTargetReport}
                        </option>

                        {reports.map((r) => (
                          <option
                            key={r.id}
                            value={r.id}
                            className="bg-slate-900 text-slate-100 py-2"
                          >
                            📄 {r.file_name} ({new Date(r.uploaded_at).toLocaleDateString()})
                          </option>
                        ))}
                      </select>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 group-hover/select:translate-y-[-40%] transition-transform">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {reportB && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600/15 via-purple-500/10 to-transparent border border-purple-500/30 flex items-center justify-between text-xs text-purple-200 animate-fadeIn shadow-sm">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                      <span className="truncate font-bold tracking-wide">
                        {reportB.file_name}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-[11px] font-extrabold text-purple-200 shrink-0 bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/40 shadow-sm">
                      <CheckCircle2 className="h-3 w-3 text-purple-300" /> {text.active}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleCompare}
                disabled={comparing}
                className="inline-flex items-center gap-2.5 rounded-full px-10 py-4 text-sm font-extrabold text-white transition-all transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xl shadow-blue-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border border-white/20"
              >
                {comparing ? (
                  <span className="inline-flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {text.analyzing}
                  </span>
                ) : (
                  <>
                    {text.runDeepComparison} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {readingRows.length > 0 && (
              <div className="rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-slate-900/80 border border-white/10">
                <div className="grid grid-cols-3 px-6 py-4 text-xs font-extrabold uppercase tracking-widest border-b border-white/10 text-slate-400 bg-slate-950/40">
                  <span>{text.biometricReading}</span>
                  <span className="text-blue-400">{text.reportAValue}</span>
                  <span className="text-purple-400">{text.reportBDelta}</span>
                </div>

                {readingRows.map((row, i) => {
                  const diff =
                    row.valueA !== null && row.valueB !== null
                      ? row.valueB - row.valueA
                      : null

                  return (
                    <div
                      key={row.reading_type}
                      className="grid grid-cols-3 px-6 py-4 items-center text-sm transition-colors hover:bg-white/[0.03]"
                      style={{
                        borderBottom:
                          i < readingRows.length - 1
                            ? '1px solid rgba(255,255,255,0.05)'
                            : 'none',
                      }}
                    >
                      <span className="capitalize font-semibold tracking-wide text-slate-100">
                        {row.reading_type.replace(/_/g, ' ')}
                      </span>

                      <span className="font-semibold text-slate-200">
                        {row.valueA !== null ? `${row.valueA} ${row.unit}` : '—'}
                      </span>

                      <span className="flex items-center gap-2.5 flex-wrap font-semibold text-slate-200">
                        {row.valueB !== null ? `${row.valueB} ${row.unit}` : '—'}

                        {diff !== null && diff !== 0 && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-tight shadow-sm"
                            style={{
                              background:
                                diff > 0
                                  ? 'rgba(248,113,113,0.15)'
                                  : 'rgba(74,222,128,0.15)',
                              color: diff > 0 ? '#f87171' : '#4ade80',
                              border: `1px solid ${
                                diff > 0
                                  ? 'rgba(248,113,113,0.3)'
                                  : 'rgba(74,222,128,0.3)'
                              }`,
                            }}
                          >
                            {diff > 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}

                            {diff > 0 ? '+' : ''}
                            {diff}
                          </span>
                        )}

                        {diff === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                            <Minus className="h-3 w-3" /> {text.stable}
                          </span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {comparison && (
              <div className="rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-purple-500/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-inner">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-white">
                      {text.aiClinicalSynthesis}
                    </h2>

                    <p className="text-xs text-purple-300/80 font-medium">
                      {text.advancedAssessment}
                    </p>
                  </div>
                </div>

                <div className="text-sm whitespace-pre-wrap leading-relaxed font-normal space-y-4 text-slate-200 relative z-10">
                  {comparison}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}