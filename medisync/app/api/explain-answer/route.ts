import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { reportId, question, answer } = await request.json()

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
            text: `Earlier you were asked: "${question}" and answered: "${answer}"

Now explain your reasoning in more depth — walk through step by step how you arrived at this answer using the report, what specific data points you relied on, and note any assumptions or limitations in your interpretation. Keep it plain-language, 3-5 sentences.`,
          },
        ],
      },
    ],
  })

  return NextResponse.json({ explanation: response.text })
}