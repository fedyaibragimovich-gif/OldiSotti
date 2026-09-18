import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Loader2, RotateCcw } from 'lucide-react';
import type { Language } from '../types';
import { findFallbackAnswer } from '../lib/supportKnowledge';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';

type Message = { role: 'user' | 'assistant'; text: string };
const COPY = {
  uz: { title: 'AI yordamchi', open: 'AI yordam', hello: 'Salom! OldiSotdi bo‘yicha qanday yordam bera olaman?', hint: 'Savolingizni yozing…', send: 'Yuborish', close: 'Yopish', clear: 'Suhbatni tozalash', thinking: 'Javob tayyorlanmoqda…', help: 'Yordam markazi', notice: 'AI xato qilishi mumkin. Savollar Google Gemini’ga yuboriladi. Parol, SMS kod yoki karta ma’lumotlarini yozmang.', failed: 'Hozir javob olishning imkoni bo‘lmadi. Qayta urinib ko‘ring yoki yordam markazini oching.', rate: 'Savollar ko‘payib ketdi. Bir daqiqadan keyin qayta urinib ko‘ring.', retry: 'Qayta urinish', questions: ['Qanday e’lon beraman?', 'Google orqali kira olmayapman', 'E’lonim tekshiruvda', 'Sotuvchiga qanday yozaman?'] },
  ru: { title: 'AI-помощник', open: 'AI-помощь', hello: 'Здравствуйте! Чем помочь по OldiSotdi?', hint: 'Напишите вопрос…', send: 'Отправить', close: 'Закрыть', clear: 'Очистить диалог', thinking: 'Готовим ответ…', help: 'Центр помощи', notice: 'AI может ошибаться. Вопросы отправляются Google Gemini. Не указывайте пароли, SMS-коды и данные карты.', failed: 'Не удалось получить ответ. Повторите попытку или откройте центр помощи.', rate: 'Слишком много вопросов. Повторите через минуту.', retry: 'Повторить', questions: ['Как подать объявление?', 'Не могу войти через Google', 'Объявление на проверке', 'Как написать продавцу?'] },
  oz: { title: 'AI ёрдамчи', open: 'AI ёрдам', hello: 'Салом! OldiSotdi бўйича қандай ёрдам бера оламан?', hint: 'Саволингизни ёзинг…', send: 'Юбориш', close: 'Ёпиш', clear: 'Суҳбатни тозалаш', thinking: 'Жавоб тайёрланмоқда…', help: 'Ёрдам маркази', notice: 'AI хато қилиши мумкин. Саволлар Google Gemini’га юборилади. Парол, SMS код ёки карта маълумотларини ёзманг.', failed: 'Ҳозир жавоб олиб бўлмади. Қайта уриниб кўринг ёки ёрдам марказини очинг.', rate: 'Саволлар кўпайиб кетди. Бир дақиқадан кейин қайта уриниб кўринг.', retry: 'Қайта уриниш', questions: ['Қандай эълон бераман?', 'Google орқали кира олмаяпман', 'Эълоним текширувда', 'Сотувчига қандай ёзаман?'] }
};

export function SupportAssistant({ lang, onHelp }: { lang: Language; onHelp: () => void }) {
  const t = COPY[lang] || COPY.uz;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<'rate' | 'failed' | null>(null);
  const isKeyboardOpen = useVirtualKeyboard();
  const inFlight = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) { dialog.current?.showModal(); input.current?.focus(); }
    else { dialog.current?.close(); }
  }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy, error]);
  useEffect(() => () => controller.current?.abort(), []);

  const close = () => { setOpen(false); if (!isKeyboardOpen) trigger.current?.focus(); };
  const ask = async (text: string, retry = false) => {
    const trimmed = text.trim();
    if (inFlight.current || !trimmed || trimmed.length > 1200) return;
    inFlight.current = true; setBusy(true); setError(null);
    const next: Message[] = retry ? messages : [...messages, { role: 'user', text: trimmed }];
    setMessages(next); setDraft('');
    const abort = new AbortController(); controller.current = abort;
    const timer = window.setTimeout(() => abort.abort(), 25000);
    try {
      // Start context with a user turn and cap the amount sent to the provider.
      const history = next.slice(-7).map(m => ({ ...m, text: m.text.slice(0, 1200) }));
      if (history[0]?.role === 'assistant') history.shift();
      const response = await fetch('/api/support-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: abort.signal });
      const data = await response.json();
      if (response.ok && typeof data.answer === 'string') {
        setMessages([...next, { role: 'assistant' as const, text: data.answer }].slice(-30));
        return;
      }
      const fallback = findFallbackAnswer(trimmed, lang);
      if (fallback) {
        setMessages([...next, { role: 'assistant' as const, text: fallback }].slice(-30));
      } else {
        setError(response.status === 429 ? 'rate' : 'failed');
      }
    } catch {
      const fallback = findFallbackAnswer(trimmed, lang);
      if (fallback) {
        setMessages([...next, { role: 'assistant' as const, text: fallback }].slice(-30));
      } else {
        setError('failed');
      }
    }
    finally { window.clearTimeout(timer); inFlight.current = false; setBusy(false); }
  };

  return <>
    <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}
      aria-hidden={open || isKeyboardOpen} tabIndex={open || isKeyboardOpen ? -1 : 0}
      style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 16px)' }}
      className={`fixed right-4 z-30 flex min-h-11 items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${open || isKeyboardOpen ? 'pointer-events-none opacity-0' : ''}`}>
      <Bot size={20} />{t.open}
    </button>
    <dialog ref={dialog} onCancel={close} onClose={() => { setOpen(false); if (!isKeyboardOpen) trigger.current?.focus(); }} aria-labelledby="support-title"
      className="fixed inset-0 m-auto w-[calc(100%-1rem)] max-w-md max-h-[85dvh] rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
      <div className="flex h-[min(600px,85dvh)] flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <Bot size={22} className="text-indigo-500" /><h2 id="support-title" className="flex-1 font-bold">{t.title}</h2>
          <button type="button" disabled={busy} aria-label={t.clear} onClick={() => { setMessages([]); setError(null); setDraft(''); input.current?.focus(); }} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"><RotateCcw size={18} /></button>
          <button type="button" onClick={close} aria-label={t.close} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
        </header>
        <div role="log" aria-live="polite" aria-label={t.title} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">{t.hello}</p>
          {messages.length === 0 && <div className="flex flex-wrap gap-2">{t.questions.map(q => <button key={q} type="button" onClick={() => void ask(q)} className="rounded-xl border border-indigo-200 px-3 py-2 text-left text-xs text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950">{q}</button>)}</div>}
          {messages.map((m, i) => <p key={i} className={`max-w-[92%] whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{m.text}</p>)}
          {busy && <p role="status" className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={16} className="animate-spin" />{t.thinking}</p>}
          {error && <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"><p>{t[error]}</p><button type="button" onClick={() => void ask(messages.at(-1)?.text || '', true)} className="mt-2 font-bold underline">{t.retry}</button></div>}
          <div ref={end} />
        </div>
        <footer className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
          <p className="mb-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{t.notice}</p>
          <form onSubmit={e => { e.preventDefault(); void ask(draft); }} className="flex items-end gap-2">
            <textarea ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={1200} rows={2} disabled={busy} aria-label={t.hint} placeholder={t.hint}
              className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-base outline-indigo-500 dark:border-slate-600"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void ask(draft); } }} />
            <button type="submit" disabled={busy || !draft.trim()} aria-label={t.send} className="rounded-xl bg-indigo-600 p-3 text-white disabled:opacity-40">{busy ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}</button>
          </form>
          <button type="button" onClick={() => { close(); onHelp(); }} className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 underline">{t.help}</button>
        </footer>
      </div>
    </dialog>
  </>;
}
