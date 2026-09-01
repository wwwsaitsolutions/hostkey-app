import Link from 'next/link';
import { 
  Sparkles, 
  Smartphone, 
  Wifi, 
  Compass, 
  LifeBuoy, 
  KeyRound, 
  ArrowRight, 
  Globe,
  Lock,
  CheckCircle2,
  Bot,
  Percent,
} from 'lucide-react';

/* Custom Logo Icon: House + Smart Key */
function HostkeyLogoIcon() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 text-white shadow-md shadow-emerald-700/20 border-t border-white/30">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-white/20" />
      <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z" />
        <circle cx="12" cy="11" r="2" fill="currentColor" stroke="none" />
        <path d="M12 13v4" strokeWidth="2.4" />
        <path d="M12 15h2" strokeWidth="2" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EC] text-stone-900 selection:bg-emerald-500/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-[#F7F4EC]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-95">
            <HostkeyLogoIcon />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-stone-900">
                  Host<span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">key</span>
                </span>
                <span className="rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-800">
                  FREE
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wide text-stone-400 -mt-1">Digital Guest Guidebook</span>
            </div>
          </Link>

          {/* Top Admin Action */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
            >
              <Lock className="h-3.5 w-3.5 text-stone-400" />
              <span>Σύνδεση Οικοδεσπότη</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            100% Δωρεάν για όλους τους Οικοδεσπότες
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.15]">
            Ο Έξυπνος Ψηφιακός Οδηγός για τα Καταλύματά σας.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Αναβαθμίστε την εμπειρία των επισκεπτών σας με μια σύγχρονη, διαδραστική εφαρμογή στο κινητό τους. Οδηγίες check-in, Wi-Fi, ψηφιακό manual και τοπικές προτάσεις — <strong className="text-stone-900 font-semibold">εντελώς δωρεάν, χωρίς κρυφές χρεώσεις.</strong>
          </p>

          {/* Action CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
            >
              <span>Δημιουργήστε Δωρεάν Οδηγό</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-7 py-4 text-sm font-bold text-stone-800 shadow-sm transition-all hover:bg-stone-50"
            >
              <span>Δείτε το Live Demo</span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Χωρίς πιστωτική κάρτα</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Έτοιμο σε 3 λεπτά</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Εγκατάσταση PWA στο κινητό</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900">Self Check-in & Smart Lock</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Ο επισκέπτης βλέπει με ένα κλικ τον κωδικό της κλειδαριάς, φωτογραφίες εισόδου και αναλυτικά βήματα άφιξης χωρίς να χρειάζεται να σας καλεί.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Wifi className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900">1-Tap Wi-Fi & QR Code</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Αυτόματη αντιγραφή κωδικού ή άμεση σύνδεση στο Wi-Fi σκανάροντας το ενσωματωμένο QR code μέσα από την οθόνη.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900">Αυτόματη Μετάφραση (4 Γλώσσες)</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Γράφετε μόνο στα ελληνικά και το σύστημα μεταφράζει αυτόματα όλες τις οδηγίες σε Αγγλικά, Γαλλικά και Γερμανικά.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900">Τοπικός Οδηγός & Πρόγνωση Ανέμου</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Προτείνετε τις καλύτερες παραλίες (με live ένδειξη προστασίας από τον άνεμο), σούπερ μάρκετ, ταβέρνες και σημεία ενδιαφέροντος.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900">Έκτακτη Ανάγκη & Φαρμακεία</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Άμεση κλήση σε νοσοκομεία, αστυνομία, διανυκτερεύοντα φαρμακεία και απευθείας επικοινωνία με τον οικοδεσπότη μέσω WhatsApp ή τηλεφώνου.
            </p>
          </div>

          <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-900/5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900">PWA — Εγκατάσταση στο Κινητό</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Ο επισκέπτης μπορεί να το αποθηκεύσει στην αρχική οθόνη του κινητού του χωρίς να κατεβάσει καμία εφαρμογή από το App Store.
            </p>
          </div>
        </div>

        {/* Free Forever Banner */}
        <div className="mt-20 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/50 p-8 sm:p-12 text-center shadow-sm">
          <h2 className="text-2xl font-black text-stone-900 sm:text-3xl">Όλα όσα χρειάζεστε, εντελώς Δωρεάν.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">
            Δημιουργήστε τον ψηφιακό οδηγό του καταλύματός σας σήμερα. Μοιραστείτε το link ή το QR code με τους επισκέπτες σας και προσφέρετε μια premium εμπειρία διαμονής.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700"
            >
              <span>Ξεκινήστε Δωρεάν Τώρα</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-stone-200/60 pt-8 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Hostkey. All rights reserved. Powered by Hostkey.</p>
        </footer>
      </main>
    </div>
  );
}