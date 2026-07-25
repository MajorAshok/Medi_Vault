import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { reportId } = await request.json()

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { data: report, error: fetchError } = await supabaseAdmin
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (fetchError || !report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from('report')
    .download(report.file_path)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Could not download file' }, { status: 500 })
  }

  const arrayBuffer = await fileData.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = fileData.type || 'application/pdf'

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          {
            text: `Extract any numeric health readings from this medical report (e.g. blood sugar, blood pressure systolic/diastolic, cholesterol, weight, hemoglobin, etc.).

Respond ONLY with valid JSON in exactly this format, no other text:
{
  "readings": [
    { "reading_type": "blood_sugar", "value": 110, "unit": "mg/dL", "reading_date": "2026-06-01" }
  ]
}

Use snake_case for reading_type. If no date is found in the report, use null for reading_date. If you find nothing extractable, return { "readings": [] }.`,
          },
        ],
      },
    ],
  })

  let readings = []
  try {
    const cleaned = response.text?.replace(/```json|```/g, '').trim() || '{}'
    const parsed = JSON.parse(cleaned)
    readings = parsed.readings || []
  } catch (e) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  return NextResponse.json({ readings })
}