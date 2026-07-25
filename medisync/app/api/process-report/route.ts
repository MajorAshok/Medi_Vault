import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { reportId, detail = 'short' } = await request.json()

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

    const prompt = detail === 'detailed'
        ? 'This is a medical report. Provide a thorough, plain-language explanation of all test values, what each one measures, whether it is normal or abnormal, and what abnormal values might indicate in general terms. Always recommend confirming with a doctor for diagnosis or treatment.'
        : 'This is a medical report. In no more than 4-5 short sentences, summarize the key findings in plain language. List only the test values that are outside the normal range, if any, and gently note they should confirm with a doctor. Do not restate every value.'

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: [
            {
                role: 'user',
                parts: [
                    { inlineData: { mimeType, data: base64 } },
                    { text: prompt },
                ],
            },
        ],
    })

    const summary = response.text

    const { error: updateError } = await supabaseAdmin
        .from('reports')
        .update({ ai_summary: summary, status: 'completed' })
        .eq('id', reportId)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ summary })
}
