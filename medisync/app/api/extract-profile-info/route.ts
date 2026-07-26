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
            text: `Read this medical report and identify any of the following, if mentioned: blood type, drug/food allergies, currently prescribed medications, and existing/diagnosed medical conditions (not just symptoms from this one visit — only ongoing conditions).

Respond ONLY with valid JSON in exactly this format, no other text:
{
  "blood_type": { "value": "O+", "confidence": "high", "source_text": "Blood Group: O+" },
  "allergies": { "value": "Penicillin", "confidence": "medium", "source_text": "..." },
  "current_medications": { "value": "Metformin 500mg twice daily", "confidence": "high", "source_text": "..." },
  "medical_conditions": { "value": "Type 2 Diabetes", "confidence": "high", "source_text": "..." }
}

For any field not found in the report, set "value" to an empty string and "confidence" to "low", with empty source_text. Do not guess or invent information not present in the report.`,
          },
        ],
      },
    ],
  })

  let result
  try {
    const cleaned = response.text?.replace(/```json|```/g, '').trim() || '{}'
    result = JSON.parse(cleaned)
  } catch (e) {
    return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
  }

  return NextResponse.json(result)
}