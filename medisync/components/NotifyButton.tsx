'use client'
import { useState } from 'react'

export default function NotifyButton({ profileId }: { profileId: string }) {
    const [sending, setSending] = useState<'primary' | 'secondary' | null>(null)
    const [sent, setSent] = useState<string | null>(null)

    async function notify(contactType: 'primary' | 'secondary') {
        setSending(contactType)
        const res = await fetch('/api/notify-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, contactType }),
        })
        const data = await res.json()
        if (res.ok) {
            setSent(contactType)
        } else {
            alert(`Error: ${data.error}`)
        }
        setSending(null)
    }

    return (
        <div className="flex flex-col gap-2 mt-4">
            <button
                onClick={() => notify('primary')}
                disabled={sending === 'primary'}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
                {sending === 'primary' ? 'Sending...' : '📱 Notify Primary Contact'}
            </button>
            <button
                onClick={() => notify('secondary')}
                disabled={sending === 'secondary'}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
                {sending === 'secondary' ? 'Sending...' : '📱 Notify Secondary Contact'}
            </button>
            {sent && <p className="text-green-700 text-sm">✅ Alert sent</p>}
        </div>
    )
}