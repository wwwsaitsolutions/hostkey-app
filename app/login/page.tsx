'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Sparkles, Mail, KeyRound, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Αποστολή OTP κωδικού στο Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim()) {
      setErrorMsg('Παρακαλώ συμπληρώστε το email σας.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true, // Αν δεν υπάρχει, δημιουργείται αυτόματα νέος λογαριασμός
      },
    });
    setLoading(false);

    if (error) {
      setErrorMsg(`Σφάλμα: ${error.message}`);
    } else {
      setStep('otp');
      setSuccessMsg(`Σας στείλαμε έναν 6-ψήφιο κωδικό στο ${email}. Ελέγξτε τα εισερχόμενά σας (ή τα Spam).`);
    }
  };

  // 2. Επαλήθευση του 6-ψήφιου κωδικού OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpToken.trim(),
      type: 'email',
    });
    setLoading(false);

    if (error) {
      setErrorMsg('Ο κωδικός είναι λανθασμένος ή έχει λήξει. Δοκιμάστε ξανά.');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F4EC] p-6 text-stone-900">
      <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white p-8 shadow-xl shadow-stone-900/5">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
            <Sparkles className="h-7 w-7" />
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-stone-900">
            {step === 'email' ? 'Σύνδεση Οικοδεσπότη' : 'Εισαγωγή Κωδικού'}
          </h1>
          <p className="mt-1.5 text-xs text-stone-500">
            {step === 'email'
              ? 'Συμπληρώστε το email σας για να λάβετε τον κωδικό πρόσβασης.'
              : `Πληκτρολογήστε τον κωδικό που στάλθηκε στο ${email}`}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-stone-500">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-stone-900 shadow-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>{loading ? 'Αποστολή κωδικού…' : 'Συνέχεια με Email'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-stone-500">6-ψήφιος Κωδικός</label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3.5 text-center text-lg font-bold tracking-[0.3em] text-stone-900 shadow-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>{loading ? 'Επαλήθευση…' : 'Είσοδος στο Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtpToken('');
              }}
              className="mt-1 text-center text-xs font-semibold text-stone-400 hover:text-stone-700"
            >
              ← Αλλαγή email
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-stone-100 pt-4 text-center">
          <Link href="/" className="text-xs font-semibold text-stone-400 hover:text-stone-700">
            ← Επιστροφή στην Αρχική Hostkey
          </Link>
        </div>
      </div>
    </div>
  );
}