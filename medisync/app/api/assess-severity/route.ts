import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

type LabResult = {
  testName: string
  value: number | string
  unit?: string
}

type ThresholdRule = {
  id: string
  test_name: string
  aliases: string[] | null
  unit: string | null
  warning_low: number | null
  warning_high: number | null
  critical_low: number | null
  critical_high: number | null
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function toNumber(value: number | string) {
  if (typeof value === 'number') return value

  const cleaned = value.toString().replace(/[^\d.-]/g, '')
  const parsed = Number(cleaned)

  return Number.isFinite(parsed) ? parsed : null
}

function findMatchingRule(resultName: string, rules: ThresholdRule[]) {
  const normalizedResultName = normalizeName(resultName)

  return rules.find((rule) => {
    const normalizedMainName = normalizeName(rule.test_name)

    if (normalizedResultName === normalizedMainName) {
      return true
    }

    const aliases = rule.aliases || []

    return aliases.some((alias) => normalizeName(alias) === normalizedResultName)
  })
}

function assessValue(value: number, rule: ThresholdRule) {
  if (rule.critical_low !== null && value <= rule.critical_low) {
    return {
      severity: 'critical_low',
      message: `${rule.test_name} is critically low.`,
    }
  }

  if (rule.critical_high !== null && value >= rule.critical_high) {
    return {
      severity: 'critical_high',
      message: `${rule.test_name} is critically high.`,
    }
  }

  if (rule.warning_low !== null && value <= rule.warning_low) {
    return {
      severity: 'warning_low',
      message: `${rule.test_name} is lower than expected.`,
    }
  }

  if (rule.warning_high !== null && value >= rule.warning_high) {
    return {
      severity: 'warning_high',
      message: `${rule.test_name} is higher than expected.`,
    }
  }

  return {
    severity: 'normal',
    message: `${rule.test_name} appears within the configured range.`,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const results: LabResult[] = body.results || []

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'No lab results provided.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const { data: rules, error } = await supabaseAdmin
      .from('critical_value_thresholds')
      .select('*')
      .eq('enabled', true)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const assessments = results.map((result) => {
      const numericValue = toNumber(result.value)

      if (numericValue === null) {
        return {
          testName: result.testName,
          value: result.value,
          unit: result.unit || null,
          severity: 'unknown',
          message: 'Could not read numeric value.',
          matchedRule: null,
        }
      }

      const matchedRule = findMatchingRule(result.testName, rules || [])

      if (!matchedRule) {
        return {
          testName: result.testName,
          value: numericValue,
          unit: result.unit || null,
          severity: 'unknown',
          message: 'No threshold rule configured for this test.',
          matchedRule: null,
        }
      }

      const assessment = assessValue(numericValue, matchedRule)

      return {
        testName: result.testName,
        value: numericValue,
        unit: result.unit || matchedRule.unit,
        severity: assessment.severity,
        message: assessment.message,
        matchedRule: matchedRule.test_name,
      }
    })

    const hasCritical = assessments.some((item) =>
      item.severity === 'critical_low' || item.severity === 'critical_high'
    )

    const hasWarning = assessments.some((item) =>
      item.severity === 'warning_low' || item.severity === 'warning_high'
    )

    let overallSeverity = 'normal'

    if (hasCritical) {
      overallSeverity = 'critical'
    } else if (hasWarning) {
      overallSeverity = 'warning'
    }

    return NextResponse.json({
      success: true,
      overallSeverity,
      assessments,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Something went wrong.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Assess Severity API is running. Use POST to send lab results.',
    exampleRequest: {
      results: [
        {
          testName: 'Hemoglobin',
          value: '6.8',
          unit: 'g/dL',
        },
        {
          testName: 'Glucose',
          value: '420',
          unit: 'mg/dL',
        },
      ],
    },
  })
}