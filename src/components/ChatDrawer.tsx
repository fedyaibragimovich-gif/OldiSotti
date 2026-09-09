import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowLeft,
  Phone,
  Zap,
  HelpCircle,
  Tag,
  Calendar,
  Truck,
  MapPin
} from 'lucide-react';
import { Conversation, ChatMessage, Language, Currency } from '../types';
import { getTranslation } from '../data/translations';
import { formatPrice } from '../utils/formatters';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onSendMessage: (chatId: string, text: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  conversations,
  activeChatId,
  onSelectChat,
  onSendMessage
}) => {
  const t = getTranslation(lang);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeChatId) || conversations[0];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages, isTyping, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConv) return;

    onSendMessage(activeConv.id, text.trim());
    setInputText('');

    // Simulate seller auto-reply after 1.5s if buyer sent
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responsesUz = [
        "Assalomu alaykum! Ha, albatta. Bemalol qo'ng'iroq qilishingiz mumkin.",
        "Rahmat qiziqish bildirganingiz uchun! Narxidan ozroq o'tib beraman.",
        "Keling, ko'ring, holati juda zo'r, ma'qul kelsa kelishamiz.",
        "Ha, yetkazib berish xizmati bor, viloyatlarga ham jo'nata olamiz."
      ];
      const randomResponse = responsesUz[Math.floor(Math.random() * responsesUz.length)];
      onSendMessage(activeConv.id, randomResponse);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex h-full w-full min-w-0 max-w-2xl flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex min-w-0 items-center justify-between bg-slate-900 px-4 py-3.5 text-white dark:bg-slate-950 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <MessageSquare size={18} />
            </div>
            <h3 className="min-w-0 truncate text-base font-bold sm:text-lg">{t.chatTitle}</h3>
            <span className="shrink-0 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
              {conversations.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="ml-2 shrink-0 cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {/* Left Column: Conversations List (hidden on small screen if chatting) */}
          <div
            className={`w-full shrink-0 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 sm:w-64 ${
              activeConv ? 'hidden sm:flex' : 'flex'
            } min-h-0 flex-col`}
          >
            <div className="border-b border-slate-200 p-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Suhbatlar
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConv?.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectChat(conv.id)}
                    className={`flex w-full min-w-0 items-start gap-2.5 p-3 text-left transition-colors cursor-pointer ${
                      isActive ? 'bg-white dark:bg-slate-900 border-l-4 border-indigo-600 shadow-2xs' : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <img
                      src={conv.listingImage}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs font-bold text-slate-900 dark:text-white">
                          {conv.sellerName}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {conv.lastUpdated}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {conv.listingTitle}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {lastMsg ? lastMsg.text : 'Xabar yo\'q'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Conversation Pane */}
          {activeConv ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-900">
              {/* Active Chat Header */}
              <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    onClick={() => onSelectChat('')}
                    className="shrink-0 cursor-pointer p-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <img
                    src={activeConv.sellerAvatar}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                      {activeConv.sellerName}
                    </h4>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>{t.sellerOnline}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Item pill */}
                <div className="flex min-w-0 max-w-[42%] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800">
                  <img
                    src={activeConv.listingImage}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-lg object-cover"
                  />
                  <div className="hidden min-w-0 text-right sm:block">
                    <div className="truncate text-[11px] font-bold text-slate-900 dark:text-white">
                      {formatPrice(activeConv.listingPrice, activeConv.listingCurrency, currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-slate-50/60 p-4 space-y-3 dark:bg-slate-950/30">
                {activeConv.messages.map((msg) => {
                  const isMe = msg.sender === 'buyer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex min-w-0 flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-xs shadow-xs sm:text-sm ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex w-max max-w-full items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs italic text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                    <span className="ml-1 text-[11px]">{t.replying}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Buttons Bar */}
              <div className="min-w-0 overflow-hidden border-t border-slate-200/90 bg-slate-50/90 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/80">
                <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5 scroll-smooth">
                  <div className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-500/10 px-2 py-1 text-[11px] font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    <Zap size={13} className="shrink-0 fill-indigo-500 text-indigo-500" />
                    <span>{t.quickQuestions}</span>
                  </div>

                  {[
                    { id: 'available', text: t.quickQ1, icon: HelpCircle },
                    { id: 'price', text: t.quickQ2, icon: Tag },
                    { id: 'meet', text: t.quickQ3, icon: Calendar },
                    { id: 'delivery', text: t.quickQ4, icon: Truck },
                    { id: 'pickup', text: t.quickQ5, icon: MapPin },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSend(item.text)}
                        className="group inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                        title={item.text}
                      >
                        <Icon size={13} className="shrink-0 text-slate-400 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                        <span>{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Input Box */}
              <div className="flex min-w-0 items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.typeMessagePlaceholder}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 sm:text-sm"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20 transition-all hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare size={48} className="mb-2 opacity-40" />
              <p className="text-sm font-semibold">{t.noChats}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
