'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Sparkles, Mail, Loader2, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';

const MASTER_ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'hostkey2026';

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'host_email' | 'master_pin'>('host_email');
  const [email, setEmail] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Master Admin Direct PIN Login (Για εσένα)
  const handleMasterPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (pinInput.trim() === MASTER_ADMIN_PIN) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hostkey_admin_auth', 'true');
        localStorage.setItem('hostkey_is_master', 'true');
      }
      router.push('/admin');
    } else {
      setErrorMsg('Λανθασμένος κωδικός Master Admin. Δοκιμάστε ξανά.');
    }
  };

  // 2. Host Email Magic Link Send (Για τους οικοδεσπότες)
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Παρακαλώ συμπληρώστε το email σας.');
      return;
    }

    setLoading(true);
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true,
      },
    });
    setLoading(false);

    if (error) {
      setErrorMsg(`Σφάλμα: ${error.message}`);
    } else {
      setEmailSent(true);
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
            {loginMode === 'master_pin' ? 'Master Admin Access' : 'Σύνδεση Οικοδεσπότη'}
          </h1>
          <p className="mt-1.5 text-xs text-stone-500">
            {loginMode === 'master_pin'
              ? 'Εισάγετε το Master PIN για άμεση πρόσβαση.'
              : 'Συμπληρώστε το email σας για να λάβετε σύνδεσμο άμεσης εισόδου.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMode('host_email');
              setErrorMsg('');
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
              loginMode === 'host_email' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Οικοδεσπότης (Email)
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('master_pin');
              setErrorMsg('');
            }}
            className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-2 text-xs font-bold transition-colors ${
              loginMode === 'master_pin' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="h-3 w-3" />
            <span>Master Admin</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MASTER ADMIN FORM */}
        {loginMode === 'master_pin' && (
          <form onSubmit={handleMasterPinLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-stone-500">Master Password / PIN</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3.5 text-sm tracking-widest text-stone-900 shadow-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-stone-800"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Άμεση Είσοδος Admin</span>
            </button>
          </form>
        )}

        {/* HOST EMAIL FORM */}
        {loginMode === 'host_email' && (
          <>
            {emailSent ? (
              <div className="mt-6 flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-base font-bold text-stone-900">Ελέγξτε το Email σας!</h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Σας στείλαμε έναν σύνδεσμο σύνδεσης στο <strong className="text-stone-900">{email}</strong>.
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  Πατήστε το κουμπί <strong>«Sign in»</strong> μέσα στο email για να μπείτε αυτόματα στο Admin Panel.
                </p>
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="mt-4 text-xs font-semibold text-stone-400 hover:text-stone-700"
                >
                  ← Αποστολή σε άλλο email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMagicLink} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-500">Email Οικοδεσπότη</label>
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
                  <span>{loading ? 'Αποστολή συνδέσμου…' : 'Συνέχεια με Email'}</span>
                </button>
              </form>
            )}
          </>
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