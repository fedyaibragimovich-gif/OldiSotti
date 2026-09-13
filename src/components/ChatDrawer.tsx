import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, ArrowLeft, Zap, HelpCircle, Tag, Calendar, Truck, MapPin } from 'lucide-react';
import { Conversation, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatPrice, formatDisplayDate } from '../utils/formatters';
import { auth, markConversationReadInDb } from '../lib/firebase';

interface ChatDrawerProps { isOpen: boolean; onClose: () => void; lang: Language; currency: Currency; conversations: Conversation[]; activeChatId: string | null; onSelectChat: (chatId: string) => void; onSendMessage: (chatId: string, text: string) => Promise<void>; }

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, lang, currency, conversations, activeChatId, onSelectChat, onSendMessage }) => {
  const t = getTranslation(lang);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConv = conversations.find(c => c.id === activeChatId);
  const currentUid = auth.currentUser?.uid;
  const currentRole: 'buyer' | 'seller' = activeConv?.sellerUserId === currentUid ? 'seller' : 'buyer';

  useEffect(() => {
    if (!isOpen) return;
    try {
      const notificationChatId = localStorage.getItem('oldisotti_notification_chat_id');
      if (notificationChatId && conversations.some(c => c.id === notificationChatId)) {
        onSelectChat(notificationChatId);
        localStorage.removeItem('oldisotti_notification_chat_id');
      }
    } catch { /* ignore */ }
  }, [isOpen, conversations, onSelectChat]);

  useEffect(() => {
    if (!isOpen || !activeConv?.id) return;
    void markConversationReadInDb(activeConv.id).catch(() => {});
  }, [isOpen, activeConv?.id]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeConv?.messages, isOpen]);

  useEffect(() => { if (!isOpen) setInputText(''); }, [isOpen, activeChatId]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConv || sending) return;
    setSending(true); setSendError('');
    try {
      await onSendMessage(activeConv.id, text.trim().slice(0, 2000));
      setInputText('');
    } catch {
      setInputText(text);
      setSendError('Xabar yuborilmadi. Qayta urinib ko‘ring.');
    } finally { setSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 overscroll-none">
      <div className="relative w-full max-w-2xl min-w-0 bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-[100dvh] animate-in slide-in-from-right duration-300 overflow-hidden">
        <div className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white px-3 sm:px-6 py-3 border-b border-slate-800 shrink-0 min-w-0 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400"><MessageSquare size={18} /></div>
            <h3 className="text-base sm:text-lg font-bold truncate">{t.chatTitle}</h3>
            <span className="text-xs shrink-0 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold px-2 py-0.5 rounded-full">{conversations.length}</span>
          </div>
          <button onClick={onClose} aria-label="Yopish" className="p-2 shrink-0 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><X size={20} /></button>
        </div>

        <div className="flex-1 flex min-w-0 overflow-hidden">
          <div className={`w-full sm:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950/50 ${activeConv ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suhbatlar</div>
            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-slate-800/60">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConv?.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return <button key={conv.id} onClick={() => onSelectChat(conv.id)} className={`flex w-full min-w-0 items-start gap-2.5 p-3 text-left transition-colors cursor-pointer ${isActive ? 'bg-white dark:bg-slate-900 border-l-4 border-indigo-600 shadow-2xs' : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'}`}>
                  <img src={conv.listingImage} alt="" loading="lazy" decoding="async" className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800" />
                  <div className="flex-1 min-w-0">
                    <div className="flex min-w-0 items-center justify-between gap-2"><span className="text-xs font-bold text-slate-900 dark:text-white truncate">{conv.sellerName}</span><span className="text-[10px] text-slate-400 shrink-0">{formatDisplayDate(conv.lastUpdated)}</span></div>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-0.5">{conv.listingTitle}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{lastMsg ? lastMsg.text : 'Xabar yo\'q'}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className="mt-0.5 min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{conv.unreadCount > 99 ? '99+' : conv.unreadCount}</span>}
                </button>;
              })}
            </div>
          </div>

          {activeConv ? <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex min-w-0 items-center justify-between gap-2 p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={() => onSelectChat('')} aria-label="Suhbatlar ro'yxati" className="sm:hidden shrink-0 p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><ArrowLeft size={18} /></button>
                <img src={activeConv.sellerAvatar} alt="" loading="lazy" decoding="async" className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                <div className="min-w-0"><h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{activeConv.sellerName}</h4><span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Suhbat</span></div>
              </div>
              <div className="flex items-center gap-1.5 max-w-[42%] bg-white dark:bg-slate-800 px-1.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <img src={activeConv.listingImage} alt="" loading="lazy" decoding="async" className="w-7 h-7 rounded-lg object-cover shrink-0" />
                <div className="text-right hidden sm:block min-w-0"><div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{formatPrice(activeConv.listingPrice, activeConv.listingCurrency, currency)}</div></div>
              </div>
            </div>

            <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-4 space-y-3 bg-slate-50/60 dark:bg-slate-950/30">
              {activeConv.messages.map((msg) => { const isMe = msg.sender === currentRole; return <div key={msg.id} className={`flex min-w-0 flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[86%] sm:max-w-[80%] min-w-0 break-words whitespace-pre-wrap rounded-2xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm shadow-xs ${isMe ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'}`}>{msg.text}</div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">{formatDisplayDate(msg.timestamp)}</span>
              </div>; })}
              <div ref={messagesEndRef} />
            </div>

            <div className="min-w-0 bg-slate-50/90 dark:bg-slate-950/80 px-2.5 sm:px-3 py-2 border-t border-slate-200/90 dark:border-slate-800 shrink-0">
              <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5 overscroll-contain">
                <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold"><Zap size={13} className="fill-indigo-500 text-indigo-500 shrink-0" /><span>{t.quickQuestions}</span></div>
                {[{ id: 'available', text: t.quickQ1, icon: HelpCircle }, { id: 'price', text: t.quickQ2, icon: Tag }, { id: 'meet', text: t.quickQ3, icon: Calendar }, { id: 'delivery', text: t.quickQ4, icon: Truck }, { id: 'pickup', text: t.quickQ5, icon: MapPin }].map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => handleSend(item.text)} className="group inline-flex items-center gap-1.5 shrink-0 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"><Icon size={13} className="text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" /><span>{item.text}</span></button>; })}
              </div>
            </div>

            {sendError && <p role="alert" className="px-3 py-2 text-sm text-red-600">{sendError}</p>}
            {sending && <p role="status" className="px-3 text-sm">Yuborilmoqda…</p>}
            <div className="p-2.5 sm:p-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex min-w-0 items-center gap-2 shrink-0">
              <input type="text" inputMode="text" autoComplete="off" enterKeyHint="send" disabled={sending} maxLength={2000} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder={t.typeMessagePlaceholder} className="min-w-0 flex-1 w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 p-2.5 text-xs sm:text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
              <button onClick={() => handleSend()} disabled={sending || !inputText.trim()} aria-label="Yuborish" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"><Send size={16} className="text-white" /></button>
            </div>
          </div> : <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-6 text-center text-slate-400"><MessageSquare size={48} className="mb-2 opacity-40" /><p className="text-sm font-semibold">{t.noChats}</p></div>}
        </div>
      </div>
    </div>
  );
};