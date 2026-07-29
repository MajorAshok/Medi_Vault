'use client'

import { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
import { supabase } from '@/lib/Supabase'
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Droplet,
  ShieldCheck,
  ScanLine,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import NotifyButton from '@/app/components/NotifyButton'

type PreviewData = {
  full_name: string | null
  blood_type: string | null
  allergies: string | null
}

const medicalQrText = {
  en: {
    loading: 'Loading...',
    mustLogin: 'You must be logged in to view your Medical QR Code.',
    walletCard: 'Your Medical Wallet Card',
    title: 'Scan to Reach Your Emergency Info',
    subtitle:
      'Print this, save it to your lock screen, or keep it in your wallet. Anyone who scans it sees your emergency details instantly — no login needed.',
    emergencyAccess: 'Emergency Access',
    copied: 'Copied',
    copy: 'Copy',
    orEnter: 'Or share the link manually',
    emergencyPanel: 'Emergency Contacts',
    hidePreview: 'Hide responder preview',
    showPreview: 'Preview what responders will see',
    emergencyPreview: 'Emergency Preview',
    unknownPatient: 'Unknown Patient',
    bloodType: 'Blood Type',
    allergies: 'Allergies',
    noKnownAllergies: 'No known allergies',
  },
  hi: {
    loading: 'लोड हो रहा है...',
    mustLogin: 'मेडिकल QR कोड देखने के लिए आपको लॉग इन करना होगा।',
    walletCard: 'आपका मेडिकल वॉलेट कार्ड',
    title: 'आपातकालीन जानकारी देखने के लिए स्कैन करें',
    subtitle:
      'इसे प्रिंट करें, लॉक स्क्रीन पर सेव करें, या वॉलेट में रखें। कोई भी इसे स्कैन करके आपकी आपातकालीन जानकारी तुरंत देख सकता है — लॉग इन की जरूरत नहीं।',
    emergencyAccess: 'आपातकालीन एक्सेस',
    copied: 'कॉपी हुआ',
    copy: 'कॉपी',
    orEnter: 'या लिंक साझा करें',
    emergencyPanel: 'आपातकालीन संपर्क',
    hidePreview: 'रेस्पॉन्डर प्रीव्यू छुपाएँ',
    showPreview: 'देखें कि रेस्पॉन्डर क्या देखेंगे',
    emergencyPreview: 'आपातकालीन प्रीव्यू',
    unknownPatient: 'अज्ञात मरीज',
    bloodType: 'ब्लड ग्रुप',
    allergies: 'एलर्जी',
    noKnownAllergies: 'कोई ज्ञात एलर्जी नहीं',
  },
}

export default function MedicalQrPage() {
  const { language } = useLanguage()
  const text = medicalQrText[language]

  const [profileId, setProfileId] = useState<string | null>(null)
  const [sosUrl, setSosUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadUrl()
  }, [])

  async function loadUrl() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setProfileId(user.id)

    const origin = window.location.origin
    setSosUrl(`${origin}/sos/${user.id}`)

    const { data } = await supabase
      .from('profiles')
      .select('full_name, blood_type, allergies')
      .eq('id', user.id)
      .single()

    if (data) setPreview(data)

    setLoading(false)
  }

  function handleCopy() {
    if (!sosUrl) return

    navigator.clipboard.writeText(sosUrl)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 via-sky-50 to-emerald-50">
        <p className="text-sm text-slate-600">{text.loading}</p>
      </main>
    )
  }

  if (!sosUrl || !profileId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 via-sky-50 to-emerald-50 p-10 text-center">
        <h1 className="text-xl font-bold text-slate-800">{text.mustLogin}</h1>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-100/70 via-pink-100/60 via-sky-100/70 to-teal-100/70 p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        .qr-page-fonts, .qr-page-fonts * {
          font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif;
        }
        .qr-page-fonts .keep-mono {
          font-family: ui-monospace, SFMono-Regular, monospace;
        }

        @keyframes floatBlobA {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(45px, -35px) scale(1.15); }
        }
        @keyframes floatBlobB {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-45px, 35px) scale(1.12); }
        }
        @keyframes floatBlobC {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(35px, 35px) scale(1.1); }
        }
        @keyframes floatBlobD {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -30px) scale(1.08); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-blob-a { animation: floatBlobA 10s ease-in-out infinite; }
        .anim-blob-b { animation: floatBlobB 13s ease-in-out infinite; }
        .anim-blob-c { animation: floatBlobC 16s ease-in-out infinite; }
        .anim-blob-d { animation: floatBlobD 11s ease-in-out infinite; }
        .fade-in-up { animation: fadeInUp 0.5s ease both; }
        .glass-panel {
          background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.45));
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow:
            0 1px 0 rgba(255,255,255,1) inset,
            0 24px 60px -24px rgba(139, 92, 246, 0.18);
        }
      `}</style>

      {/* Rich Multi-colored Vibrant & Soft Light Background Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="anim-blob-a absolute -top-28 -left-28 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-pink-400/35 via-rose-300/25 to-transparent blur-[110px]" />
        <div className="anim-blob-b absolute top-10 right-[-10rem] h-[44rem] w-[44rem] rounded-full bg-gradient-to-br from-violet-400/35 via-purple-300/25 to-indigo-300/20 blur-[130px]" />
        <div className="anim-blob-c absolute bottom-[-10rem] left-[10rem] h-[38rem] w-[38rem] rounded-full bg-gradient-to-br from-cyan-400/30 via-teal-300/25 to-emerald-300/20 blur-[120px]" />
        <div className="anim-blob-d absolute bottom-[-6rem] right-[5rem] h-[35rem] w-[35rem] rounded-full bg-gradient-to-br from-amber-300/35 via-orange-300/25 to-pink-300/20 blur-[110px]" />
      </div>

      <div className="qr-page-fonts mx-auto flex max-w-4xl flex-col items-center pt-10 text-center">
        <span className="fade-in-up inline-flex items-center gap-1.5 rounded-full border border-white/90 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-violet-900 shadow-sm backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {text.walletCard}
        </span>

        <h1 className="fade-in-up mt-5 text-[28px] font-bold leading-tight tracking-tight text-slate-800" style={{ animationDelay: '80ms' }}>
          {text.title}
        </h1>

        <p className="fade-in-up mt-3 max-w-md text-sm leading-relaxed text-slate-600" style={{ animationDelay: '140ms' }}>
          {text.subtitle}
        </p>

        {/* Two-panel layout: QR (left) + Emergency (right) */}
        <div className="fade-in-up mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2" style={{ animationDelay: '200ms' }}>
          {/* Left panel — QR code */}
          <div className="glass-panel flex flex-col rounded-[32px] p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="keep-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                MediSync
              </span>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                <ScanLine className="h-3 w-3" /> {text.emergencyAccess}
              </span>
            </div>

            <div className="relative mt-5 flex flex-1 items-center justify-center rounded-3xl border border-white/90 bg-white/60 p-7 shadow-inner">
              <span className="absolute left-4 top-4 h-6 w-6 rounded-tl-xl border-l-2 border-t-2 border-violet-400/50" />
              <span className="absolute right-4 top-4 h-6 w-6 rounded-tr-xl border-r-2 border-t-2 border-violet-400/50" />
              <span className="absolute bottom-4 left-4 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-violet-400/50" />
              <span className="absolute bottom-4 right-4 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-violet-400/50" />

              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_-8px_rgba(139,92,246,0.25)]">
                <QRCode value={sosUrl} size={176} fgColor="#1e293b" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-[11px] font-medium uppercase tracking-widest text-slate-500/70">
                {text.orEnter}
              </span>
              <span className="h-px flex-1 bg-slate-300/60" />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sosUrl}
                className="keep-mono w-full truncate rounded-xl border border-white/90 bg-white/70 px-3.5 py-3 text-[12px] text-slate-600 focus:outline-none shadow-sm"
              />

              <button
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 px-4 py-3 text-xs font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_4px_12px_-2px_rgba(139,92,246,0.4)] transition active:translate-y-[1px] hover:opacity-95"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? text.copied : text.copy}
              </button>
            </div>
          </div>

          {/* Right panel — Emergency image + buttons */}
          <div className="glass-panel flex flex-col rounded-[32px] p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="keep-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">
                {text.emergencyPanel}
              </span>
            </div>

            <div className="relative mt-5 flex flex-1 overflow-hidden rounded-3xl border border-white/90 bg-white/60 shadow-inner">
              <img
                src="/emergency.jpg"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-5">
              <NotifyButton profileId={profileId} />
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPreview((v) => !v)}
          className="fade-in-up mt-6 flex items-center gap-1.5 text-xs font-semibold text-violet-600 underline underline-offset-4 transition hover:text-violet-800"
          style={{ animationDelay: '320ms' }}
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? text.hidePreview : text.showPreview}
        </button>

        {showPreview && preview && (
          <div className="glass-panel fade-in-up mt-4 w-full max-w-md rounded-2xl p-5 text-left text-slate-800 backdrop-blur-2xl">
            <p className="keep-mono text-[10px] uppercase tracking-widest text-rose-600">
              {text.emergencyPreview}
            </p>

            <p className="mt-2 text-base font-bold text-slate-800">
              {preview.full_name || text.unknownPatient}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500">
              <Droplet className="h-3 w-3 text-rose-600" /> {text.bloodType}
            </div>

            <p className="text-2xl font-bold text-slate-800">
              {preview.blood_type || '—'}
            </p>

            <p className="mt-3 text-xs text-slate-600">
              {text.allergies}:{' '}
              {preview.allergies?.trim() ? preview.allergies : text.noKnownAllergies}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}