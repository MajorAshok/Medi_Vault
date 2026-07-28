// components/LanguageFloatingToggle.tsx
"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageFloatingToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex gap-1 rounded-full border bg-white/90 backdrop-blur px-1.5 py-1.5 shadow-lg">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
          language === "en" ? "bg-primary text-white" : "text-gray-600"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("hi")}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
          language === "hi" ? "bg-primary text-white" : "text-gray-600"
        }`}
      >
        हिं
      </button>
    </div>
  );
}