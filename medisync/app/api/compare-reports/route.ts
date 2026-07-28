import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { reportIdA, reportIdB, language = 'en' } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: reports, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .in('id', [reportIdA, reportIdB])

    if (error || !reports || reports.length !== 2) {
      return NextResponse.json(
        { error: 'Could not find both reports' },
        { status: 404 }
      )
    }

    const reportA = reports.find((r) => r.id === reportIdA)
    const reportB = reports.find((r) => r.id === reportIdB)

    if (!reportA?.ai_summary || !reportB?.ai_summary) {
      return NextResponse.json(
        {
          error:
            'Both reports need a summary first — click Quick Summary or Detailed on each before comparing.',
        },
        { status: 400 }
      )
    }

    const languageInstruction =
      language === 'hi'
        ? 'Respond entirely in Hindi using Devanagari script. Do not use English except unavoidable medical/lab terms.'
        : 'Respond in English.'

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
              text: `${languageInstruction}

Compare these two medical report summaries and explain in plain language what changed between them — improvements, worsening, or new/resolved findings.

Rules:
- Be specific about which values changed.
- Keep it to 4-6 sentences.
- Always suggest confirming any concerning trend with a doctor.

Report A (${reportA.uploaded_at}):

${reportA.ai_summary}

Report B (${reportB.uploaded_at}):

${reportB.ai_summary}`,
            },
          ],
        },
      ],
    })

    return NextResponse.json({
      comparison: response.text,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Something went wrong while comparing reports.',
      },
      { status: 500 }
    )
  }
}