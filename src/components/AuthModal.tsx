import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserPlus, X } from 'lucide-react';
import {
  confirmPhoneCode,
  createPhoneRecaptcha,
  loginWithEmail,
  registerWithEmail,
  sendPhoneCode,
} from '../lib/auth';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Method = 'email' | 'phone';

const messages: Record<string, string> = {
  'auth/invalid-credential': 'Email yoki parol noto\'g\'ri.',
  'auth/invalid-email': 'Email manzil noto\'g\'ri.',
  'auth/email-already-in-use': 'Bu email allaqachon ro\'yxatdan o\'tgan. Kirish bo\'limidan foydalaning.',
  'auth/weak-password': 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak.',
  'auth/too-many-requests': 'Juda ko\'p urinish bo\'ldi. Birozdan keyin qayta urinib ko\'ring.',
  'auth/network-request-failed': 'Internet ulanishini tekshiring.',
  'auth/credential-already-in-use': 'Bu email yoki telefon boshqa akkauntga tegishli.',
  'auth/invalid-phone-number': 'Telefon raqami noto\'g\'ri. Masalan: +998901234567',
  'auth/missing-phone-number': 'Telefon raqamini kiriting.',
  'auth/invalid-verification-code': 'SMS kodi noto\'g\'ri.',
  'auth/code-expired': 'SMS kodi muddati tugagan. Yangi kod so\'rang.',
  'auth/captcha-check-failed': 'Tasdiqlash oynasini bajarib, qayta urinib ko\'ring.',
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [method, setMethod] = useState<Method>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetPhone = () => {
    setConfirmation(null);
    setCode('');
    setError('');
  };

  const submitEmail = async (event: FormEvent) => {
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
      if (mode === 'register') await registerWithEmail(normalizedEmail, password);
      else await loginWithEmail(normalizedEmail, password);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(messages[err?.code] || 'Amalni bajarib bo\'lmadi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setError('Telefon raqamini xalqaro formatda kiriting. Masalan: +998901234567');
      return;
    }

    setLoading(true);
    try {
      if (!verifierRef.current) verifierRef.current = createPhoneRecaptcha('phone-recaptcha');
      const result = await sendPhoneCode(normalizedPhone, verifierRef.current);
      setConfirmation(result);
    } catch (err: any) {
      verifierRef.current?.clear();
      verifierRef.current = null;
      setError(messages[err?.code] || 'SMS kodini yuborib bo\'lmadi. Qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError('6 xonali SMS kodini kiriting.');
      return;
    }

    setLoading(true);
    try {
      await confirmPhoneCode(confirmation!, code.trim());
      setCode('');
      setConfirmation(null);
      onClose();
    } catch (err: any) {
      setError(messages[err?.code] || 'SMS kodi tasdiqlanmadi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black">OldiSotti ga kirish</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Email yoki telefon raqamingiz orqali kiring</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-5 pb-0">
          <button type="button" onClick={() => { setMethod('email'); setError(''); }} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black ${method === 'email' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Mail size={16} /> Email</button>
          <button type="button" onClick={() => { setMethod('phone'); setError(''); }} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-black ${method === 'phone' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}><Phone size={16} /> Telefon</button>
        </div>

        {method === 'email' ? (
          <form onSubmit={submitEmail} className="space-y-4 p-5">
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Email</span><div className="relative"><Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sizning@email.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800" /></div></label>
            <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Parol</span><div className="relative"><LockKeyhole size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kamida 6 ta belgi" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800" /><button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">{mode === 'register' && <UserPlus size={17} />}{loading ? 'Kutilmoqda…' : mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}</button>
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">{mode === 'login' ? 'Akkauntingiz yo\'qmi?' : 'Akkauntingiz bormi?'}{' '}<button type="button" onClick={() => { setMode((v) => v === 'login' ? 'register' : 'login'); setError(''); }} className="font-black text-indigo-600 hover:underline">{mode === 'login' ? "Ro'yxatdan o'tish" : 'Kirish'}</button></div>
          </form>
        ) : (
          <form onSubmit={confirmation ? verifyCode : sendCode} className="space-y-4 p-5">
            {!confirmation ? (
              <>
                <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">Telefon raqami</span><div className="relative"><Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800" /></div></label>
                <p className="text-xs text-slate-500 dark:text-slate-400">SMS orqali 6 xonali tasdiqlash kodi yuboriladi.</p>
              </>
            ) : (
              <><div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800">Kod <b>{phone}</b> raqamiga yuborildi.</div><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-300">SMS kodi</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-center text-lg font-black tracking-[0.4em] outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800" /></label><button type="button" onClick={resetPhone} className="text-xs font-bold text-indigo-600">Raqamni o'zgartirish</button></>
            )}
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>}
            <div id="phone-recaptcha" />
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">{loading ? 'Kutilmoqda…' : confirmation ? 'Tasdiqlash' : 'SMS kod yuborish'}</button>
          </form>
        )}
      </div>
    </div>
  );
};
