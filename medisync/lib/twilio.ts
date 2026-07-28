import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS(to: string, body: string) {
    // Twilio requires E.164 format (+countrycode number). Adjust default country code as needed.
    const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '')}`

    return client.messages.create({
        body,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // [WHATSAPP - FIXED] prefix + correct env var
        to: `whatsapp:${formattedTo}`,                            // [WHATSAPP - FIXED] prefix added
    })
}