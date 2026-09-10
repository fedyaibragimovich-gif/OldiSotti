import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, MessageSquare, X } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead, subscribeToConversations, subscribeToNotifications } from '../lib/firebase';
import { AppNotification, Conversation, Language } from '../types';

interface NotificationCenterProps { lang?: Language; }

const labels = {
  uz: { title: 'Bildirishnomalar', empty: 'Hozircha bildirishnoma yo‘q', messages: 'Yangi xabarlar', markAll: 'Hammasini o‘qilgan', login: 'Bildirishnomalarni ko‘rish uchun kiring' },
  ru: { title: 'Уведомления', empty: 'Уведомлений пока нет', messages: 'Новые сообщения', markAll: 'Прочитать все', login: 'Войдите, чтобы видеть уведомления' },
  oz: { title: 'Билдиришномалар', empty: 'Ҳозирча билдиришнома йўқ', messages: 'Янги хабарлар', markAll: 'Ҳаммасини ўқилган', login: 'Билдиришномалар учун киринг' }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ lang = 'uz' }) => {
  const t = labels[lang];
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastUnread, setLastUnread] = useState(0);

  useEffect(() => {
    const unsubscribeNotifications = subscribeToNotifications(setNotifications);
    const unsubscribeConversations = subscribeToConversations(setConversations);
    return () => { unsubscribeNotifications(); unsubscribeConversations(); };
  }, []);

  const unreadConversations = useMemo(() => conversations.filter(c => (c.unreadCount || 0) > 0), [conversations]);
  const unreadMessages = useMemo(() => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0), [conversations]);
  const unreadPersistent = useMemo(() => notifications.filter(n => !n.read), [notifications]);
  const visibleNotifications = useMemo(() => {
    const fallbackMessage = unreadMessages > 0 && !unreadPersistent.some(n => n.type === 'message') ? [{
      id: 'unread-messages-fallback', type: 'message' as const, title: t.messages,
      message: `${unreadMessages} ta o‘qilmagan xabar bor.`, createdAt: new Date().toISOString(), read: false
    }] : [];
    return [...unreadPersistent, ...fallbackMessage].slice(0, 10);
  }, [unreadMessages, unreadPersistent, t.messages]);

  useEffect(() => {
    if (unreadMessages > lastUnread && lastUnread >= 0 && typeof window !== 'undefined') {
      try { if ('Notification' in window && Notification.permission === 'granted') new Notification(t.messages, { body: `${unreadMessages} ta yangi xabar` }); } catch { /* optional */ }
    }
    setLastUnread(unreadMessages);
  }, [unreadMessages, lastUnread, t.messages]);

  const requestBrowserNotifications = async () => {
    try { if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission(); } catch { /* optional */ }
  };

  const markAllRead = async () => {
    try { await markAllNotificationsRead(notifications); } catch { /* offline fallback */ }
  };

  const openChat = async (item?: AppNotification) => {
    const target = item?.chatId ? conversations.find(c => c.id === item.chatId) : unreadConversations[0] || conversations[0];
    if (!target) return;
    try {
      if (item?.id && item.id !== 'unread-messages-fallback') await markNotificationRead(item.id);
      localStorage.setItem('oldisotti_notification_chat_id', target.id);
    } catch { /* ignore */ }
    const buttons = Array.from(document.querySelectorAll('button'));
    const messagesButton = buttons.find(button => {
      const text = (button.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return text === 'xabarlar' || text === 'сообщения' || text === 'хабарлар' || text.includes('xabarlar');
    });
    if (messagesButton) { (messagesButton as HTMLButtonElement).click(); setOpen(false); }
  };

  const visibleCount = visibleNotifications.length;

  return <>
    <button type="button" onClick={() => { setOpen(v => !v); requestBrowserNotifications(); }} aria-label={t.title} title={t.title}
      className="fixed right-3 top-20 z-[45] flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-lg backdrop-blur-md transition hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:text-indigo-400">
      <Bell size={19} />
      {visibleCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] font-black leading-5 text-white">{visibleCount > 9 ? '9+' : visibleCount}</span>}
    </button>

    {open && <div className="fixed right-3 top-[7.6rem] z-[46] w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white"><Bell size={16} />{t.title}</div>
        <div className="flex items-center gap-1">
          {visibleCount > 0 && <button type="button" onClick={markAllRead} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800" title={t.markAll}><CheckCheck size={16} /></button>}
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
        </div>
      </div>
      <div className="max-h-[55vh] overflow-y-auto p-2">
        {visibleNotifications.length === 0 ? <div className="px-4 py-8 text-center text-xs text-slate-400">{t.empty}</div> : visibleNotifications.map(item => <button key={item.id} type="button" onClick={() => item.type === 'message' ? openChat(item) : markNotificationRead(item.id)}
          className="flex w-full gap-3 rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"><MessageSquare size={15} /></div>
          <div className="min-w-0"><div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div><div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{item.message}</div></div>
        </button>)}
      </div>
    </div>}
  </>;
};
