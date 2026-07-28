'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const notifyText = {
  en: {
    sending: 'Sending...',
    notifyPrimary: '📱 Notify Primary Contact',
    notifySecondary: '📱 Notify Secondary Contact',
    alertSent: '✅ Alert sent',
    error: 'Error',
  },
  hi: {
    sending: 'भेजा जा रहा है...',
    notifyPrimary: '📱 प्राथमिक संपर्क को सूचित करें',
    notifySecondary: '📱 द्वितीय संपर्क को सूचित करें',
    alertSent: '✅ अलर्ट भेज दिया गया',
    error: 'त्रुटि',
  },
}

export default function NotifyButton({ profileId }: { profileId: string }) {
  const { language } = useLanguage()
  const text = notifyText[language]

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
      alert(`${text.error}: ${data.error}`)
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
        {sending === 'primary' ? text.sending : text.notifyPrimary}
      </button>

      <button
        onClick={() => notify('secondary')}
        disabled={sending === 'secondary'}
        className="bg-red-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
      >
        {sending === 'secondary' ? text.sending : text.notifySecondary}
      </button>

      {sent && (
        <p className="text-green-700 text-sm">
          {text.alertSent}
        </p>
      )}
    </div>
  )
}