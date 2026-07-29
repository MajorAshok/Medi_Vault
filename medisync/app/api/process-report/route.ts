import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'

type ExtractedLabResult = {
  testName: string
  value: string | number
  unit?: string
  referenceRange?: string
}

function extractJsonFromText(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)

    if (!match) {
      return null
    }

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

  return severityData.assessments?.some((item: any) =>
    item.severity === 'critical_low' || item.severity === 'critical_high'
  )
}

function buildCriticalSmsMessage(profile: any, severityData: any) {
  const patientName = profile?.full_name || 'A patient'

  const criticalItems =
    severityData?.assessments
      ?.filter((item: any) =>
        item.severity === 'critical_low' || item.severity === 'critical_high'
      )
      ?.map((item: any) => `${item.testName}: ${item.value}${item.unit ? ` ${item.unit}` : ''}`)
      ?.join(', ') || 'critical report values'

  return `Emergency Alert from MediSync: ${patientName}'s medical report shows critical values: ${criticalItems}. Please check on them.`
}

async function notifyEmergencyContacts(profile: any, severityData: any) {
  const smsMessage = buildCriticalSmsMessage(profile, severityData)

  const results: any[] = []

  if (profile.primary_emergency_contact) {
    const greeting = profile.primary_contact_name
      ? `Hi ${profile.primary_contact_name}, `
      : ''

    await sendSMS(profile.primary_emergency_contact, `${greeting}${smsMessage}`)

    results.push({
      contactType: 'primary',
      sent: true,
      to: profile.primary_emergency_contact,
    })
  }

  if (profile.secondary_emergency_contact) {
    const greeting = profile.secondary_contact_name
      ? `Hi ${profile.secondary_contact_name}, `
      : ''

    await sendSMS(profile.secondary_emergency_contact, `${greeting}${smsMessage}`)

    results.push({
      contactType: 'secondary',
      sent: true,
      to: profile.secondary_emergency_contact,
    })
  }

  return results
}

export async function POST(request: Request) {
  try {
    const { reportId, detail = 'short', language = 'en' } = await request.json()

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

    const basePrompt =
      detail === 'detailed'
        ? 'Provide a thorough, plain-language explanation of all test values, what each one measures, whether it is normal or abnormal, and what abnormal values might indicate in general terms. Always recommend confirming with a doctor for diagnosis or treatment.'
        : 'In no more than 4-5 short sentences, summarize the key findings in plain language. List only the test values that are outside the normal range, if any, and gently note they should confirm with a doctor. Do not restate every value.'

    const languageInstruction =
      language === 'hi'
        ? 'Write the summary entirely in Hindi, using Devanagari script. Do not include English except standard medical/lab terms that have no common Hindi equivalent.'
        : 'Write the summary in English.'

    const prompt = `
You are analyzing a medical/lab report.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in triple backticks.

JSON format must be exactly:

{
  "summary": "plain language report summary here",
  "results": [
    {
      "testName": "Hemoglobin",
      "value": "6.8",
      "unit": "g/dL",
      "referenceRange": "12-16"
    }
  ]
}

Rules:
- ${languageInstruction}
- Summary instruction: ${basePrompt}
- Extract measurable lab/test values into the "results" array.
- Only include values that are clearly visible in the report.
- If no lab values are found, return "results": [].
- "value" should contain only the numeric result when possible.
- "unit" should be included when visible.
- "referenceRange" should be included when visible.
`

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

    const rawText = response.text || ''
    const parsed = extractJsonFromText(rawText)

    const summary =
      parsed?.summary ||
      rawText ||
      'Report processed, but no summary could be generated.'

    const extractedResults: ExtractedLabResult[] = Array.isArray(parsed?.results)
      ? parsed.results
      : []

    let severityData: any = null

    if (extractedResults.length > 0) {
      const origin = new URL(request.url).origin

      const severityResponse = await fetch(`${origin}/api/assess-severity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results: extractedResults,
        }),
      })

      severityData = await severityResponse.json()
    }

    const criticalDetected = isCriticalSeverity(severityData)

    let profile: any = null
    let autoNotifyEnabled = false
    let emergencyNotifications: any[] = []

    if (criticalDetected && report.user_id) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select(
          'id, full_name, auto_notify_emergency, primary_emergency_contact, secondary_emergency_contact, primary_contact_name, secondary_contact_name'
        )
        .eq('id', report.user_id)
        .single()

      profile = profileData
      autoNotifyEnabled = Boolean(profile?.auto_notify_emergency)

      if (autoNotifyEnabled && profile) {
        try {
          emergencyNotifications = await notifyEmergencyContacts(profile, severityData)
        } catch (smsError: any) {
          emergencyNotifications = [
            {
              sent: false,
              error: smsError.message || 'Failed to send emergency SMS.',
            },
          ]
        }
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('reports')
      .update({
        ai_summary: summary,
        status: 'completed',
      })
      .eq('id', reportId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      summary,
      extractedResults,
      severity: severityData,
      criticalDetected,
      autoNotifyEnabled,
      emergencyNotifications,
      shouldShowNotifyButton: criticalDetected && !autoNotifyEnabled,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Something went wrong while processing the report.',
      },
      { status: 500 }
    )
  }
}