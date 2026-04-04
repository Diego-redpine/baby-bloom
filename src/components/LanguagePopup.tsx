"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function LanguagePopup() {
  const { showPopup, dismissPopup } = useLanguage();

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="bg-cream rounded-2xl shadow-2xl p-8 w-full max-w-xs text-center">
        <p className="text-sm text-sage/50 uppercase tracking-wider mb-2">Choose your language</p>
        <p className="text-sm text-sage/50 uppercase tracking-wider mb-6">Elige tu idioma</p>
        <div className="space-y-3">
          <button
            onClick={() => dismissPopup("en")}
            className="w-full py-3.5 bg-sage text-cream font-semibold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            English
          </button>
          <button
            onClick={() => dismissPopup("es")}
            className="w-full py-3.5 bg-blush text-sage font-semibold rounded-xl text-base hover:scale-[1.02] active:scale-[0.98] transition-all border border-blush-dark/20"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Espanol
          </button>
        </div>
      </div>
    </div>
  );
}
