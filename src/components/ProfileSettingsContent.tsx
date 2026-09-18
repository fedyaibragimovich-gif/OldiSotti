import React, { useEffect, useState } from 'react';
import { ChevronDown, UserRound, Palette, Loader2 } from 'lucide-react';
import { updateProfile, type User } from 'firebase/auth';
import type { Language } from '../types';
import { browserStorage } from '../lib/browserStorage';

type Section = 'account' | 'appearance' | null;

const copy = {
  uz: { account: 'Akkaunt ma’lumotlari', appearance: 'Ko‘rinish va til', name: 'Ismingiz', email: 'Email', phone: 'Telefon', missing: 'Kiritilmagan', save: 'Saqlash', saving: 'Saqlanmoqda...', saved: 'Ism saqlandi', badName: 'Ism 2–80 ta belgidan iborat bo‘lsin.', failed: 'Saqlashda xatolik yuz berdi. Qayta urinib ko‘ring.', contactHint: 'Email va telefon raqamini bu yerdan o‘zgartirib bo‘lmaydi.', language: 'Til', theme: 'Ko‘rinish', light: 'Oq', dark: 'Qorong‘i' },
  ru: { account: 'Данные аккаунта', appearance: 'Вид и язык', name: 'Ваше имя', email: 'Эл. почта', phone: 'Телефон', missing: 'Не указан', save: 'Сохранить', saving: 'Сохранение...', saved: 'Имя сохранено', badName: 'Имя должно содержать 2–80 символов.', failed: 'Не удалось сохранить. Попробуйте ещё раз.', contactHint: 'Изменить почту или телефон здесь пока нельзя.', language: 'Язык', theme: 'Оформление', light: 'Светлая', dark: 'Тёмная' },
  oz: { account: 'Аккаунт маълумотлари', appearance: 'Кўриниш ва тил', name: 'Исмингиз', email: 'Email', phone: 'Телефон', missing: 'Киритилмаган', save: 'Сақлаш', saving: 'Сақланмоқда...', saved: 'Исм сақланди', badName: 'Исм 2–80 та белгидан иборат бўлсин.', failed: 'Сақлашда хатолик юз берди. Қайта уриниб кўринг.', contactHint: 'Email ва телефон рақамини бу ердан ўзгартириб бўлмайди.', language: 'Тил', theme: 'Кўриниш', light: 'Оқ', dark: 'Қоронғи' }
};

interface Props { user: User; lang: Language; onProfileUpdated: () => void; }

export const ProfileSettingsContent: React.FC<Props> = ({ user, lang, onProfileUpdated }) => {
  const c = copy[lang] || copy.uz;
  const [section, setSection] = useState<Section>(null);
  const [name, setName] = useState(user.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  useEffect(() => { setName(user.displayName || ''); setMessage(''); setSection(null); }, [user.uid]);

  const saveName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const normalized = name.trim().replace(/\s+/g, ' ');
    if (normalized.length < 2 || normalized.length > 80) { setMessage(c.badName); return; }
    if (normalized === (user.displayName || '')) { setMessage(c.saved); return; }
    setSaving(true);
    setMessage('');
    try {
      await updateProfile(user, { displayName: normalized });
      setName(normalized);
      onProfileUpdated();
      setMessage(c.saved);
    } catch (error) {
      console.error('Profile name update failed:', error);
      setMessage(c.failed);
    } finally { setSaving(false); }
  };

  const changeLanguage = (next: Language) => {
    if (next === lang) return;
    browserStorage.setItem('olx_lang', next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.location.assign(url.toString());
  };

  const changeTheme = (next: 'light' | 'dark') => {
    if (next === theme) return;
    setTheme(next);
    browserStorage.setItem('olx_dark_mode', String(next === 'dark'));
    window.location.reload();
  };

  const syntheticEmail = /^phone-998\d{9}@auth\.oldi-sotdi\.uz$/i.test(user.email || '');
  const email = syntheticEmail ? null : user.email;
  const phone = user.phoneNumber || (syntheticEmail ? `+${user.email!.slice(6, 18)}` : null);
  const fieldClass = 'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-1">
      <button type="button" id="bottom-profile-account-btn" aria-expanded={section === 'account'} aria-controls="bottom-profile-account-panel" onClick={() => { setSection(section === 'account' ? null : 'account'); setMessage(''); }} className="w-full flex items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <span className="flex items-center gap-2"><UserRound size={15} />{c.account}</span><ChevronDown size={14} className={`transition-transform ${section === 'account' ? 'rotate-180' : ''}`} />
      </button>
      {section === 'account' && (
        <div id="bottom-profile-account-panel" className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-3">
          <form onSubmit={saveName} className="space-y-2">
            <label htmlFor="profile-settings-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-200">{c.name}</label>
            <input id="profile-settings-name" name="displayName" type="text" autoComplete="name" maxLength={80} value={name} onChange={(event) => { setName(event.target.value); setMessage(''); }} className={fieldClass} />
            <button type="submit" id="profile-settings-save-name" disabled={saving || name.trim() === (user.displayName || '')} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">{saving ? <span className="flex items-center gap-1"><Loader2 size={13} className="animate-spin" />{c.saving}</span> : c.save}</button>
          </form>
          {message && <p role="status" className="text-xs text-slate-600 dark:text-slate-300">{message}</p>}
          <div className="space-y-1"><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.email}</p><p className="break-all text-xs text-slate-500 dark:text-slate-400">{email || c.missing}</p></div>
          <div className="space-y-1"><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.phone}</p><p className="text-xs text-slate-500 dark:text-slate-400">{phone || c.missing}</p></div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{c.contactHint}</p>
        </div>
      )}
      <button type="button" id="bottom-profile-appearance-btn" aria-expanded={section === 'appearance'} aria-controls="bottom-profile-appearance-panel" onClick={() => setSection(section === 'appearance' ? null : 'appearance')} className="w-full flex items-center justify-between gap-2 rounded-xl px-2 py-2.5 text-left text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <span className="flex items-center gap-2"><Palette size={15} />{c.appearance}</span><ChevronDown size={14} className={`transition-transform ${section === 'appearance' ? 'rotate-180' : ''}`} />
      </button>
      {section === 'appearance' && (
        <div id="bottom-profile-appearance-panel" className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-3">
          <fieldset><legend className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{c.language}</legend><div className="flex flex-wrap gap-1.5">{([['uz', 'O‘zbekcha'], ['oz', 'Ўзбекча'], ['ru', 'Русский']] as const).map(([code, label]) => <button key={code} type="button" aria-pressed={lang === code} onClick={() => changeLanguage(code)} className={`rounded-lg border px-2.5 py-2 text-xs cursor-pointer ${lang === code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{label}</button>)}</div></fieldset>
          <fieldset><legend className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{c.theme}</legend><div className="flex gap-1.5">{(['light', 'dark'] as const).map(mode => <button key={mode} type="button" aria-pressed={theme === mode} onClick={() => changeTheme(mode)} className={`flex-1 rounded-lg border px-3 py-2 text-xs cursor-pointer ${theme === mode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{mode === 'light' ? c.light : c.dark}</button>)}</div></fieldset>
        </div>
      )}
    </div>
  );
};
