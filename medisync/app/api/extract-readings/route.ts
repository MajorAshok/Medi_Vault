import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Buffer } from 'buffer'

export const runtime = 'nodejs'

type Reading = {
  reading_type: string
  value: number | string
  unit: string
  reading_date: string | null
  confidence?: 'high' | 'medium' | 'low'
  source_text?: string
}

function readingTypeToTestName(readingType: string) {
  return readingType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)

    if (!match) return null

    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function isCriticalSeverity(severityData: any) {
  if (!severityData) return false

  if (severityData.overallSeverity === 'critical') {
    return true
  }

  return severityData.assessments?.some(
    (item: any) =>
      item.severity === 'critical_low' ||
      item.severity === 'critical_high'
  )
}

export async function POST(request: Request) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing reportId' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SECRET_KEY' },
        { status: 500 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing GEMINI_API_KEY' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    )

    const { data: report, error: fetchError } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (fetchError || !report) {
      console.error('Report fetch error:', fetchError)

      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('report')
      .download(report.file_path)

    if (downloadError || !fileData) {
      console.error('File download error:', downloadError)

      return NextResponse.json(
        { error: 'Could not download file' },
        { status: 500 }
      )
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const mimeType = fileData.type || 'application/pdf'

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: `Extract any numeric health readings from this medical report.

Examples:
- blood sugar
- fasting blood sugar
- random blood sugar
- blood pressure systolic
- blood pressure diastolic
- cholesterol
- LDL
- HDL
- triglycerides
- weight
- hemoglobin
- WBC
- platelets
- creatinine
- sodium
- potassium
- troponin

Respond ONLY with valid JSON. No markdown. No extra text.

Use exactly this format:

{
  "readings": [
    {
      "reading_type": "blood_sugar",
      "value": 110,
      "unit": "mg/dL",
      "reading_date": "2026-06-01",
      "confidence": "high",
      "source_text": "Fasting Blood Sugar: 110 mg/dL"
    }
  ]
}

Rules:
- Use snake_case for reading_type.
- value should be numeric when possible.
- If no date is found, use null for reading_date.
- confidence must be one of "high", "medium", or "low".
- source_text should be the exact short snippet from the report.
- If nothing is extractable, return { "readings": [] }.`,
            },
          ],
        },
      ],
    })

    const rawText = response.text || ''
    const parsed = extractJson(rawText)

    let readings: Reading[] = []

    if (parsed && Array.isArray(parsed.readings)) {
      readings = parsed.readings
    } else {
      console.error('Could not parse Gemini response:', rawText)

      return NextResponse.json({
        readings: [],
        severity: null,
        criticalDetected: false,
        parseWarning: true,
        rawResponse: rawText,
      })
    }

    const severityInput = readings.map((reading) => ({
      testName: readingTypeToTestName(reading.reading_type),
      value: reading.value,
      unit: reading.unit,
      confidence: reading.confidence || null,
      sourceText: reading.source_text || null,
    }))

    let severityData: any = null

    if (severityInput.length > 0) {
      try {
        const origin = new URL(request.url).origin

        const severityResponse = await fetch(`${origin}/api/assess-severity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            results: severityInput,
          }),
        })

        severityData = await severityResponse.json()
      } catch (severityError) {
        console.error('Severity route error:', severityError)
        severityData = null
      }
    }

    const criticalDetected = isCriticalSeverity(severityData)

    return NextResponse.json({
      readings,
      severity: severityData,
      criticalDetected,
    })
  } catch (err: any) {
    console.error('extract-readings fatal error:', err)

    return NextResponse.json(
      {
        error: err.message || 'Something went wrong while extracting readings.',
      },
      { status: 500 }
    )
  }
}