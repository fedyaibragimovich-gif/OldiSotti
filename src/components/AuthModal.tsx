import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Chrome,
  Lock,
  Mail,
  Phone,
  RotateCw,
  Smartphone,
  X
} from 'lucide-react';
import { Language } from '../types';
import {
  clearRecaptcha,
  confirmPhoneAndSetPassword,
  ConfirmationResult,
  loginWithEmail,
  loginWithGoogle,
  loginWithPhonePassword,
  registerWithEmail,
  resetPassword,
  sendPhoneVerificationCode
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

const formatUzbekPhone = (value: string): string => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.slice(0, 9);

  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 5) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  reasonMessage,
  onSuccess
}) => {
  const t = (uz: string, ru: string, oz?: string) => {
    if (lang === 'ru') return ru;
    if (lang === 'oz') return oz || uz;
    return uz;
  };

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [phoneResetMode, setPhoneResetMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const authInFlight = useRef(false);

  const [authError, setAuthError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);

  const [phoneStep, setPhoneStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [rawPhone, setRawPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setPhoneResetMode(false);
      setAuthError('');
      setForgotMessage('');
      setPassword('');
      setConfirmPassword('');
      setPhoneStep('enter_phone');
      setConfirmationResult(null);
      setOtpCode('');
      setCountdown(0);
      try {
        const savedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
        if (savedEmail) setEmail(savedEmail);
        const savedPhone = window.localStorage.getItem(REMEMBERED_PHONE_KEY);
        if (savedPhone) setRawPhone(formatUzbekPhone(savedPhone));
      } catch {
        // Local storage may be unavailable in privacy mode.
      }
    } else {
      clearRecaptcha();
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (phoneStep !== 'enter_otp') return;
    const timer = window.setTimeout(() => otpInputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [phoneStep]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !authLoading) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, authLoading, onClose]);

  if (!isOpen) return null;

  const phoneDigits = rawPhone.replace(/\D/g, '').slice(-9);
  const phoneIsValid = phoneDigits.length === 9;

  const validatePassword = (requireConfirmation: boolean) => {
    if (password.length < 6) {
      setAuthError(t(
        'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.',
        'Пароль должен содержать не менее 6 символов.',
        'Парол камида 6 та белгидан иборат бўлиши керак.'
      ));
      return false;
    }
    if (requireConfirmation && password !== confirmPassword) {
      setAuthError(t(
        'Parollar bir xil emas. Parolni qayta tekshiring.',
        'Пароли не совпадают. Проверьте подтверждение пароля.',
        'Пароллар бир хил эмас. Паролни қайта текширинг.'
      ));
      return false;
    }
    return true;
  };

  const friendlyAuthError = (error: any, method: 'phone' | 'email' = authMethod) => {
    const code = String(error?.code || '');
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      if (method === 'phone') {
        return t(
          'Telefon raqami yoki parol noto‘g‘ri. Agar bu raqam bilan avval faqat SMS orqali kirgan bo‘lsangiz, “Ro‘yxatdan o‘tish” orqali bir marta parol yarating.',
          'Неверный номер телефона или пароль. Если раньше вы входили только по SMS, один раз создайте пароль через «Регистрация».',
          'Телефон рақами ёки парол нотўғри. Агар аввал фақат SMS орқали кирган бўлсангиз, «Рўйхатдан ўтиш» орқали бир марта парол яратинг.'
        );
      }
      return t('Email yoki parol noto‘g‘ri.', 'Неверный email или пароль.', 'Email ёки парол нотўғри.');
    }
    if (code.includes('email-already-in-use') || code.includes('credential-already-in-use')) {
      return method === 'phone'
        ? t('Bu telefon raqami boshqa akkauntga biriktirilgan.', 'Этот номер телефона уже привязан к другому аккаунту.', 'Бу телефон рақами бошқа аккаунтга бириктирилган.')
        : t('Bu email allaqachon ro‘yxatdan o‘tgan.', 'Этот email уже зарегистрирован.', 'Бу email аллақачон рўйхатдан ўтган.');
    }
    if (code.includes('phone-password-conflict')) {
      return t(
        'Bu akkaunt boshqa kirish usuli bilan bog‘langan. Email yoki Google orqali kiring.',
        'Этот аккаунт связан с другим способом входа. Войдите через Email или Google.',
        'Бу аккаунт бошқа кириш усули билан боғланган. Email ёки Google орқали киринг.'
      );
    }
    if (code.includes('weak-password')) {
      return t('Parol kamida 6 ta belgidan iborat bo‘lishi kerak.', 'Пароль должен содержать не менее 6 символов.', 'Парол камида 6 та белгидан иборат бўлиши керак.');
    }
    if (code.includes('invalid-email')) {
      return t('Email manzilini tekshiring.', 'Проверьте правильность email.', 'Email манзилини текширинг.');
    }
    if (code.includes('invalid-phone-number') || code.includes('missing-phone-number')) {
      return t('To‘liq 9 xonali O‘zbekiston telefon raqamini kiriting.', 'Введите полный 9-значный номер Узбекистана.', 'Тўлиқ 9 хонали Ўзбекистон телефон рақамини киритинг.');
    }
    if (code.includes('invalid-verification-code')) {
      return t('SMS tasdiqlash kodi noto‘g‘ri.', 'Неверный SMS-код подтверждения.', 'SMS тасдиқлаш коди нотўғри.');
    }
    if (code.includes('code-expired')) {
      return t('SMS kod muddati tugagan. Yangi kod so‘rang.', 'Срок действия SMS-кода истёк. Запросите новый.', 'SMS код муддати тугаган. Янги код сўранг.');
    }
    if (code.includes('quota-exceeded')) {
      return t('SMS limiti tugagan. Birozdan keyin qayta urinib ko‘ring.', 'Лимит SMS исчерпан. Попробуйте позже.', 'SMS лимити тугаган. Бироздан кейин қайта уриниб кўринг.');
    }
    if (code.includes('too-many-requests')) {
      return t('Juda ko‘p urinish bo‘ldi. Biroz kutib qayta urinib ko‘ring.', 'Слишком много попыток. Немного подождите и попробуйте снова.', 'Жуда кўп уриниш бўлди. Бироз кутиб қайта уриниб кўринг.');
    }
    if (code.includes('captcha-check-failed')) {
      return t('reCAPTCHA xavfsizlik tekshiruvi o‘tmadi. Qayta urinib ko‘ring.', 'Проверка reCAPTCHA не пройдена. Попробуйте снова.', 'reCAPTCHA хавфсизлик текшируви ўтмади. Қайта уриниб кўринг.');
    }
    if (code.includes('unauthorized-domain')) {
      return t('Bu domen Firebase Authentication uchun ruxsat etilmagan.', 'Этот домен не авторизован в Firebase Authentication.', 'Бу домен Firebase Authentication учун рухсат этилмаган.');
    }
    if (code.includes('operation-not-allowed')) {
      return t(
        'Firebase’da Phone va Email/Password kirish usullari yoqilganini tekshiring.',
        'Проверьте, что в Firebase включены Phone и Email/Password.',
        'Firebase’да Phone ва Email/Password кириш усуллари ёқилганини текширинг.'
      );
    }
    if (code.includes('network-request-failed')) {
      return t('Internet aloqasini tekshiring.', 'Проверьте подключение к интернету.', 'Интернет алоқасини текширинг.');
    }
    if (code.includes('popup-blocked')) {
      return t('Brauzer Google oynasini blokladi. Popup oynalarga ruxsat bering.', 'Браузер заблокировал окно Google. Разрешите всплывающие окна.', 'Браузер Google ойнасини блоклади. Popup ойналарга рухсат беринг.');
    }
    if (code.includes('popup-closed')) {
      return t('Google kirish oynasi yopildi.', 'Окно входа Google было закрыто.', 'Google кириш ойнаси ёпилди.');
    }
    return t('Kirishda xatolik yuz berdi. Qayta urinib ko‘ring.', 'Произошла ошибка. Попробуйте ещё раз.', 'Киришда хатолик юз берди. Қайта уриниб кўринг.');
  };

  const rememberPhone = () => {
    try {
      window.localStorage.setItem(REMEMBERED_PHONE_KEY, phoneDigits);
    } catch {
      // Ignore unavailable local storage.
    }
  };

  const handlePhoneLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (authInFlight.current) return;
    setAuthError('');
    setForgotMessage('');

    if (!phoneIsValid) {
      setAuthError(t('To‘liq 9 xonali telefon raqamini kiriting.', 'Введите полный 9-значный номер.', 'Тўлиқ 9 хонали телефон рақамини киритинг.'));
      return;
    }
    if (!validatePassword(false)) return;

    authInFlight.current = true;
    setAuthLoading(true);
    try {
      rememberPhone();
      await loginWithPhonePassword(rawPhone, password);
      setPassword('');
      setConfirmPassword('');
      onClose();
      onSuccess?.();
    } catch (error) {
      setAuthError(friendlyAuthError(error, 'phone'));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async (event?: React.FormEvent, isResend = false) => {
    event?.preventDefault();
    if (authInFlight.current) return;
    setAuthError('');
    setForgotMessage('');

    if (!phoneIsValid) {
      setAuthError(t('To‘liq 9 xonali telefon raqamini kiriting.', 'Введите полный 9-значный номер.', 'Тўлиқ 9 хонали телефон рақамини киритинг.'));
      return;
    }
    if (!validatePassword(true)) return;

    authInFlight.current = true;
    setAuthLoading(true);
    try {
      rememberPhone();
      const confirmation = await sendPhoneVerificationCode(rawPhone, 'recaptcha-container');
      setConfirmationResult(confirmation);
      setPhoneStep('enter_otp');
      setCountdown(60);
      if (isResend) {
        setForgotMessage(t('Yangi SMS-kod yuborildi.', 'Новый SMS-код отправлен.', 'Янги SMS-код юборилди.'));
      }
    } catch (error) {
      setAuthError(friendlyAuthError(error, 'phone'));
      clearRecaptcha();
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (authInFlight.current) return;
    setAuthError('');

    if (otpCode.replace(/\D/g, '').length !== 6) {
      setAuthError(t('6 xonali SMS kodni kiriting.', 'Введите 6-значный SMS-код.', '6 хонали SMS кодни киритинг.'));
      return;
    }
    if (!confirmationResult) {
      setAuthError(t('SMS sessiyasi tugagan. Kodni qayta so‘rang.', 'SMS-сессия истекла. Запросите код повторно.', 'SMS сессияси тугаган. Кодни қайта сўранг.'));
      setPhoneStep('enter_phone');
      return;
    }
    if (!validatePassword(true)) return;

    authInFlight.current = true;
    setAuthLoading(true);
    try {
      await confirmPhoneAndSetPassword(confirmationResult, otpCode, rawPhone, password);
      clearRecaptcha();
      setConfirmationResult(null);
      setOtpCode('');
      setPassword('');
      setConfirmPassword('');
      onClose();
      onSuccess?.();
    } catch (error) {
      setAuthError(friendlyAuthError(error, 'phone'));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setPhoneStep('enter_phone');
    setConfirmationResult(null);
    setOtpCode('');
    setCountdown(0);
    setAuthError('');
    setForgotMessage('');
    clearRecaptcha();
  };

  const switchMode = () => {
    setAuthMode((mode) => (mode === 'login' ? 'register' : 'login'));
    setPhoneResetMode(false);
    setPhoneStep('enter_phone');
    setConfirmationResult(null);
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
    setForgotMessage('');
    clearRecaptcha();
  };

  const startPhonePasswordReset = () => {
    setPhoneResetMode(true);
    setAuthMode('login');
    setPhoneStep('enter_phone');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setConfirmationResult(null);
    setAuthError('');
    setForgotMessage('');
    clearRecaptcha();
  };

  const cancelPhonePasswordReset = () => {
    setPhoneResetMode(false);
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
    setForgotMessage('');
  };

  const submitEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (authInFlight.current) return;
    setAuthError('');
    setForgotMessage('');

    const normalizedEmail = email.trim();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setAuthError(t('To‘g‘ri email manzilini kiriting.', 'Введите корректный email.', 'Тўғри email манзилини киритинг.'));
      return;
    }
    if (!validatePassword(authMode === 'register')) return;

    authInFlight.current = true;
    setAuthLoading(true);
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
      setConfirmPassword('');
      onClose();
      onSuccess?.();
    } catch (error) {
      setAuthError(friendlyAuthError(error, 'email'));
    } finally {
      authInFlight.current = false;
      setAuthLoading(false);
    }
  };

  const handleEmailForgotPassword = async () => {
    if (authInFlight.current) return;
    const normalizedEmail = email.trim();
    setAuthError('');
    setForgotMessage('');
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setAuthError(t('Avval to‘g‘ri email manzilini kiriting.', 'Сначала введите корректный email.', 'Аввал тўғри email манзилини киритинг.'));
      return;
    }

    authInFlight.current = true;
    setForgotLoading(true);
    try {
      await resetPassword(normalizedEmail);
      setForgotMessage(t(
        'Parolni tiklash havolasi emailingizga yuborildi.',
        'Ссылка для сброса пароля отправлена на ваш email.',
        'Паролни тиклаш ҳаволаси emailingизга юборилди.'
      ));
    } catch (error) {
      setAuthError(friendlyAuthError(error, 'email'));
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

  const switchMethod = (method: 'phone' | 'email') => {
    setAuthMethod(method);
    setPhoneStep('enter_phone');
    setPhoneResetMode(false);
    setConfirmationResult(null);
    setOtpCode('');
    setPassword('');
    setConfirmPassword('');
    setAuthError('');
    setForgotMessage('');
    clearRecaptcha();
  };

  const phoneTitle = phoneStep === 'enter_otp'
    ? t('SMS kodni kiriting', 'Введите SMS-код', 'SMS кодни киритинг')
    : phoneResetMode
      ? t('Parolni tiklash', 'Сброс пароля', 'Паролни тиклаш')
      : authMode === 'login'
        ? t('Kirish', 'Войти', 'Кириш')
        : t('Ro‘yxatdan o‘tish', 'Регистрация', 'Рўйхатдан ўтиш');

  const phoneSubtitle = phoneResetMode
    ? t('Yangi parolni kiriting va raqamingizni SMS bilan tasdiqlang.', 'Введите новый пароль и подтвердите номер по SMS.', 'Янги паролни киритинг ва рақамингизни SMS билан тасдиқланг.')
    : authMode === 'login'
      ? t('Telefon raqami va parol bilan kiring. SMS yuborilmaydi.', 'Войдите по номеру телефона и паролю. SMS не отправляется.', 'Телефон рақами ва парол билан киринг. SMS юборилмайди.')
      : t('Raqamni bir marta SMS bilan tasdiqlang va parol yarating.', 'Один раз подтвердите номер по SMS и создайте пароль.', 'Рақамни бир марта SMS билан тасдиқланг ва парол яратинг.');

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget && !authLoading) onClose();
      }}
    >
      <div
        id="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              {authMethod === 'phone' ? <Smartphone size={18} /> : <Mail size={18} />}
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-xl font-black tracking-tight">
                {authMethod === 'phone'
                  ? phoneTitle
                  : authMode === 'login'
                    ? t('Kirish', 'Войти', 'Кириш')
                    : t('Ro‘yxatdan o‘tish', 'Регистрация', 'Рўйхатдан ўтиш')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {authMethod === 'phone'
                  ? phoneSubtitle
                  : t('OldiSotdi akkauntingiz', 'Ваш аккаунт OldiSotdi', 'OldiSotdi аккаунтингиз')}
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            type="button"
            onClick={onClose}
            disabled={authLoading}
            className="p-2 -mr-1 -mt-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            aria-label={t('Yopish', 'Закрыть', 'Ёпиш')}
          >
            <X size={18} />
          </button>
        </div>

        {reasonMessage && (
          <div id="auth-modal-reason-banner" className="mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3 text-xs font-semibold text-amber-900 dark:text-amber-200">
            {reasonMessage}
          </div>
        )}

        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-4 border border-slate-200/60 dark:border-slate-700/60">
          <button
            id="auth-tab-phone-btn"
            type="button"
            onClick={() => switchMethod('phone')}
            disabled={authLoading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold ${authMethod === 'phone' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Phone size={14} />
            {t('Telefon', 'Телефон', 'Телефон')}
          </button>
          <button
            id="auth-tab-email-btn"
            type="button"
            onClick={() => switchMethod('email')}
            disabled={authLoading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold ${authMethod === 'email' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Mail size={14} />
            Email
          </button>
        </div>

        {authMethod === 'phone' && phoneStep === 'enter_phone' && (
          <form
            onSubmit={authMode === 'login' && !phoneResetMode ? handlePhoneLogin : (event) => handleSendOtp(event)}
            className="space-y-3"
            autoComplete="on"
          >
            <div>
              <label htmlFor="auth-phone-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('Telefon raqamingiz', 'Номер телефона', 'Телефон рақамингиз')}
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <div className="flex items-center gap-1.5 pl-3 pr-2 py-3 bg-slate-100/70 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  <span>🇺🇿</span><span>+998</span>
                </div>
                <input
                  id="auth-phone-input"
                  name="tel"
                  type="tel"
                  autoComplete="tel"
                  autoFocus
                  required
                  value={rawPhone}
                  placeholder="(90) 123-45-67"
                  onChange={(event) => {
                    setRawPhone(formatUzbekPhone(event.target.value));
                    setAuthError('');
                  }}
                  className="w-full bg-transparent px-3 py-3 text-sm font-semibold tracking-wide outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-phone-password-input"
                name="phone-password"
                type="password"
                autoComplete={authMode === 'login' && !phoneResetMode ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setAuthError(''); }}
                placeholder={phoneResetMode ? t('Yangi parol', 'Новый пароль', 'Янги парол') : t('Parol (kamida 6 ta belgi)', 'Пароль (минимум 6 символов)', 'Парол (камида 6 та белги)')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {(authMode === 'register' || phoneResetMode) && (
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-phone-confirm-password-input"
                  name="phone-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => { setConfirmPassword(event.target.value); setAuthError(''); }}
                  placeholder={t('Parolni qayta kiriting', 'Повторите пароль', 'Паролни қайта киритинг')}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {authMode === 'login' && !phoneResetMode && (
              <div className="flex justify-end">
                <button
                  id="auth-phone-forgot-password-btn"
                  type="button"
                  onClick={startPhonePasswordReset}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('Parolni unutdingizmi?', 'Забыли пароль?', 'Паролни унутдингизми?')}
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {phoneResetMode
                ? t('SMS faqat raqam egasi ekaningizni tasdiqlash uchun yuboriladi.', 'SMS отправляется только для подтверждения владельца номера.', 'SMS фақат рақам эгаси эканингизни тасдиқлаш учун юборилади.')
                : authMode === 'register'
                  ? t('Ro‘yxatdan o‘tishda raqam bir marta SMS bilan tasdiqlanadi. Keyingi kirishlarda telefon + parol yetadi.', 'При регистрации номер подтверждается по SMS один раз. Далее достаточно телефона и пароля.', 'Рўйхатдан ўтишда рақам бир марта SMS билан тасдиқланади. Кейин телефон + парол етарли.')
                  : t('Oddiy kirishda SMS yuborilmaydi.', 'При обычном входе SMS не отправляется.', 'Оддий киришда SMS юборилмайди.')}
            </p>

            {authError && (
              <div id="auth-phone-error-box" className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div id="recaptcha-container" className="flex justify-center" />

            <button
              id="auth-phone-submit-btn"
              disabled={authLoading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-bold text-sm shadow-md shadow-indigo-600/20"
            >
              {authLoading && <RotateCw size={16} className="animate-spin" />}
              <span>
                {authMode === 'login' && !phoneResetMode
                  ? t('Kirish', 'Войти', 'Кириш')
                  : authLoading
                    ? t('SMS yuborilmoqda…', 'Отправка SMS…', 'SMS юборилмоқда…')
                    : t('SMS kod olish', 'Получить SMS-код', 'SMS код олиш')}
              </span>
            </button>

            {phoneResetMode ? (
              <button type="button" onClick={cancelPhonePasswordReset} className="w-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline">
                {t('Kirishga qaytish', 'Вернуться ко входу', 'Киришга қайтиш')}
              </button>
            ) : (
              <button id="auth-phone-mode-switch-btn" type="button" onClick={switchMode} className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                {authMode === 'login'
                  ? t('Akkauntingiz yo‘qmi? Ro‘yxatdan o‘ting', 'Нет аккаунта? Зарегистрируйтесь', 'Аккаунтингиз йўқми? Рўйхатдан ўтинг')
                  : t('Akkauntingiz bormi? Tizimga kiring', 'Уже есть аккаунт? Войдите', 'Аккаунтингиз борми? Тизимга киринг')}
              </button>
            )}
          </form>
        )}

        {authMethod === 'phone' && phoneStep === 'enter_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <div className="rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-3 text-center">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">+998 {rawPhone}</span>{' '}
                {t('raqamiga yuborilgan 6 xonali kodni kiriting.', '— введите 6-значный код из SMS.', 'рақамига юборилган 6 хонали кодни киритинг.')}
              </p>
              <button type="button" onClick={handleChangeNumber} disabled={authLoading} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                <ArrowLeft size={12} />
                {t('Raqamni o‘zgartirish', 'Изменить номер', 'Рақамни ўзгартириш')}
              </button>
            </div>

            <input
              ref={otpInputRef}
              id="auth-otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={otpCode}
              onChange={(event) => {
                setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setAuthError('');
              }}
              placeholder="• • • • • •"
              className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />

            {authError && (
              <div id="auth-otp-error-box" className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={15} />
                <span>{forgotMessage}</span>
              </div>
            )}

            <button id="auth-otp-verify-btn" disabled={authLoading || otpCode.length !== 6} type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 font-bold text-sm shadow-md shadow-indigo-600/20">
              {authLoading
                ? t('Tekshirilmoqda…', 'Проверка…', 'Текширилмоқда…')
                : phoneResetMode
                  ? t('Tasdiqlash va yangi parolni saqlash', 'Подтвердить и сохранить новый пароль', 'Тасдиқлаш ва янги паролни сақлаш')
                  : t('Tasdiqlash va ro‘yxatdan o‘tish', 'Подтвердить регистрацию', 'Тасдиқлаш ва рўйхатдан ўтиш')}
            </button>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-slate-400 font-semibold">{t(`Qayta yuborish: ${countdown}s`, `Повторно через: ${countdown}с`, `Қайта юбориш: ${countdown}s`)}</p>
              ) : (
                <button type="button" onClick={() => handleSendOtp(undefined, true)} disabled={authLoading} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t('Kodni qayta yuborish', 'Отправить код повторно', 'Кодни қайта юбориш')}
                </button>
              )}
            </div>
          </form>
        )}

        {authMethod === 'email' && (
          <form onSubmit={submitEmailAuth} className="space-y-3" autoComplete="on">
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-email-input"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setAuthError(''); setForgotMessage(''); }}
                type="email"
                name="email"
                autoComplete="username email"
                required
                placeholder={t('Email manzilingiz', 'Ваш email', 'Email манзилингиз')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-password-input"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setAuthError(''); }}
                type="password"
                name="password"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                placeholder={t('Parol (kamida 6 ta belgi)', 'Пароль (минимум 6 символов)', 'Парол (камида 6 та белги)')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {authMode === 'register' && (
              <div className="relative">
                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-confirm-password-input"
                  value={confirmPassword}
                  onChange={(event) => { setConfirmPassword(event.target.value); setAuthError(''); }}
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder={t('Parolni qayta kiriting', 'Повторите пароль', 'Паролни қайта киритинг')}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input id="auth-remember-checkbox" type="checkbox" checked={rememberEmail} onChange={(event) => setRememberEmail(event.target.checked)} className="h-4 w-4" />
                  {t('Emailni eslab qolish', 'Запомнить email', 'Emailни эслаб қолиш')}
                </label>
                <button id="auth-forgot-password-btn" type="button" disabled={forgotLoading} onClick={handleEmailForgotPassword} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                  {forgotLoading ? t('Yuborilmoqda…', 'Отправка…', 'Юборилмоқда…') : t('Parolni unutdingizmi?', 'Забыли пароль?', 'Паролни унутдингизми?')}
                </button>
              </div>
            )}

            {authError && (
              <div id="auth-email-error-box" className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {forgotMessage && (
              <div id="auth-email-success-box" className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {forgotMessage}
              </div>
            )}

            <button id="auth-submit-btn" disabled={authLoading || forgotLoading} type="submit" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 font-bold text-sm shadow-md shadow-indigo-600/20">
              {authLoading
                ? t('Kutilmoqda…', 'Подождите…', 'Кутилмоқда…')
                : authMode === 'login'
                  ? t('Kirish', 'Войти', 'Кириш')
                  : t('Ro‘yxatdan o‘tish', 'Регистрация', 'Рўйхатдан ўтиш')}
            </button>

            <button id="auth-mode-switch-btn" type="button" onClick={switchMode} className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {authMode === 'login'
                ? t('Akkauntingiz yo‘qmi? Ro‘yxatdan o‘ting', 'Нет аккаунта? Зарегистрируйтесь', 'Аккаунтингиз йўқми? Рўйхатдан ўтинг')
                : t('Akkauntingiz bormi? Tizimga kiring', 'Уже есть аккаунт? Войдите', 'Аккаунтингиз борми? Тизимга киринг')}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] text-slate-400 uppercase font-bold">{t('yoki', 'или', 'ёки')}</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <button id="auth-google-btn" disabled={authLoading || forgotLoading} type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60">
          <Chrome size={18} className="text-indigo-600 dark:text-indigo-400" />
          {t('Google bilan davom etish', 'Продолжить с Google', 'Google билан давом этиш')}
        </button>

        <p className="mt-3 text-center text-[10px] text-slate-400">
          {t('Kirganingizdan so‘ng e’lonlaringiz va yozishmalaringiz saqlanadi.', 'После входа ваши объявления и переписки сохраняются.', 'Кирганингиздан сўнг эълонларингиз ва ёзишмаларингиз сақланади.')}
        </p>
      </div>
    </div>
  );
};
