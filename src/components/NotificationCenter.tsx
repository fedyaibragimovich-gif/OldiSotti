import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, MessageSquare, X } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead, markConversationReadInDb, subscribeToConversations, subscribeToNotifications } from '../lib/firebase';
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
    try {
      await markAllNotificationsRead(notifications);
      await Promise.all(unreadConversations.map(c => markConversationReadInDb(c.id)));
    } catch { /* Remain unread so the user can retry. */ }
  };

  const openChat = async (item?: AppNotification) => {
    if (item?.type !== 'message' && item?.listingId) {
      await markNotificationRead(item.id).catch(() => {});
      window.dispatchEvent(new CustomEvent('oldisotti_open_listing', { detail: item.listingId }));
      setOpen(false);
      return;
    }
    const target = item?.chatId ? conversations.find(c => c.id === item.chatId) : unreadConversations[0] || conversations[0];
    if (!target) return;
    try {
      if (item?.id && item.id !== 'unread-messages-fallback') await markNotificationRead(item.id);
      localStorage.setItem('oldisotti_notification_chat_id', target.id);
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('oldisotti_open_chat', { detail: target.id }));
    setOpen(false);
  };

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const visibleCount = visibleNotifications.length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(v => !v); requestBrowserNotifications(); }}
        aria-label={t.title}
        title={t.title}
        className="relative flex items-center justify-center rounded-xl p-2 sm:px-2.5 sm:py-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
      >
        <Bell size={16} className={visibleCount > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"} />
        {visibleCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-xs animate-in zoom-in-50">
            {visibleCount > 9 ? '9+' : visibleCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
              <Bell size={16} className="text-indigo-600 dark:text-indigo-400" />
              {t.title}
            </div>
            <div className="flex items-center gap-1">
              {visibleCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={t.markAll}
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-400">{t.empty}</div>
            ) : (
              visibleNotifications.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.type === 'message' ? openChat(item) : markNotificationRead(item.id)}
                  className="flex w-full gap-3 rounded-xl p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <MessageSquare size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{item.message}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
