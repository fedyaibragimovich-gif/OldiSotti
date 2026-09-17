import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Chrome,
  AlertCircle,
  Sparkles,
  LogIn,
  UserPlus,
  Phone,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { Language } from '../types';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
  sendPhoneVerificationCode,
  confirmPhoneVerificationCode,
  clearRecaptcha,
  ConfirmationResult
} from '../lib/auth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialMode?: 'login' | 'register';
  reasonMessage?: string | null;
  onSuccess?: () => void;
}

const REMEMBERED_EMAIL_KEY = 'oldisotti_remembered_email';
const REMEMBERED_PHONE_KEY = 'oldisotti_remembered_phone';

// Format 9-digit input as: (90) 123-45-67
const formatUzbekPhone = (val: string): string => {
  let cleaned = val.replace(/\D/g, '');
  if (cleaned.startsWith('998')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.length > 9) {
    cleaned = cleaned.slice(0, 9);
  }

  if (cleaned.length === 0) return '';
  if (cleaned.length <= 2) return `(${cleaned}`;
  if (cleaned.length <= 5) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}-${cleaned.slice(7, 9)}`;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  reasonMessage,
  onSuccess
}) => {
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [authLoading, setAuthLoading] = useState(false);
  const authInFlight = useRef(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);

  // Phone Auth State
  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [rawPhone, setRawPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setAuthError('');
      setForgotMessage('');
      setPassword('');
      setPhoneStep('enter_phone');
      setConfirmationResult(null);
      setOtpCode('');
      try {
        const savedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (savedEmail) setEmail(savedEmail);
        const savedPhone = window.localStorage.getItem(REMEMBERED_PHONE_KEY);
        if (savedPhone) setRawPhone(formatUzbekPhone(savedPhone));
      } catch {
        // LocalStorage may be unavailable
      }
    } else {
      clearRecaptcha();
    }
  }, [isOpen, initialMode]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus OTP input on step change
  useEffect(() => {
    if (phoneStep === 'enter_otp') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [phoneStep]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !authLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, authLoading, onClose]);

  if (!isOpen) return null;

  const labels = {
    uz: {
      phoneTab: 'Telefon',
      emailTab: 'Email',
      login: 'Kirish',
      register: "Ro'yxatdan o'tish",
      subTitle: 'OldiSotdi akkauntingiz',
      phoneSubtitle: 'SMS orqali xavfsiz va tez kirish',
      phoneLabel: 'Telefon raqamingiz',
      phonePlaceholder: '(90) 123-45-67',
      sendCodeBtn: 'SMS kod olish',
      sendingCode: 'SMS yuborilmoqda…',
      otpTitle: 'SMS kodni kiriting',
      otpSubtitle: 'raqamiga yuborilgan 6 xonali tasdiqlash kodini kiriting',
      otpPlaceholder: '• • • • • •',
      verifyBtn: 'Tasdiqlash va kirish',
      verifying: 'Tekshirilmoqda…',
      resendCode: 'Kodni qayta yuborish',
      resendIn: (sec: number) => `Qayta yuborish: ${sec}s`,
      changeNumber: "Raqamni o'zgartirish",
      phoneHelpText: "Raqamingizga bepul tasdiqlash kodi yuboriladi.",
      emailPlaceholder: 'Email manzilingiz',
      passwordPlaceholder: 'Parol (kamida 6 ta belgi)',
      rememberMe: 'Emailni eslab qolish',
      forgotPassword: 'Parolni unutdingizmi?',
      or: 'yoki',
      googleBtn: 'Google bilan davom etish',
      browserNotice: 'Kirganingizdan so‘ng barcha eʼlonlaringiz va yozishmalaringiz saqlanadi.',
      switchToRegister: "Akkauntingiz yo'qmi? Ro'yxatdan o'ting",
      switchToLogin: 'Akkauntingiz bormi? Tizimga kiring',
      sending: 'Yuborilmoqda…',
      loading: 'Kutilmoqda…'
    },
    ru: {
      phoneTab: 'Телефон',
      emailTab: 'Email',
      login: 'Войти',
      register: 'Регистрация',
      subTitle: 'Добро пожаловать в OldiSotdi',
      phoneSubtitle: 'Быстрый и безопасный вход по SMS',
      phoneLabel: 'Номер телефона',
      phonePlaceholder: '(90) 123-45-67',
      sendCodeBtn: 'Получить SMS-код',
      sendingCode: 'Отправка SMS…',
      otpTitle: 'Введите SMS-код',
      otpSubtitle: 'введите 6-значный проверочный код, отправленный на номер',
      otpPlaceholder: '• • • • • •',
      verifyBtn: 'Подтвердить и войти',
      verifying: 'Проверка…',
      resendCode: 'Отправить код повторно',
      resendIn: (sec: number) => `Повторно через: ${sec}с`,
      changeNumber: 'Изменить номер',
      phoneHelpText: 'На ваш номер поступит бесплатный проверочный SMS-код.',
      emailPlaceholder: 'Ваш email',
      passwordPlaceholder: 'Пароль (минимум 6 символов)',
      rememberMe: 'Запомнить email',
      forgotPassword: 'Забыли пароль?',
      or: 'или',
      googleBtn: 'Продолжить с Google',
      browserNotice: 'После входа все ваши объявления и переписки будут сохранены.',
      switchToRegister: 'Нет аккаунта? Зарегистрируйтесь',
      switchToLogin: 'Уже есть аккаунт? Войдите',
      sending: 'Отправка…',
      loading: 'Подождите…'
    },
    oz: {
      phoneTab: 'Телефон',
      emailTab: 'Email',
      login: 'Кириш',
      register: 'Рўйхатдан ўтиш',
      subTitle: 'OldiSotdi платформасига хуш келибсиз',
      phoneSubtitle: 'SMS орқали хавфсиз ва тез кириш',
      phoneLabel: 'Телефон рақамингиз',
      phonePlaceholder: '(90) 123-45-67',
      sendCodeBtn: 'SMS код олиш',
      sendingCode: 'SMS юборилмоқда…',
      otpTitle: 'SMS кодни киритинг',
      otpSubtitle: 'рақамига юборилган 6 хонали тасдиқлаш кодини киритинг',
      otpPlaceholder: '• • • • • •',
      verifyBtn: 'Тасдиқлаш ва кириш',
      verifying: 'Текширилмоқда…',
      resendCode: 'Кодни қайта юбориш',
      resendIn: (sec: number) => `Қайта юбориш: ${sec}с`,
      changeNumber: 'Рақамни ўзгартириш',
      phoneHelpText: 'Рақамингизга бепул тасдиқлаш коди юборилади.',
      emailPlaceholder: 'Email манзилингиз',
      passwordPlaceholder: 'Парол (камида 6 та белги)',
      rememberMe: 'Emailни эслаб қолиш',
      forgotPassword: 'Паролни унутдингизми?',
      or: 'ёки',
      googleBtn: 'Google билан давом этиш',
      browserNotice: 'Кирганингиздан сўнг барча эълонларингиз ва ёзишмаларингиз сақланади.',
      switchToRegister: 'Аккаунтингиз йўқми? Рўйхатдан ўтинг',
      switchToLogin: 'Аккаунтингиз борми? Тизимга киринг',
      sending: 'Юборилмоқда…',
      loading: 'Кутилмоқда…'
    }
  }[lang] || {
    phoneTab: 'Telefon',
    emailTab: 'Email',
    login: 'Kirish',
    register: "Ro'yxatdan o'tish",
    subTitle: 'OldiSotdi platformasiga xush kelibsiz',
    phoneSubtitle: 'SMS orqali xavfsiz va tez kirish',
    phoneLabel: 'Telefon raqamingiz',
    phonePlaceholder: '(90) 123-45-67',
    sendCodeBtn: 'SMS kod olish',
    sendingCode: 'SMS yuborilmoqda…',
    otpTitle: 'SMS kodni kiriting',
    otpSubtitle: 'raqamiga yuborilgan 6 xonali tasdiqlash kodini kiriting',
    otpPlaceholder: '• • • • • •',
    verifyBtn: 'Tasdiqlash va kirish',
    verifying: 'Tekshirilmoqda…',
    resendCode: 'Kodni qayta yuborish',
    resendIn: (sec: number) => `Qayta yuborish: ${sec}s`,
    changeNumber: "Raqamni o'zgartirish",
    phoneHelpText: "Raqamingizga bepul tasdiqlash kodi yuboriladi.",
    emailPlaceholder: 'Email manzilingiz',
    passwordPlaceholder: 'Parol (kamida 6 ta belgi)',
    rememberMe: 'Emailni eslab qolish',
    forgotPassword: 'Parolni unutdingizmi?',
    or: 'yoki',
    googleBtn: 'Google bilan davom etish',
    browserNotice: 'Kirganingizdan so‘ng barcha eʼlonlaringiz va yozishmalaringiz saqlanadi.',
    switchToRegister: "Akkauntingiz yo'qmi? Ro'yxatdan o'ting",
    switchToLogin: 'Akkauntingiz bormi? Tizimga kiring',
    sending: 'Yuborilmoqda…',
    loading: 'Kutilmoqda…'
  };

  const friendlyAuthError = (error: any) => {
    const code = error?.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return lang === 'ru' ? 'Неверный email или пароль.' : 'Email yoki parol noto‘g‘ri.';
    }
    if (code.includes('email-already-in-use')) {
      return lang === 'ru' ? 'Этот email уже зарегистрирован.' : 'Bu email allaqachon ro‘yxatdan o‘tgan.';
    }
    if (code.includes('weak-password')) {
      return lang === 'ru' ? 'Пароль должен содержать не менее 6 символов.' : 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.';
    }
    if (code.includes('invalid-email')) {
      return lang === 'ru' ? 'Проверьте правильность email адреса.' : 'Email manzilini tekshiring.';
    }
    if (code.includes('invalid-phone-number')) {
      return lang === 'ru' ? 'Неверный номер телефона. Проверьте 9-значный номер.' : 'Telefon raqami noto‘g‘ri kiritildi. 9 xonali raqamni tekshiring.';
    }
    if (code.includes('missing-phone-number')) {
      return lang === 'ru' ? 'Введите номер телефона.' : 'Telefon raqamingizni kiriting.';
    }
    if (code.includes('quota-exceeded')) {
      return lang === 'ru' ? 'Лимит SMS исчерпан. Пожалуйста, войдите через Email или Google.' : 'SMS yuborish limiti tugadi. Iltimos, Email yoki Google orqali kiring.';
    }
    if (code.includes('invalid-verification-code')) {
      return lang === 'ru' ? 'Неверный SMS-код подтверждения.' : 'SMS tasdiqlash kodi noto‘g‘ri. Qayta tekshiring.';
    }
    if (code.includes('code-expired')) {
      return lang === 'ru' ? 'Срок действия кода истек. Запросите новый код.' : 'Tasdiqlash kodining muddati tugagan. Yangi kod so‘rang.';
    }
    if (code.includes('captcha-check-failed')) {
      return lang === 'ru' ? 'Проверка безопасности reCAPTCHA не пройдена. Попробуйте еще раз.' : 'Xavfsizlik tekshiruvi (reCAPTCHA) o‘tmadi. Qayta urinib ko‘ring.';
    }
    if (code.includes('popup-blocked')) {
      return lang === 'ru' ? 'Окно Google заблокировано браузером. Разрешите всплывающие окна.' : 'Google oynasi bloklandi. Brauzerda popup oynalarga ruxsat bering va qayta bosing.';
    }
    if (code.includes('unauthorized-domain')) {
      return lang === 'ru' ? 'Этот домен не авторизован для входа.' : 'Bu sayt manzilida avtorizatsiyaga ruxsat berilmagan.';
    }
    if (code.includes('operation-not-allowed')) {
      return lang === 'ru' ? 'Вход по телефону пока отключен в настройках. Войдите через Email или Google.' : 'Telefon orqali kirish hozir sozlanmagan. Email yoki Google orqali kiring.';
    }
    if (code.includes('operation-not-supported') || code.includes('web-storage-unsupported')) {
      return lang === 'ru' ? 'Попробуйте открыть сайт в Chrome или Safari.' : 'Saytni Chrome yoki Safari brauzerida ochib qayta urinib ko‘ring.';
    }
    if (code.includes('network-request-failed')) {
      return lang === 'ru' ? 'Проверьте подключение к интернету.' : 'Internet aloqasini tekshiring va qayta urinib ko‘ring.';
    }
    if (code.includes('account-exists-with-different-credential')) {
      return lang === 'ru' ? 'Этот аккаунт уже зарегистрирован другим способом.' : 'Bu akkaunt boshqa usul bilan ro‘yxatdan o‘tgan.';
    }
    if (code.includes('too-many-requests')) {
      return lang === 'ru' ? 'Слишком много попыток. Пожалуйста, подождите немного.' : 'Juda ko‘p urinish bo‘ldi. Biroz kuting va qayta urinib ko‘ring.';
    }
    if (code.includes('popup-closed')) {
      return lang === 'ru' ? 'Окно входа Google было закрыто.' : 'Google oynasi yopildi.';
    }
    return lang === 'ru' ? 'Произошла ошибка при входе. Попробуйте еще раз.' : 'Kirishda xatolik yuz berdi. Qayta urinib ko‘ring.';
  };

  // Handle Phone: Send OTP Code
  const handleSendOtp = async (e?: React.FormEvent, isResend = false) => {
    if (e) e.preventDefault();
    if (authInFlight.current) return;

    const digits = rawPhone.replace(/\D/g, '');
    let fullE164 = '';
    if (digits.length === 9) {
      fullE164 = `+998${digits}`;
    } else if (digits.length === 12 && digits.startsWith('998')) {
      fullE164 = `+${digits}`;
    } else {
      setAuthError(lang === 'ru' ? 'Введите 9 цифр номера (например: 90 123 45 67).' : 'To‘liq 9 xonali telefon raqamingizni kiriting (masalan: 90 123 45 67).');
      return;
    }

    authInFlight.current = true;
    setAuthLoading(true);
    setAuthError('');
    setForgotMessage('');
    try {
      try {
        window.localStorage.setItem(REMEMBERED_PHONE_KEY, digits.slice(-9));
      } catch {
        // ignore
      }

      const confirmation = await sendPhoneVerificationCode(fullE164, 'recaptcha-container');
      setConfirmationResult(confirmation);
      setPhoneStep('enter_otp');
      setCountdown(60);
      if (isResend) {
        setForgotMessage(lang === 'ru' ? 'Новый SMS-код отправлен!' : 'Yangi SMS-kod yuborildi!');
      }
    } catch (error: any) {
      setAuthError(friendlyAuthError(error));
      clearRecaptcha();
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  // Handle Phone: Verify OTP Code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (authInFlight.current) return;

    const cleanOtp = otpCode.replace(/\D/g, '').trim();
    if (cleanOtp.length < 6) {
      setAuthError(lang === 'ru' ? 'Введите 6-значный SMS-код.' : 'SMS orqali yuborilgan 6 xonali kodni kiriting.');
      return;
    }

    if (!confirmationResult) {
      setAuthError(lang === 'ru' ? 'Сессия истекла. Запросите код заново.' : 'Sessiya tugadi. Kodni qayta so‘rang.');
      setPhoneStep('enter_phone');
      return;
    }

    authInFlight.current = true;
    setAuthLoading(true);
    setAuthError('');
    try {
      await confirmPhoneVerificationCode(confirmationResult, cleanOtp);
      clearRecaptcha();
      setConfirmationResult(null);
      setOtpCode('');
      onClose();
      onSuccess?.();
    } catch (error: any) {
      setAuthError(friendlyAuthError(error));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  // Switch back to change phone number
  const handleChangeNumber = () => {
    setPhoneStep('enter_phone');
    setConfirmationResult(null);
    setOtpCode('');
    setAuthError('');
    setForgotMessage('');
    clearRecaptcha();
  };

  // Handle Email Auth
  const submitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthLoading(true);
    setAuthError('');
    setForgotMessage('');
    const normalizedEmail = email.trim();
    try {
      if (authMode === 'login') {
        if (rememberEmail) {
          try { window.localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail); } catch { /* ignore */ }
        } else {
          try { window.localStorage.removeItem(REMEMBERED_EMAIL_KEY); } catch { /* ignore */ }
        }
        await loginWithEmail(normalizedEmail, password);
      } else {
        await registerWithEmail(normalizedEmail, password);
      }
      setPassword('');
      onClose();
      onSuccess?.();
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (authInFlight.current) return;
    const normalizedEmail = email.trim();
    setAuthError('');
    setForgotMessage('');
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setAuthError(lang === 'ru' ? 'Сначала введите корректный email.' : 'Avval to‘g‘ri email manzilingizni kiriting.');
      return;
    }
    authInFlight.current = true;
    setForgotLoading(true);
    try {
      await resetPassword(normalizedEmail);
      setForgotMessage(lang === 'ru' ? 'Ссылка для сброса пароля отправлена на ваш email.' : 'Parolni tiklash havolasi emailingizga yuborildi. Emailingizni tekshiring.');
    } catch (error: any) {
      const code = error?.code || '';
      if (code.includes('too-many-requests')) {
        setAuthError(lang === 'ru' ? 'Слишком много попыток. Пожалуйста, подождите.' : 'Juda ko‘p urinish bo‘ldi. Birozdan keyin qayta urinib ko‘ring.');
      } else if (code.includes('invalid-email')) {
        setAuthError(lang === 'ru' ? 'Проверьте правильность email.' : 'Email manzilini tekshiring.');
      } else {
        setAuthError(lang === 'ru' ? 'Ошибка при сбросе пароля.' : 'Parolni tiklashda xatolik yuz berdi. Qayta urinib ko‘ring.');
      }
    } finally {
      authInFlight.current = false;
      setForgotLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthLoading(true);
    setAuthError('');
    setForgotMessage('');
    try {
      await loginWithGoogle();
      onClose();
      onSuccess?.();
    } catch (error) {
      setAuthError(friendlyAuthError(error));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !authLoading) onClose();
      }}
    >
      <div
        id="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white relative animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                {authMethod === 'phone' ? (
                  <Smartphone size={18} />
                ) : authMode === 'login' ? (
                  <LogIn size={18} />
                ) : (
                  <UserPlus size={18} />
                )}
              </div>
              <h3 id="auth-modal-title" className="text-xl font-black tracking-tight">
                {authMethod === 'phone'
                  ? (phoneStep === 'enter_otp' ? labels.otpTitle : labels.phoneTab)
                  : (authMode === 'login' ? labels.login : labels.register)}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {authMethod === 'phone' ? labels.phoneSubtitle : labels.subTitle}
            </p>
          </div>
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={onClose}
            disabled={authLoading}
            className="p-2 -mr-1 -mt-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reason Message */}
        {reasonMessage && (
          <div
            id="auth-modal-reason-banner"
            className="mb-3.5 flex items-start gap-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 p-3 text-xs font-semibold text-amber-900 dark:text-amber-200"
          >
            <Sparkles size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>{reasonMessage}</span>
          </div>
        )}

        {/* Auth Method Tabs: Telefon vs Email */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-4 border border-slate-200/60 dark:border-slate-700/60">
          <button
            id="auth-tab-phone-btn"
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setAuthError('');
              setForgotMessage('');
            }}
            disabled={authLoading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'phone'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Phone size={14} />
            <span>{labels.phoneTab}</span>
          </button>
          <button
            id="auth-tab-email-btn"
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setAuthError('');
              setForgotMessage('');
            }}
            disabled={authLoading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'email'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Mail size={14} />
            <span>{labels.emailTab}</span>
          </button>
        </div>

        {/* PHONE AUTH FLOW */}
        {authMethod === 'phone' && (
          <div>
            {phoneStep === 'enter_phone' ? (
              <form onSubmit={(e) => handleSendOtp(e)} className="space-y-3">
                <div>
                  <label htmlFor="auth-phone-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {labels.phoneLabel}
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <div className="flex items-center gap-1.5 pl-3 pr-2 py-2.5 sm:py-3 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 select-none shrink-0">
                      <span>🇺🇿</span>
                      <span>+998</span>
                    </div>
                    <input
                      id="auth-phone-input"
                      type="tel"
                      autoFocus
                      required
                      placeholder={labels.phonePlaceholder}
                      value={rawPhone}
                      onChange={(e) => {
                        setRawPhone(formatUzbekPhone(e.target.value));
                        setAuthError('');
                        setForgotMessage('');
                      }}
                      className="w-full bg-transparent px-3 py-2.5 sm:py-3 text-sm sm:text-base font-semibold tracking-wide outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    {labels.phoneHelpText}
                  </p>
                </div>

                {authError && (
                  <div
                    id="auth-phone-error-box"
                    className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Invisible reCAPTCHA container */}
                <div id="recaptcha-container" className="flex justify-center" />

                <button
                  id="auth-phone-submit-btn"
                  disabled={authLoading}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {authLoading ? (
                    <>
                      <RotateCw size={16} className="animate-spin" />
                      <span>{labels.sendingCode}</span>
                    </>
                  ) : (
                    <span>{labels.sendCodeBtn}</span>
                  )}
                </button>
              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={(e) => handleVerifyOtp(e)} className="space-y-3.5">
                <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-3 text-center">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">
                      +998 {rawPhone || 'raqamiga'}
                    </span>{' '}
                    {labels.otpSubtitle}
                  </p>
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    disabled={authLoading}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    <span>{labels.changeNumber}</span>
                  </button>
                </div>

                <div>
                  <input
                    ref={otpInputRef}
                    id="auth-otp-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder={labels.otpPlaceholder}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      setAuthError('');
                    }}
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 text-slate-900 dark:text-white"
                  />
                </div>

                {authError && (
                  <div
                    id="auth-otp-error-box"
                    className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {forgotMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{forgotMessage}</span>
                  </div>
                )}

                <button
                  id="auth-otp-verify-btn"
                  disabled={authLoading || otpCode.replace(/\D/g, '').length < 6}
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {authLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <RotateCw size={16} className="animate-spin" />
                      {labels.verifying}
                    </span>
                  ) : (
                    labels.verifyBtn
                  )}
                </button>

                <div className="text-center pt-1">
                  {countdown > 0 ? (
                    <p className="text-xs text-slate-400 font-semibold">
                      {labels.resendIn(countdown)}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(undefined, true)}
                      disabled={authLoading}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {labels.resendCode}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* EMAIL AUTH FLOW */}
        {authMethod === 'email' && (
          <form onSubmit={submitAuth} className="space-y-3" autoComplete="on">
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-email-input"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setForgotMessage(''); }}
                aria-label="Email"
                type="email"
                name="email"
                autoComplete="username email"
                required
                placeholder={labels.emailPlaceholder}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-2.5 sm:py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
              />
            </div>

            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label={labels.passwordPlaceholder}
                type="password"
                name="password"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                placeholder={labels.passwordPlaceholder}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-2.5 sm:py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
              />
            </div>

            {authMode === 'login' && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    id="auth-remember-checkbox"
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>{labels.rememberMe}</span>
                </label>
                <button
                  id="auth-forgot-password-btn"
                  disabled={authLoading || forgotLoading}
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-60 cursor-pointer"
                >
                  {forgotLoading ? labels.sending : labels.forgotPassword}
                </button>
              </div>
            )}

            {authError && (
              <div
                id="auth-email-error-box"
                className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {forgotMessage && (
              <div
                id="auth-email-success-box"
                className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                {forgotMessage}
              </div>
            )}

            <button
              id="auth-submit-btn"
              disabled={authLoading || forgotLoading}
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {authLoading ? labels.loading : (authMode === 'login' ? labels.login : labels.register)}
            </button>

            {/* Mode switcher for Email */}
            <button
              id="auth-mode-switch-btn"
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
                setForgotMessage('');
              }}
              className="w-full mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer text-center"
            >
              {authMode === 'login' ? labels.switchToRegister : labels.switchToLogin}
            </button>
          </form>
        )}

        {/* Separator */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] text-slate-400 uppercase font-bold">{labels.or}</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Google Login */}
        <button
          id="auth-google-btn"
          disabled={authLoading || forgotLoading}
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 sm:py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer shadow-2xs"
        >
          <Chrome size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>{labels.googleBtn}</span>
        </button>

        <p className="mt-3 text-center text-[10px] text-slate-400">
          {labels.browserNotice}
        </p>
      </div>
    </div>
  );
};

