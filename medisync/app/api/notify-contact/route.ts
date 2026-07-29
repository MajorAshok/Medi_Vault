import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'

export async function POST(request: Request) {
    const { profileId, contactType } = await request.json() // contactType: 'primary' | 'secondary'

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    )

    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('full_name, primary_emergency_contact, secondary_emergency_contact, primary_contact_name, secondary_contact_name')
        .eq('id', profileId)
        .single()

    if (error || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const contactNumber = contactType === 'secondary'
        ? profile.secondary_emergency_contact
        : profile.primary_emergency_contact

    const contactName = contactType === 'secondary'
        ? profile.secondary_contact_name
        : profile.primary_contact_name

    if (!contactNumber) {
        return NextResponse.json({ error: 'No contact number on file' }, { status: 400 })
    }

    const greeting = contactName ? `Hi ${contactName}, ` : ''
    const message = `${greeting}Emergency Alert from A Medisync: ${profile.full_name || 'A patient'} has notified you as their emergency contact. Please check on them.`

    try {
        await sendSMS(contactNumber, message)
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}