'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { Property } from './DashboardGrid';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface LanguageOption {
  code: string;
  label: string;
}

interface HeaderProps {
  property: Property;
  guestName?: string | null;
  languages?: LanguageOption[];
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function useGreeting(tr: (key: string, fallback: string) => string) {
  return useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return tr('header.greeting.night', 'Good night');
    if (hour < 12) return tr('header.greeting.morning', 'Good morning');
    if (hour < 18) return tr('header.greeting.afternoon', 'Good afternoon');
    return tr('header.greeting.evening', 'Good evening');
  }, [tr]);
}

/* ------------------------------------------------------------------ */
/*  Language switcher                                                 */
/* ------------------------------------------------------------------ */

function LanguageSwitcher({ languages }: { languages: LanguageOption[] }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = languages.find((l) => l.code === language) ?? languages[0];

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 backdrop-blur-xl transition-colors hover:border-amber-400/40"
      >
        <Globe className="h-3.5 w-3.5 text-amber-300/90" strokeWidth={1.75} />
        <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {current?.code ?? 'EN'}
        </span>
        <ChevronDown
          className={`h-3 w-3 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0e16]/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl"
            >
              {languages.map((lang) => {
                const isActive = lang.code === current?.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage?.(lang.code as any);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                      isActive ? 'bg-amber-400/10 text-amber-300' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {lang.label}
                    {isActive && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */

export default function Header({ property, guestName, languages = DEFAULT_LANGUAGES }: HeaderProps) {
  const { t } = useLanguage();
  
  const tr = (key: string, fallback: string) => {
    const value = (t as Record<string, string>)?.[key];
    return value ? value : fallback;
  };

  const greeting = useGreeting(tr);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0d14]/70 backdrop-blur-2xl">
      {/* faint top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner shadow-black/40">
            {property?.logo_url ? (
              <Image src={property.logo_url} alt={property.name} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-sm font-semibold text-transparent">
                  {property?.name?.charAt(0) ?? '•'}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              {greeting}
              {guestName ? `, ${guestName}` : ''}
            </p>
            <h1 className="truncate bg-gradient-to-r from-white via-white to-amber-100/80 bg-clip-text text-base font-semibold tracking-tight text-transparent">
              {property?.name}
            </h1>
          </div>
        </div>

        <LanguageSwitcher languages={languages} />
      </div>
    </header>
  );
}