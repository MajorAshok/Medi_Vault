'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed right-3 top-18 z-[9999] flex rounded-full border border-white/20 bg-black/40 p-1 shadow-lg backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
          language === 'en'
            ? 'bg-white text-black'
            : 'text-white/70 hover:text-white'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
          language === 'hi'
            ? 'bg-white text-black'
            : 'text-white/70 hover:text-white'
        }`}
      >
        HI
      </button>
    </div>
  )
}