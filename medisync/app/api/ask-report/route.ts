import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { reportId, question, language = 'en' } = await request.json()

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

  const languageInstruction =
    language === 'hi'
      ? 'Answer entirely in Hindi using Devanagari script. Do not use English except unavoidable medical/lab terms.'
      : 'Answer in English.'

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64 } },
          {
            text: `${languageInstruction}

Based on this medical report, answer the following question in plain, simple language.

Respond ONLY with valid JSON in exactly this format, no other text:

{
  "answer": "your plain-language answer here",
  "reasoning": "a short explanation of which part of the report you used and how you arrived at this answer",
  "source_text": "the exact short snippet from the report that supports this answer, or empty string if not found in the report"
}

Rules:
- The values of "answer" and "reasoning" must follow the selected language instruction above.
- Keep JSON keys in English exactly as shown: answer, reasoning, source_text.
- If the answer is not clearly in the report, say so in "answer" rather than guessing.
- Leave "source_text" empty if support is not found.
- Always remind the user in "answer" to confirm anything important with a doctor.

Question: ${question}`,
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
    result = {
      answer: response.text || '',
      reasoning: '',
      source_text: '',
    }
  }

  return NextResponse.json(result)
}