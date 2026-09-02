'use client';

import Link from 'next/link';
import {
  Sparkles,
  KeyRound,
  Wifi,
  Languages,
  BookOpen,
  MapPin,
  Bot,
  ArrowRight,
  Eye,
  Send,
  QrCode,
  Smartphone,
  CheckCircle2,
  Tv,
  Compass,
  Utensils,
  Sun,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const highlights = [
    { icon: KeyRound, label: 'Αυτόνομο Self Check-in & Κωδικοί' },
    { icon: Tv, label: 'Οδηγίες Συσκευών & Φωτογραφίες Manual' },
    { icon: Sun, label: 'Προτάσεις για Παραλίες & Καιρός' },
    { icon: Utensils, label: 'Επιλεγμένες Ταβέρνες, Μπαρ & Αξιοθέατα' },
    { icon: Wifi, label: 'Wi-Fi με 1 Κλικ ή QR Code' },
    { icon: Languages, label: 'Αυτόματη Μετάφραση σε 4 Γλώσσες' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EC] text-stone-900 selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#F7F4EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-700/20">
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
      <section className="relative px-6 pt-12 pb-16 text-center sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Η απόλυτη εμπειρία φιλοξενίας για καταλύματα & βίλες</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-stone-900 sm:text-6xl sm:leading-[1.12]">
            Ο Έξυπνος Ψηφιακός Οδηγός για τα Καταλύματά σας.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-stone-600 sm:text-lg">
            Αναβαθμίστε την εμπειρία των επισκεπτών σας με μια σύγχρονη, διαδραστική εφαρμογή στο κινητό τους.
            Όλες οι πληροφορίες του σπιτιού συγκεντρωμένες σε ένα σημείο — καθαρά, εύκολα και αυτόματα μεταφρασμένες.
          </p>

          {/* Feature Highlights / Pin points */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
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

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-emerald-700/25 transition-all hover:bg-emerald-700 hover:shadow-xl"
            >
              <span>Δημιουργήστε Δωρεάν Οδηγό</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/demo-luxury-suite"
              target="_blank"
              className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-6 py-4 text-base font-bold text-stone-800 shadow-sm transition hover:bg-stone-50"
            >
              <Eye className="h-4 w-4 text-stone-500" />
              <span>Δείτε το Live Demo</span>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-stone-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Έτοιμο σε 3 λεπτά
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Εγκατάσταση PWA στο κινητό χωρίς App Store
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Άμεση λειτουργία σε κάθε συσκευή
            </span>
          </div>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <Send className="h-6 w-6" />
                </div>
                <span className="mt-6 inline-block rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase text-emerald-800">
                  Πριν την Άφιξη
                </span>
                <h3 className="mt-3 text-xl font-bold text-stone-900">Αποστολή ως Σύνδεσμος (Link)</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Στείλτε το μοναδικό link του διαμερίσματός σας (π.χ. <span className="font-mono text-xs font-semibold text-emerald-700">hostkey.gr/to-spiti-sas</span>) 
                  μέσω Airbnb, Booking, WhatsApp ή SMS. Ο επισκέπτης βρίσκει οδηγίες άφιξης, τοποθεσία στο Google Maps και κωδικούς πριν καν ξεκινήσει το ταξίδι του.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-3.5 text-xs text-stone-500">
                💬 <em>«Γεια σας! Εδώ θα βρείτε τον ψηφιακό οδηγό του σπιτιού με κωδικούς check-in και Wi-Fi: hostkey.gr/...»</em>
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
                  Εκτυπώστε το αυτόματο QR Code ή τοποθετήστε ένα καλαίσθητο σταντ στην είσοδο ή στο σαλόνι. 
                  Ο επισκέπτης απλώς σκανάρει το QR με την κάμερα ή ακουμπάει το κινητό του (NFC) και ο οδηγός ανοίγει άμεσα στην οθόνη του.
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
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Self Check-in & Smart Lock</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Κωδικοί κλειδοθήκης με ασφαλές κουμπί εμφάνισης/απόκρυψης, αναλυτικά βήματα εισόδου και οδηγίες άφιξης οποιαδήποτε ώρα.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/60">
                <Wifi className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">1-Tap Wi-Fi & QR Connect</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Αντιγραφή κωδικού με ένα άγγιγμα ή σκανάρισμα του ενσωματωμένου QR Code για άμεση σύνδεση στο δίκτυο του σπιτιού.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                <Languages className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Αυτόματη Μετάφραση σε 4 Γλώσσες</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Γράφετε μόνο μία φορά στα ελληνικά και με το μαγικό κουμπί το σύστημα μεταφράζει αυτόματα σε Αγγλικά, Γαλλικά και Γερμανικά.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Οδηγός Σπιτιού & Φωτογραφίες Συσκευών</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Ανεβάστε φωτογραφίες με τις ρυθμίσεις του A/C, του θερμοσίφωνα, του πλυντηρίου και της TV ώστε ο επισκέπτης να καταλαβαίνει αμέσως τη λειτουργία τους.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">Τοπικές Προτάσεις & Καιρός Παραλιών</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Προτείνετε τα αγαπημένα σας εστιατόρια, καφέ και παραλίες. Έξυπνη σήμανση για απάνεμες παραλίες ανάλογα με τη διεύθυνση του ανέμου.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-7 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/60">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-bold text-stone-900">24/7 AI Concierge (Προαιρετικό)</h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                Ενεργοποιήστε τον ψηφιακό βοηθό τεχνητής νοημοσύνης που εκπαιδεύεται πάνω στις οδηγίες του σπιτιού σας και απαντά στους επισκέπτες οποιαδήποτε στιγμή.
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
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500"
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