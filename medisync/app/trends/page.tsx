'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/Supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

  const unit = readings.find((r) => r.reading_type === selectedType)?.unit || ''

  if (loading) return <p className="p-10">Loading...</p>

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Health Trends</h1>

      {readings.length === 0 && (
        <p>No health readings yet. Upload a report and extract readings first.</p>
      )}

      {readings.length > 0 && (
        <>
          <div className="mb-4 flex gap-2 flex-wrap">
            {readingTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded text-sm border ${
                  selectedType === type ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {chartData.length === 1 && (
            <p className="text-sm text-gray-500 mb-3">
              Only one reading so far — the chart will show a trend line once you have more data points over time.
            </p>
          )}

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={`${selectedType.replace(/_/g, ' ')} (${unit})`}
                stroke="#000"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </main>
  )
}