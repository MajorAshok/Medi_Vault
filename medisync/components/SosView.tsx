'use client'

import { useEffect, useState } from 'react'
import {
  Droplet,
  AlertTriangle,
  Pill,
  Stethoscope,
  HeartHandshake,
  Radio,
} from 'lucide-react'
import NotifyButton from '@/app/components/NotifyButton'
import { useLanguage } from '@/contexts/LanguageContext'

type SosData = {
  id: string
  full_name: string | null
  blood_type: string | null
  allergies: string | null
  current_medications: string | null
  medical_conditions: string | null
  organ_donor: boolean | null
}

const sosViewText = {
  en: {
    emergencyStrip: 'Emergency Medical Info — No Login Required',
    patientAlt: 'Patient',
    unknownPatient: 'Unknown Patient',
    yearsOld: 'years old',
    ageNotProvided: 'Age not provided',
    bloodType: 'Blood Type',
    allergies: 'Allergies',
    noKnownAllergies: 'No known allergies',
    currentMedications: 'Current Medications',
    noneListed: 'None listed',
    medicalConditions: 'Medical Conditions',
    organDonor: 'Organ Donor',
    yes: 'Yes',
    no: 'No',
    disclaimer:
      'Info entered by the patient — not verified by a medical professional.',
    alertContact: "Alert this patient's emergency contact",
  },
  hi: {
    emergencyStrip: 'आपातकालीन मेडिकल जानकारी — लॉग इन जरूरी नहीं',
    patientAlt: 'मरीज',
    unknownPatient: 'अज्ञात मरीज',
    yearsOld: 'वर्ष',
    ageNotProvided: 'उम्र उपलब्ध नहीं',
    bloodType: 'ब्लड ग्रुप',
    allergies: 'एलर्जी',
    noKnownAllergies: 'कोई ज्ञात एलर्जी नहीं',
    currentMedications: 'वर्तमान दवाएँ',
    noneListed: 'कुछ दर्ज नहीं',
    medicalConditions: 'चिकित्सा स्थितियाँ',
    organDonor: 'अंग दाता',
    yes: 'हाँ',
    no: 'नहीं',
    disclaimer:
      'यह जानकारी मरीज द्वारा दर्ज की गई है — किसी मेडिकल प्रोफेशनल द्वारा सत्यापित नहीं।',
    alertContact: 'इस मरीज के आपातकालीन संपर्क को अलर्ट करें',
  },
}

export default function SosView({
  data,
  avatarUrl,
  age,
}: {
  data: SosData
  avatarUrl: string | null
  age: number | null
}) {
  const { language } = useLanguage()
  const text = sosViewText[language]

  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setScanned(true), 900)
    return () => clearTimeout(t)
  }, [])

  const hasAllergies = data.allergies && data.allergies.trim().length > 0

  return (
    <main className="relative min-h-screen bg-[#0B0A10] font-mono text-[#F5F3F0]">
      <style>{`
        @keyframes scanSweep {
          0% { top: -10%; opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .scan-sweep { animation: scanSweep 1.1s ease-out forwards; }
        .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.4s ease both; }

        @media (prefers-reduced-motion: reduce) {
          .scan-sweep,
          .pulse-dot,
          .fade-up {
            animation: none !important;
          }
        }
      `}</style>

      {!scanned && (
        <div className="scan-sweep pointer-events-none absolute left-0 right-0 h-24 bg-gradient-to-b from-[#FF5470]/0 via-[#FF5470]/25 to-[#FF5470]/0" />
      )}

      <div className="flex items-center justify-center gap-2 bg-[#FF5470] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1a0509]">
        <span className="pulse-dot h-2 w-2 rounded-full bg-[#1a0509]" />
        {text.emergencyStrip}
      </div>

      <div className="mx-auto max-w-md px-5 pb-10 pt-8">
        <div className="fade-up flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={data.full_name || text.patientAlt}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-[#FF5470]/40"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1D1B26] text-2xl font-bold text-[#8B8798] ring-2 ring-[#2A2733]">
              {(data.full_name || '?').charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <p className="text-lg font-bold text-white">
              {data.full_name || text.unknownPatient}
            </p>

            <p className="text-xs text-[#8B8798]">
              {age !== null ? `${age} ${text.yearsOld}` : text.ageNotProvided}
            </p>
          </div>
        </div>

        <div className="fade-up mt-6 rounded-2xl border border-[#FF5470]/30 bg-gradient-to-br from-[#1D1B26] to-[#150F17] p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#8B8798]">
            <Droplet className="h-3 w-3 text-[#FF5470]" />
            {text.bloodType}
          </div>

          <p className="mt-1 text-6xl font-bold tracking-tight text-white">
            {data.blood_type || '—'}
          </p>
        </div>

        <Row
          icon={<AlertTriangle className="h-4 w-4" />}
          label={text.allergies}
          value={data.allergies}
          emptyText={text.noKnownAllergies}
          tone={hasAllergies ? 'amber' : 'teal'}
        />

        <Row
          icon={<Pill className="h-4 w-4" />}
          label={text.currentMedications}
          value={data.current_medications}
          emptyText={text.noneListed}
          tone="neutral"
        />

        <Row
          icon={<Stethoscope className="h-4 w-4" />}
          label={text.medicalConditions}
          value={data.medical_conditions}
          emptyText={text.noneListed}
          tone="neutral"
        />

        <div className="fade-up mt-4 flex items-center gap-2 rounded-xl border border-[#2A2733] bg-[#15131C] px-4 py-3">
          <HeartHandshake
            className={`h-4 w-4 ${
              data.organ_donor ? 'text-[#2DD4BF]' : 'text-[#8B8798]'
            }`}
          />

          <span className="text-xs text-[#C9C4D6]">
            {text.organDonor}
          </span>

          <span
            className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              data.organ_donor
                ? 'bg-[#2DD4BF]/15 text-[#2DD4BF]'
                : 'bg-[#2A2733] text-[#8B8798]'
            }`}
          >
            {data.organ_donor ? text.yes : text.no}
          </span>
        </div>

        <p className="fade-up mt-6 flex items-center gap-1.5 text-[10px] text-[#5C586A]">
          <Radio className="h-3 w-3" />
          {text.disclaimer}
        </p>

        <div className="fade-up mt-8 rounded-2xl border border-[#2A2733] bg-[#15131C] p-4">
          <p className="mb-3 text-center text-[10px] uppercase tracking-widest text-[#8B8798]">
            {text.alertContact}
          </p>

          <NotifyButton profileId={data.id} />
        </div>
      </div>
    </main>
  )
}

function Row({
  icon,
  label,
  value,
  emptyText,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string | null
  emptyText: string
  tone: 'amber' | 'teal' | 'neutral'
}) {
  const hasValue = value && value.trim().length > 0

  const toneClass =
    tone === 'amber' && hasValue
      ? 'border-[#FFB020]/30 bg-[#FFB020]/10 text-[#FFB020]'
      : tone === 'teal'
        ? 'border-[#2DD4BF]/25 bg-[#2DD4BF]/5 text-[#2DD4BF]'
        : 'border-[#2A2733] bg-[#15131C] text-[#C9C4D6]'

  return (
    <div className={`fade-up mt-4 rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] opacity-80">
        {icon} {label}
      </div>

      <p className="mt-1.5 text-sm leading-relaxed text-[#F5F3F0]">
        {hasValue ? value : <span className="text-[#5C586A]">{emptyText}</span>}
      </p>
    </div>
  )
}