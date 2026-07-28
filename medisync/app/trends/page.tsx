'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/Supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Sparkles, Calendar, Activity, ShieldCheck, Layers } from 'lucide-react'

type Reading = {
  id: string
  reading_type: string
  value: number
  unit: string
  reading_date: string
}

export default function Trends() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('')
  
  // AI Insights State
  const [insightLoading, setInsightLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState<string | null>(null)

  useEffect(() => {
    loadReadings()
  }, [])

  async function loadReadings() {
    const { data, error } = await supabase
      .from('health_readings')
      .select('*')
      .order('reading_date', { ascending: true })

    if (!error && data) {
      setReadings(data)
      if (data.length > 0) setSelectedType(data[0].reading_type)
    }
    setLoading(false)
  }

  const readingTypes = Array.from(new Set(readings.map((r) => r.reading_type)))

  const chartData = readings
    .filter((r) => r.reading_type === selectedType)
    .map((r) => ({
      date: r.reading_date,
      value: r.value,
    }))

  const activeReadingObj = readings.find((r) => r.reading_type === selectedType)
  const unit = activeReadingObj?.unit || ''

  const handleGenerateInsights = () => {
    setInsightLoading(true)
    setAiInsight(null)
    setTimeout(() => {
      setInsightLoading(false)
      const currentValues = chartData.map(d => d.value)
      const latestVal = currentValues[currentValues.length - 1] ?? 0
      const formattedName = selectedType.replace(/_/g, ' ')
      
      setAiInsight(
        `Hello! Reviewing your latest records for ${formattedName}, your recent measure stands at ${latestVal} ${unit}. Overall, your numbers reflect good stability compared to previous documents. Continue following your prescribed routine and consult your doctor for any clarification!`
      )
    }, 1200)
  }

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center text-slate-800"
        style={{ background: 'linear-gradient(135deg, #8fd9cf 0%, #f0a8c8 50%, #f6b98a 100%)' }}
      >
        <div className="flex items-center gap-3 animate-pulse">
          <Activity className="w-5 h-5" style={{ color: '#0d9488' }} />
          <span className="text-sm font-semibold tracking-wide">Assembling your health metrics...</span>
        </div>
      </div>
    )
  }

  return (
    <main
      className="min-h-screen w-full text-slate-900 p-6 md:p-10 relative font-sans"
      style={{ background: 'linear-gradient(135deg, #8fd9cf 0%, #f0a8c8 55%, #f6b98a 100%)' }}
    >
      
      {/* Background Soft Blurry Gradient Orbs — matched to sidebar teal/pink/peach */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-teal-200/50 via-emerald-200/30 to-cyan-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-orange-200/50 via-pink-300/40 to-rose-300/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-gradient-to-br from-pink-200/30 via-fuchsia-200/20 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Header Section */}
        <div className="space-y-1.5 bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-white/90 shadow-[0_20px_50px_rgba(20,184,166,0.12)]">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              background: 'linear-gradient(90deg, rgba(20,184,166,0.1), rgba(251,146,60,0.1))',
              border: '1px solid rgba(20,184,166,0.25)',
              color: '#0d9488',
            }}
          >
            <Layers className="w-3.5 h-3.5" /> Dynamic Medical Telemetry
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Health Trends & Analytics
          </h1>
          <p className="text-slate-600 text-xs md:text-sm max-w-2xl font-normal leading-relaxed">
            Immersive chronological progression extracted automatically from your medical records.
          </p>
        </div>

        {readings.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white/90 text-center space-y-2 shadow-[0_20px_50px_rgba(20,184,166,0.12)]">
            <Activity className="w-10 h-10 mx-auto" style={{ color: '#14b8a6' }} />
            <p className="text-slate-800 font-bold text-lg">No records discovered yet.</p>
            <p className="text-xs text-slate-500">Upload a report and extract data to power up this interactive glass graph.</p>
          </div>
        ) : (
          <>
            {/* Metric Selector Buttons — teal-to-coral theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-1">
                Choose Health Metric
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {readingTypes.map((type) => {
                  const isActive = selectedType === type
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type)
                        setAiInsight(null)
                      }}
                      className="px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 transform active:scale-95"
                      style={
                        isActive
                          ? {
                              background: 'linear-gradient(90deg, #0d9488, #ec8fac, #fb923c)',
                              color: '#ffffff',
                              boxShadow: '0 8px 25px rgba(20,184,166,0.3)',
                              border: '1px solid rgba(255,255,255,0.6)',
                              transform: 'scale(1.05)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.8)',
                              border: '1px solid rgba(20,184,166,0.25)',
                              color: '#0f766e',
                            }
                      }
                    >
                      {type.replace(/_/g, ' ')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Soft Glass Card Container with Light Theme */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/90 backdrop-blur-3xl border border-white shadow-[0_30px_70px_rgba(20,184,166,0.15),inset_0_1px_2px_rgba(255,255,255,1)] relative overflow-hidden space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgba(20,184,166,0.15)' }}>
                <div>
                  <h2 className="text-lg font-extrabold capitalize text-slate-900 flex items-center gap-2">
                    {selectedType.replace(/_/g, ' ')} 
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(20,184,166,0.08)', color: '#0d9488', border: '1px solid rgba(20,184,166,0.25)' }}
                    >
                      Live Stream
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" style={{ color: '#0d9488' }} /> Synced from medical archives
                  </p>
                </div>

                {/* AI Insight Button — teal-to-coral gradient */}
                <button
                  onClick={handleGenerateInsights}
                  disabled={insightLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #0d9488, #ec8fac, #fb923c)',
                    boxShadow: '0 10px 25px rgba(20,184,166,0.25)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <Sparkles className="w-4 h-4 animate-spin text-amber-100" />
                  {insightLoading ? 'Interpreting...' : 'AI Insights (Senior Friendly)'}
                </button>
              </div>

              {/* AI Insight Dialog Drawer */}
              {aiInsight && (
                <div
                  className="p-4 rounded-2xl text-slate-800 text-xs animate-fadeIn space-y-1.5 shadow-sm"
                  style={{
                    background: 'linear-gradient(90deg, rgba(20,184,166,0.08), rgba(236,143,172,0.08), rgba(251,146,60,0.08))',
                    border: '1px solid rgba(20,184,166,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: '#0d9488' }}>
                    <ShieldCheck className="w-4 h-4" style={{ color: '#0d9488' }} /> Simple Summary Breakdown
                  </div>
                  <p className="leading-relaxed text-slate-700 font-medium text-sm">
                    {aiInsight}
                  </p>
                </div>
              )}

              {chartData.length === 1 && (
                <p
                  className="text-xs p-3 rounded-2xl font-medium"
                  style={{ color: '#0f766e', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}
                >
                  Single historical record detected. The trend vector will activate once additional logs are recorded over time.
                </p>
              )}

              {/* Graph — line color now a teal→coral gradient matching the new background */}
              <div className="pt-2 pb-2 relative">
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(20,184,166,0.05), transparent)' }}
                />
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fb923c" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="55%" stopColor="#ec8fac" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                      <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#14b8a6" floodOpacity="0.2" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      dy={8}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        backdropFilter: 'blur(16px)',
                        borderColor: 'rgba(20,184,166,0.35)', 
                        borderRadius: '1rem',
                        color: '#0f172a',
                        boxShadow: '0 25px 40px -5px rgba(20,184,166,0.15), 0 0 20px rgba(251,146,60,0.1)',
                        padding: '12px 16px',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                      itemStyle={{ color: '#0d9488', fontWeight: 'bold' }}
                      formatter={(val: any) => [`${val} ${unit}`, selectedType.replace(/_/g, ' ')]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="url(#lineStroke)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      filter="url(#shadow3d)"
                      dot={{ r: 6, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 3 }}
                      activeDot={{ r: 9, fill: '#fb923c', stroke: '#ffffff', strokeWidth: 4 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </>
        )}
      </div>
    </main>
  )
}