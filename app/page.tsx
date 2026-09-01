import Link from 'next/link';
import { 
  Sparkles, 
  Smartphone, 
  Wifi, 
  Compass, 
  LifeBuoy, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EC] text-stone-900 selection:bg-emerald-500/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-[#F7F4EC]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900">Hostkey</span>
              <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">GUIDEBOOK</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
            >
              Admin Portal
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700"
            >
              <span>Live Demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-20">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Next-Gen Digital Guest Experience
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl sm:leading-[1.15]">
            Ο Έξυπνος Ψηφιακός Οδηγός για τα Καταλύματά σας.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Αντικαταστήστε τα παλιά έντυπα εγχειρίδια με μια διαδραστική, πολυγλωσσική web εφαρμογή. Δώστε στους επισκέπτες σας άμεση πρόσβαση σε Wi-Fi, check-in οδηγίες, ψηφιακό manual και τοπικές προτάσεις.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/demo"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Δείτε το Live Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-7 py-3.5 text-sm font-bold text-stone-800 shadow-sm transition-all hover:bg-stone-50"
            >
              Διαχείριση Καταλυμάτων
            </Link>
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
              Προτείνετε τις καλύτερες παραλίες (με live ένδειξη προστασίας από τον άνεμο), σούπερ μάρκετ, ταβέρνες και ενοικιάσεις αυτοκινήτων.
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

        {/* Footer */}
        <footer className="mt-24 border-t border-stone-200/60 pt-8 text-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Hostkey. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}