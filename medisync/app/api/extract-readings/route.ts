import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'

type Reading = {
  reading_type: string
  value: number | string
  unit?: string | null
  reading_date?: string | null
  confidence?: 'high' | 'medium' | 'low'
  source_text?: string
}

function readingTypeToTestName(readingType: string) {
  return readingType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
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
      ?.map((item: any) => {
        const unitText = item.unit ? ` ${item.unit}` : ''
        return `${item.testName}: ${item.value}${unitText}`
      })
      ?.join(', ') || 'critical report values'

  return `Emergency Alert from MediSync: ${patientName}'s medical report shows critical values: ${criticalItems}. Please check on them.`
}

async function notifyEmergencyContacts(profile: any, severityData: any) {
  const smsMessage = buildCriticalSmsMessage(profile, severityData)

  const notificationResults: any[] = []

  if (profile.primary_emergency_contact) {
    const greeting = profile.primary_contact_name
      ? `Hi ${profile.primary_contact_name}, `
      : ''

    await sendSMS(profile.primary_emergency_contact, `${greeting}${smsMessage}`)

    notificationResults.push({
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

    notificationResults.push({
      contactType: 'secondary',
      sent: true,
      to: profile.secondary_emergency_contact,
    })
  }

  return notificationResults
}

export async function POST(request: Request) {
  try {
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

Respond ONLY with valid JSON in exactly this format, no markdown, no extra text:

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
- Use "high" if clearly printed/typed and unambiguous.
- Use "medium" if it required interpretation.
- Use "low" if handwritten, unclear, or uncertain.
- source_text should be the exact short snippet from the report.
- If nothing is extractable, return { "readings": [] }.`,
            },
          ],
        },
      ],
    })

    let readings: Reading[] = []

    try {
      const cleaned = response.text?.replace(/```json|```/g, '').trim() || '{}'
      const parsed = JSON.parse(cleaned)

      readings = Array.isArray(parsed.readings) ? parsed.readings : []
    } catch (e) {
      return NextResponse.json(
        {
          error: 'Could not parse AI response',
          rawResponse: response.text,
        },
        { status: 500 }
      )
    }

    const severityInput = readings.map((reading) => ({
      testName: readingTypeToTestName(reading.reading_type),
      value: reading.value,
      unit: reading.unit || undefined,
      confidence: reading.confidence,
      sourceText: reading.source_text,
    }))

    let severityData: any = null

    if (severityInput.length > 0) {
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
    }

    const criticalDetected = isCriticalSeverity(severityData)

    const profileId =
      report.user_id ||
      report.profile_id ||
      report.owner_id ||
      report.created_by ||
      null

    let profile: any = null
    let autoNotifyEnabled = false
    let emergencyNotifications: any[] = []

    if (criticalDetected && profileId) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select(
          'id, full_name, auto_notify_emergency, primary_emergency_contact, secondary_emergency_contact, primary_contact_name, secondary_contact_name'
        )
        .eq('id', profileId)
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

    return NextResponse.json({
      readings,
      severity: severityData,
      criticalDetected,
      autoNotifyEnabled,
      emergencyNotifications,
      shouldShowNotifyButton: criticalDetected && !autoNotifyEnabled,
      profileId,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Something went wrong while extracting readings.',
      },
      { status: 500 }
    )
  }
}