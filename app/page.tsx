'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  Sparkles,
  KeyRound,
  Wifi,
  Languages,
  BookOpen,
  Bot,
  ArrowRight,
  PlayCircle,
  Send,
  QrCode,
  Smartphone,
  CheckCircle2,
  Compass,
  Utensils,
  Sun,
  MessageCircle,
  Bell,
  ThermometerSun,
  Waves,
  Camera,
  Globe2,
} from 'lucide-react';

const TURQUOISE = '#00A896';
const EMERALD = '#10B981';

const ROTATING_PHRASES = [
  'εξοικονομεί χρόνο στους οικοδεσπότες.',
  'μηδενίζει τις επαναλαμβανόμενες ερωτήσεις.',
  'αυξάνει τις 5-star κριτικές σας.',
  'αυτοματοποιεί την επικοινωνία άφιξης.',
  'εντυπωσιάζει τους καλεσμένους από το 1ο λεπτό.',
];

const MICRO_FEATURES = '🔑 Self Check-in  •  📸 Φωτογραφίες Manual  •  🏖️ Καιρός & Παραλίες  •  🤖 24/7 AI Concierge  •  🌐 4 Γλώσσες';

function RotatingHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="mt-2 block w-full min-h-[1.3em] sm:min-h-[1.35em] lg:min-h-[1.3em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="block w-full whitespace-normal break-words bg-gradient-to-r from-[#00A896] to-emerald-500 bg-clip-text text-transparent"
        >
          {ROTATING_PHRASES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function FloatingPill({
  icon: Icon,
  label,
  className,
  delay = 0,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 },
      }}
      className={`absolute z-30 hidden items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-stone-800 shadow-xl shadow-stone-900/10 backdrop-blur-md sm:flex ${className}`}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})` }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

/**
 * Native, hand-built preview screen shown inside the phone mockup.
 * Always renders instantly (no network dependency) so the hero never
 * shows a broken/404 iframe while a real property slug is loading
 * or when none exists yet.
 */
function NativeMockupScreen() {
  const navItems = [
    { icon: Sparkles, label: 'Αρχική' },
    { icon: BookOpen, label: 'Manual' },
    { icon: Compass, label: 'Explore' },
    { icon: MessageCircle, label: 'Support' },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#F7F4EC]">
      {/* cover photo */}
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-gradient-to-br from-emerald-200 via-teal-100 to-amber-100">
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.7), transparent 60%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-[8px] font-bold uppercase tracking-wide text-white/90 drop-shadow">Boutique Suite</p>
          <p className="text-sm font-black text-white drop-shadow">Villa Hostkey</p>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})` }}
        >
          <span className="flex items-center gap-2 text-[11px] font-bold">
            <KeyRound className="h-3.5 w-3.5" />
            Self Check-in
          </span>
          <span className="text-[9px] font-semibold opacity-90">Κωδικοί →</span>
        </button>

        <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-stone-500">
            <Wifi className="h-3 w-3 text-sky-500" />
            <span>Wi-Fi Δίκτυο</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900">Villa_Hostkey_5G</span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
              sunset-2026
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: BookOpen, label: 'Οδηγός Σπιτιού' },
            { icon: Compass, label: 'Τοπικές Προτάσεις' },
          ].map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-start gap-1.5 rounded-2xl border border-stone-200 bg-white p-2.5 shadow-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <c.icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[9px] font-bold leading-tight text-stone-800">{c.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-stone-500">
            <Sun className="h-3 w-3 text-amber-500" />
            <span>Καιρός & Παραλίες</span>
          </div>
          <p className="mt-1 text-[10px] font-semibold text-stone-700">28°C • Απάνεμη ακτή σήμερα</p>
        </div>
      </div>

      {/* bottom navigation */}
      <div className="flex shrink-0 items-center justify-around border-t border-stone-200 bg-white/95 px-2 py-2.5 backdrop-blur">
        {navItems.map((t, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-0.5 ${i === 0 ? 'text-emerald-600' : 'text-stone-400'}`}
          >
            <t.icon className="h-4 w-4" />
            <span className="text-[7px] font-bold">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [demoSlug, setDemoSlug] = useState<string | null>(null);
  const [demoStatus, setDemoStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    let cancelled = false;

    // Safety timeout: never leave the phone waiting on a slow/failed
    // request — fall back to the native mockup instead of a blank iframe.
    const timeout = setTimeout(() => {
      if (!cancelled) setDemoStatus((prev) => (prev === 'loading' ? 'fallback' : prev));
    }, 3000);

    (async () => {
      try {
        const { data, error } = await supabase.from('properties').select('slug').limit(1).single();
        if (cancelled) return;
        if (!error && data?.slug) {
          setDemoSlug(data.slug);
          setDemoStatus('ready');
        } else {
          setDemoStatus('fallback');
        }
      } catch {
        if (!cancelled) setDemoStatus('fallback');
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const highlights = [
    { icon: KeyRound, label: 'Αυτόνομο Self Check-in & Κωδικοί' },
    { icon: Camera, label: 'Οδηγίες Συσκευών & Φωτογραφίες Manual' },
    { icon: Sun, label: 'Προτάσεις για Παραλίες & Καιρός' },
    { icon: Utensils, label: 'Επιλεγμένες Ταβέρνες, Μπαρ & Αξιοθέατα' },
    { icon: Wifi, label: 'Wi-Fi με 1 Κλικ ή QR Code' },
    { icon: Languages, label: 'Αυτόματη Μετάφραση σε 4 Γλώσσες' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EC] text-stone-900 selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#F7F4EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md shadow-emerald-700/20"
              style={{ background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})` }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-stone-900">Hostkey</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Digital Guest Guidebook
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 shadow-sm transition hover:bg-stone-50"
            >
              <KeyRound className="h-3.5 w-3.5 text-stone-500" />
              <span>Σύνδεση Οικοδεσπότη</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
        {/* soft background glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${TURQUOISE}, transparent)` }}
        />

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Η απόλυτη εμπειρία φιλοξενίας για καταλύματα & βίλες</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mx-auto mt-6 w-full max-w-4xl whitespace-normal break-words text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.15] lg:text-6xl"
          >
            Ψηφιακός Οδηγός Επισκεπτών που
            <RotatingHeadline />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-sm font-semibold leading-relaxed text-stone-600 sm:text-base"
          >
            <span className="text-stone-500">Δυνατότητες:</span> {MICRO_FEATURES}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              style={{
                background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})`,
                boxShadow: '0 14px 30px -10px rgba(0,168,150,0.45)',
              }}
            >
              <span>Δημιουργήστε τον Οδηγό σας</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#live-preview"
              className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-6 py-4 text-base font-bold text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-stone-50 active:translate-y-0"
            >
              <PlayCircle className="h-4 w-4 text-emerald-600" />
              <span>Δοκιμάστε το Live Demo</span>
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 text-xs font-medium text-stone-500 sm:text-sm"
          >
            Έτοιμο σε 3 λεπτά • Λειτουργεί άμεσα σε κινητά & tablets χωρίς κατέβασμα app
          </motion.p>
        </div>

        {/* Interactive mobile mockup / live preview centerpiece */}
        <div id="live-preview" className="relative mx-auto mt-16 max-w-5xl scroll-mt-24 sm:mt-20">
          <div className="relative mx-auto flex h-[560px] max-w-xs items-center justify-center sm:h-[620px] sm:max-w-sm">
            {/* Left angled preview card */}
            <motion.div
              initial={{ opacity: 0, x: -30, rotate: -14 }}
              animate={{ opacity: 1, x: 0, rotate: -10 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute left-[-15%] top-16 z-10 hidden w-48 -rotate-6 rounded-[26px] border border-white/70 bg-white/70 p-3 shadow-2xl shadow-stone-900/10 backdrop-blur-md sm:left-[-22%] sm:block lg:left-[-8%]"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600">
                <Waves className="h-3 w-3 text-sky-500" />
                <span>Παραλίες & Ταβέρνες</span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="h-16 w-full rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100" />
                <div className="h-2.5 w-3/4 rounded-full bg-stone-200" />
                <div className="h-2.5 w-1/2 rounded-full bg-stone-200" />
              </div>
              <div className="mt-2 flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">
                <ThermometerSun className="h-3 w-3" />
                <span>28°C • Απάνεμη σήμερα</span>
              </div>
            </motion.div>

            {/* Right angled preview card */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotate: 14 }}
              animate={{ opacity: 1, x: 0, rotate: 10 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute right-[-15%] bottom-16 z-10 hidden w-48 rotate-6 rounded-[26px] border border-white/70 bg-white/70 p-3 shadow-2xl shadow-stone-900/10 backdrop-blur-md sm:right-[-22%] sm:block lg:right-[-8%]"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600">
                <BookOpen className="h-3 w-3 text-indigo-500" />
                <span>House Manual & Wi-Fi</span>
              </div>
              <div className="mt-2 rounded-xl bg-stone-900 p-2.5 text-white">
                <div className="text-[8px] font-semibold uppercase tracking-wide text-stone-400">Wi-Fi Δίκτυο</div>
                <div className="mt-0.5 text-[11px] font-bold">Villa_Hostkey_5G</div>
                <div className="mt-1.5 text-[8px] font-semibold uppercase tracking-wide text-stone-400">Κωδικός</div>
                <div className="mt-0.5 font-mono text-[11px] font-bold text-emerald-400">sunset-2026</div>
              </div>
              <div className="mt-2 h-2.5 w-2/3 rounded-full bg-stone-200" />
            </motion.div>

            {/* Center phone frame */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative z-20 h-full w-full max-w-[300px] rounded-[46px] border-[10px] border-stone-900 bg-stone-900 shadow-2xl"
              style={{ boxShadow: '0 40px 70px -25px rgba(28,25,23,0.5)' }}
            >
              <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-stone-900" />
              <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-white">
                {demoStatus === 'ready' && demoSlug ? (
                  <iframe
                    src={`/${demoSlug}`}
                    title="Hostkey Live Demo Preview"
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                ) : (
                  <NativeMockupScreen />
                )}
              </div>
            </motion.div>

            {/* Live demo badge */}
            <motion.a
              href={demoStatus === 'ready' && demoSlug ? `/${demoSlug}` : '/login'}
              target={demoStatus === 'ready' && demoSlug ? '_blank' : undefined}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})`,
                boxShadow: '0 10px 24px -8px rgba(0,168,150,0.5)',
              }}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Δοκιμάστε το Live Demo!</span>
            </motion.a>

            {/* Floating notification pills — positioned to clear the badge,
                the phone bezel, and the two side preview cards */}
            <FloatingPill
              icon={Bell}
              label="Νέο check-in στις 15:00"
              className="right-[-4%] top-9 sm:right-[0%] lg:right-[6%]"
              delay={0.7}
            />
            <FloatingPill
              icon={Wifi}
              label="Wi-Fi συνδέθηκε αυτόματα"
              className="left-[-6%] top-[56%] sm:left-[-1%] lg:left-[7%]"
              delay={0.9}
            />
            <FloatingPill
              icon={CheckCircle2}
              label="Ο επισκέπτης διάβασε τις οδηγίες A/C"
              className="right-[-8%] bottom-10 sm:right-[-2%] lg:right-[5%]"
              delay={1.1}
            />
          </div>
        </div>

        {/* trust row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-2.5 sm:mt-20">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200/90 bg-white px-4 py-2 text-xs font-semibold text-stone-800 shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-600" />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* HOW TO SHARE SECTION: Link & Stand with QR / NFC */}
      <section className="border-y border-stone-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Εύκολη Πρόσβαση Επισκεπτών</h2>
            <p className="mt-2 text-2xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Πώς φτάνει ο οδηγός στα χέρια του ταξιδιώτη;
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Μηδενίστε τις επαναλαμβανόμενες ερωτήσεις για κλειδιά, Wi-Fi και συσκευές. Ο επισκέπτης έχει τα πάντα πριν καν πατήσει το πόδι του στο σπίτι.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Method 1: Direct Link */}
            <div className="flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-[#F7F4EC]/60 p-8 transition hover:border-emerald-500/50 hover:shadow-lg">
              <div>
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})` }}
                >
                  <Send className="h-6 w-6" />
                </div>
                <span className="mt-6 inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase text-emerald-800">
                  Πριν την Άφιξη
                </span>
                <h3 className="mt-3 text-xl font-bold text-stone-900">Αποστολή ως Σύνδεσμος (Link)</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Στείλτε το μοναδικό link του διαμερίσματός σας (π.χ.{' '}
                  <span className="font-mono text-xs font-semibold text-emerald-700">hostkey.gr/to-spiti-sas</span>) μέσω
                  Airbnb, Booking, WhatsApp ή SMS. Ο επισκέπτης βρίσκει οδηγίες άφιξης, τοποθεσία στο Google Maps και
                  κωδικούς πριν καν ξεκινήσει το ταξίδι του.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { icon: MessageCircle, label: 'WhatsApp' },
                    { icon: Send, label: 'SMS' },
                    { icon: Globe2, label: 'Airbnb / Booking' },
                  ].map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700"
                    >
                      <c.icon className="h-3 w-3 text-emerald-600" />
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs text-stone-500">
                💬{' '}
                <em>
                  «Γεια σας! Εδώ θα βρείτε τον ψηφιακό οδηγό του σπιτιού με κωδικούς check-in και Wi-Fi:
                  hostkey.gr/...»
                </em>
              </div>
            </div>

            {/* Method 2: QR & NFC Stand */}
            <div className="flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-[#F7F4EC]/60 p-8 transition hover:border-emerald-500/50 hover:shadow-lg">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-md shadow-stone-900/20">
                  <QrCode className="h-6 w-6 text-emerald-400" />
                </div>
                <span className="mt-6 inline-block rounded-full bg-stone-200 px-3 py-1 text-[11px] font-bold uppercase text-stone-800">
                  Μέσα στο Κατάλυμα
                </span>
                <h3 className="mt-3 text-xl font-bold text-stone-900">Επιτραπέζιο Stand με QR Code & NFC</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Εκτυπώστε το αυτόματο QR Code ή τοποθετήστε ένα καλαίσθητο σταντ στην είσοδο ή στο σαλόνι. Ο
                  επισκέπτης απλώς σκανάρει το QR με την κάμερα ή ακουμπάει το κινητό του (NFC) και ο οδηγός ανοίγει
                  άμεσα στην οθόνη του.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs text-stone-600">
                <Smartphone className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>Άμεσο άνοιγμα χωρίς κατέβασμα εφαρμογής από το App Store.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Key Features */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Δυνατότητες Πλατφόρμας</h2>
            <p className="mt-2 text-2xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Όλα όσα χρειάζεται ένας σύγχρονος οικοδεσπότης
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50 text-amber-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Self Check-in & Smart Lock</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Κωδικοί κλειδοθήκης με ασφαλές κουμπί εμφάνισης/απόκρυψης, αναλυτικά βήματα εισόδου και οδηγίες
                άφιξης οποιαδήποτε ώρα.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200/60 bg-sky-50 text-sky-600">
                <Wifi className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">1-Tap Wi-Fi & QR Connect</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Αντιγραφή κωδικού με ένα άγγιγμα ή σκανάρισμα του ενσωματωμένου QR Code για άμεση σύνδεση στο δίκτυο
                του σπιτιού.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200/60 bg-emerald-50 text-emerald-600">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Αυτόματη Μετάφραση σε 4 Γλώσσες</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Γράφετε μόνο μία φορά στα ελληνικά και με το μαγικό κουμπί το σύστημα μεταφράζει αυτόματα σε
                Αγγλικά, Γαλλικά και Γερμανικά.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-200/60 bg-indigo-50 text-indigo-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Οδηγός Σπιτιού & Φωτογραφίες Συσκευών</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Ανεβάστε φωτογραφίες με τις ρυθμίσεις του A/C, του θερμοσίφωνα, του πλυντηρίου και της TV ώστε ο
                επισκέπτης να καταλαβαίνει αμέσως τη λειτουργία τους.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200/60 bg-rose-50 text-rose-600">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Τοπικές Προτάσεις & Καιρός Παραλιών</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Προτείνετε τα αγαπημένα σας εστιατόρια, καφέ και παραλίες. Έξυπνη σήμανση για απάνεμες παραλίες
                ανάλογα με τη διεύθυνση του ανέμου.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-200/60 bg-teal-50 text-teal-600">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">24/7 AI Concierge (Προαιρετικό)</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Ενεργοποιήστε τον ψηφιακό βοηθό τεχνητής νοημοσύνης που εκπαιδεύεται πάνω στις οδηγίες του σπιτιού
                σας και απαντά στους επισκέπτες οποιαδήποτε στιγμή.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-stone-900 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Αναβαθμίστε τη φιλοξενία του καταλύματός σας σήμερα.
          </h2>
          <p className="mt-4 text-sm text-stone-400 sm:text-base">
            Φτιάξτε τον οδηγό σας σε 3 λεπτά και προσφέρετε στους επισκέπτες σας μια 5-star εμπειρία διαμονής.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${TURQUOISE}, ${EMERALD})`,
                boxShadow: '0 16px 34px -12px rgba(0,168,150,0.55)',
              }}
            >
              <span>Ξεκινήστε Δωρεάν Τώρα</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 py-8 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} Hostkey. Όλα τα δικαιώματα διατηρούνται.</p>
      </footer>
    </div>
  );
}