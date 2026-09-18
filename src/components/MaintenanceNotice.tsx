import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Language } from '../types';
import { browserStorage } from '../lib/browserStorage';
import { subscribeToPlatformSettings } from '../lib/firebase';

const DISMISSED_KEY = 'oldisotdi_maintenance_notice_dismissed';
const copy = {
  uz: { message: 'Saytda texnik profilaktika ishlari olib borilmoqda. Ayrim xizmatlar vaqtincha cheklanishi mumkin.', close: 'Ogohlantirishni yopish', status: 'Sayt holati', show: 'Texnik profilaktika haqida' },
  ru: { message: 'На сайте проводятся технические работы. Некоторые функции могут быть временно недоступны.', close: 'Закрыть уведомление', status: 'Статус сайта', show: 'О технических работах' },
  oz: { message: 'Сайтда техник профилактика ишлари олиб борилмоқда. Айрим хизматлар вақтинча чекланиши мумкин.', close: 'Огоҳлантиришни ёпиш', status: 'Сайт ҳолати', show: 'Техник профилактика ҳақида' }
};

const sessionDismissed = () => {
  try { return window.sessionStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
};

/** Overlay is intentionally outside normal layout: the sticky header never jumps. */
export function MaintenanceNotice({ lang }: { lang: Language }) {
  const [maintenance, setMaintenance] = useState(() => {
    try { return JSON.parse(browserStorage.getItem('olx_platform_settings') || '{}').maintenanceMode === true; }
    catch { return false; }
  });
  const [dismissed, setDismissed] = useState(sessionDismissed);
  const t = copy[lang] || copy.uz;

  useEffect(() => subscribeToPlatformSettings(settings => {
    setMaintenance(settings.maintenanceMode === true);
    if (!settings.maintenanceMode) {
      setDismissed(false);
      try { window.sessionStorage.removeItem(DISMISSED_KEY); } catch { /* Restricted storage. */ }
    }
  }), []);

  const dismiss = () => {
    setDismissed(true);
    try { window.sessionStorage.setItem(DISMISSED_KEY, '1'); } catch { /* Restricted storage. */ }
  };

  return <>
    {/* The legacy notice remains in App until the next App refactor; hide only
        that exact direct-child banner so it never shifts the sticky header. */}
    <style>{'#root > div > div.bg-rose-600:first-child { display: none !important; }'}</style>
    {maintenance && (dismissed ? (
      <button type="button" onClick={() => setDismissed(false)} aria-label={t.show}
        className="fixed right-3 top-16 z-35 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 shadow-md dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 sm:top-20">
        <AlertTriangle size={15} aria-hidden="true" />{t.status}
      </button>
    ) : (
      <aside role="status" aria-live="polite" className="fixed left-3 right-3 top-16 z-35 mx-auto flex max-w-lg items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 sm:top-20">
        <AlertTriangle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 leading-5">{t.message}</p>
        <button type="button" onClick={dismiss} aria-label={t.close} className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900">
          <X size={19} aria-hidden="true" />
        </button>
      </aside>
    ))}
  </>;
}
