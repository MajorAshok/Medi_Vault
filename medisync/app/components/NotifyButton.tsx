'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { PhoneCall, CheckCircle2, Loader2 } from 'lucide-react'

const notifyText = {
  en: {
    sending: 'Sending...',
    notifyPrimary: 'Notify Primary Contact',
    notifySecondary: 'Notify Secondary Contact',
    alertSent: 'Alert sent',
    error: 'Error',
  },
  hi: {
    sending: 'भेजा जा रहा है...',
    notifyPrimary: 'प्राथमिक संपर्क को सूचित करें',
    notifySecondary: 'द्वितीय संपर्क को सूचित करें',
    alertSent: 'अलर्ट भेज दिया गया',
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
      setTimeout(() => setSent(null), 4000)
    } else {
      alert(`${text.error}: ${data.error}`)
    }

    setSending(null)
  }

  return (
    <div className="notify-btn-fonts flex flex-col gap-3.5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&display=swap');

        .notify-btn-fonts, .notify-btn-fonts * {
          font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
        }

        @keyframes floatButton {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-btn-1 { animation: floatButton 3.2s ease-in-out infinite; }
        .float-btn-2 { animation: floatButton 3.2s ease-in-out infinite; animation-delay: 0.55s; }

        /* Colorful gradient boundary, transparent fill */
        .gradient-border-btn {
          position: relative;
          background: transparent;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .gradient-border-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .gradient-border-red::before {
          background: linear-gradient(120deg, #f97316, #ef4444, #ec4899);
        }
        .gradient-border-rose::before {
          background: linear-gradient(120deg, #ec4899, #f43f5e, #8b5cf6);
        }
        .gradient-border-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
        }
        .gradient-border-btn:disabled {
          animation: none;
          opacity: 0.55;
        }
      `}</style>

      <button
        onClick={() => notify('primary')}
        disabled={!!sending}
        className="float-btn-1 gradient-border-btn gradient-border-red flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wide text-red-600 transition-colors disabled:cursor-not-allowed"
      >
        {sending === 'primary' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PhoneCall className="h-4 w-4" />
        )}
        {sending === 'primary' ? text.sending : text.notifyPrimary}
      </button>

      <button
        onClick={() => notify('secondary')}
        disabled={!!sending}
        className="float-btn-2 gradient-border-btn gradient-border-rose flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wide text-rose-600 transition-colors disabled:cursor-not-allowed"
      >
        {sending === 'secondary' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PhoneCall className="h-4 w-4" />
        )}
        {sending === 'secondary' ? text.sending : text.notifySecondary}
      </button>

      {sent && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> {text.alertSent}
        </p>
      )}
    </div>
  )
}