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
  Siren,
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
    hidePreview: 'Hide responder preview',
    showPreview: 'Preview what responders will see',
    emergencyPreview: 'Emergency Preview',
    unknownPatient: 'Unknown Patient',
    bloodType: 'Blood Type',
    allergies: 'Allergies',
    noKnownAllergies: 'No known allergies',
    emergencySmsTitle: 'Emergency SMS',
    emergencySmsText:
      'Send an emergency alert to your registered emergency contacts.',
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
    hidePreview: 'रेस्पॉन्डर प्रीव्यू छुपाएँ',
    showPreview: 'देखें कि रेस्पॉन्डर क्या देखेंगे',
    emergencyPreview: 'आपातकालीन प्रीव्यू',
    unknownPatient: 'अज्ञात मरीज',
    bloodType: 'ब्लड ग्रुप',
    allergies: 'एलर्जी',
    noKnownAllergies: 'कोई ज्ञात एलर्जी नहीं',
    emergencySmsTitle: 'आपातकालीन SMS',
    emergencySmsText:
      'अपने सेव किए गए आपातकालीन संपर्कों को तुरंत अलर्ट भेजें।',
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#c084fc] via-[#f472b6] to-[#fb7185]">
        <p className="text-sm text-white/80">{text.loading}</p>
      </main>
    )
  }

  if (!sosUrl || !profileId) {
    return (
      <main className="flex min-h-screen items-center justify-center p-10 text-center">
        <h1 className="text-xl font-bold">{text.mustLogin}</h1>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#c084fc] via-[#f472b6] to-[#fb7185] p-6">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[40rem] w-[40rem] rounded-full bg-white/10 blur-[140px]" />
        <div className="absolute -bottom-24 right-0 h-[36rem] w-[36rem] rounded-full bg-purple-700/20 blur-[140px]" />
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center pt-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5" /> {text.walletCard}
        </span>

        <h1 className="mt-4 text-2xl font-extrabold text-white">
          {text.title}
        </h1>

        <p className="mt-2 max-w-xs text-sm text-white/85">
          {text.subtitle}
        </p>

        <div className="mt-8 w-full rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-full bg-purple-50 px-3 py-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-purple-700">
              MediSync
            </span>

            <span className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-purple-400">
              <ScanLine className="h-3 w-3" /> {text.emergencyAccess}
            </span>
          </div>

          <div className="relative mt-4 flex justify-center rounded-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50 p-7">
            <span className="absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-purple-400" />
            <span className="absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-purple-400" />
            <span className="absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-purple-400" />
            <span className="absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-purple-400" />

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <QRCode value={sosUrl} size={180} fgColor="#4C1D95" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={sosUrl}
              className="w-full truncate rounded-lg border border-neutral-200 bg-neutral-50 p-2 font-mono text-[11px] text-neutral-500"
            />

            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}

              {copied ? text.copied : text.copy}
            </button>
          </div>
        </div>

        {/* Permanent manual emergency SMS block */}
        <div className="mt-5 w-full rounded-3xl border border-red-200/70 bg-white/95 p-5 text-left shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Siren className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-extrabold text-red-700">
                {text.emergencySmsTitle}
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                {text.emergencySmsText}
              </p>
            </div>
          </div>

          <NotifyButton profileId={profileId} />
        </div>

        <button
          onClick={() => setShowPreview((v) => !v)}
          className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-white/90 underline underline-offset-4"
        >
          {showPreview ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}

          {showPreview ? text.hidePreview : text.showPreview}
        </button>

        {showPreview && preview && (
          <div className="mt-4 w-full rounded-2xl border border-white/20 bg-[#0B0A10] p-5 text-left font-mono text-[#F5F3F0]">
            <p className="text-[10px] uppercase tracking-widest text-[#FF5470]">
              {text.emergencyPreview}
            </p>

            <p className="mt-2 text-base font-bold text-white">
              {preview.full_name || text.unknownPatient}
            </p>

            <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#8B8798]">
              <Droplet className="h-3 w-3 text-[#FF5470]" /> {text.bloodType}
            </div>

            <p className="text-2xl font-bold text-white">
              {preview.blood_type || '—'}
            </p>

            <p className="mt-3 text-xs text-[#C9C4D6]">
              {text.allergies}:{' '}
              {preview.allergies?.trim()
                ? preview.allergies
                : text.noKnownAllergies}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}