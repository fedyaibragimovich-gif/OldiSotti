import React, { FormEvent, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserPlus, X } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const messages: Record<string, string> = {
  'auth/invalid-credential': "Email yoki parol noto'g'ri.",
  'auth/invalid-email': "Email manzil noto'g'ri.",
  'auth/email-already-in-use': "Bu email allaqachon ro'yxatdan o'tgan. Kirish bo'limidan foydalaning.",
  'auth/weak-password': "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
  'auth/too-many-requests': "Juda ko'p urinish bo'ldi. Birozdan keyin qayta urinib ko'ring.",
  'auth/network-request-failed': "Internet ulanishini tekshiring.",
  'auth/credential-already-in-use': "Bu email boshqa akkauntga tegishli. Kirish orqali davom eting."
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Email va parolni kiriting.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(normalizedEmail, password);
      } else {
        await loginWithEmail(normalizedEmail, password);
      }
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(messages[err?.code] || 'Amalni bajarib bo\'lmadi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black">{mode === 'login' ? 'OldiSotti ga kirish' : "Ro'yxatdan o'tish"}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Eʼlonlaringiz va profilingizga kiring' : 'Akkauntingizni yarating va eʼlonlaringizni saqlang'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Email</span>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sizning@email.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Parol</span>
            <div className="relative">
              <LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === 'register' && <UserPlus size={17} />}
            {loading ? 'Kutilmoqda…' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </button>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' ? 'Akkauntingiz yo\'qmi?' : 'Akkauntingiz bormi?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode((v) => (v === 'login' ? 'register' : 'login'));
                setError('');
              }}
              className="font-black text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {mode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
