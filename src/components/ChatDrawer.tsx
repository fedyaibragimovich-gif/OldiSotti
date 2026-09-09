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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <MessageSquare size={18} />
            </div>
            <h3 className="text-base sm:text-lg font-bold">{t.chatTitle}</h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold px-2.5 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Conversations List (hidden on small screen if chatting) */}
          <div
            className={`w-full sm:w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950/50 ${
              activeConv ? 'hidden sm:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Suhbatlar
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConv?.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectChat(conv.id)}
                    className={`flex w-full items-start gap-2.5 p-3 text-left transition-colors cursor-pointer ${
                      isActive ? 'bg-white dark:bg-slate-900 border-l-4 border-indigo-600 shadow-2xs' : 'hover:bg-slate-100 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <img
                      src={conv.listingImage}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.sellerName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {conv.lastUpdated}
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-0.5">
                        {conv.listingTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
              {/* Active Chat Header */}
              <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => onSelectChat('')}
                    className="sm:hidden p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <img
                    src={activeConv.sellerAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeConv.sellerName}
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>{t.sellerOnline}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Item pill */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                  <img
                    src={activeConv.listingImage}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {formatPrice(activeConv.listingPrice, activeConv.listingCurrency, currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60 dark:bg-slate-950/30">
                {activeConv.messages.map((msg) => {
                  const isMe = msg.sender === 'buyer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-1 text-slate-400 text-xs italic bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full w-max border border-slate-200 dark:border-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                    <span className="ml-1 text-[11px]">{t.replying}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Buttons Bar */}
              <div className="bg-slate-50/90 dark:bg-slate-950/80 px-3 py-2 border-t border-slate-200/90 dark:border-slate-800">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scroll-smooth">
                  <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold">
                    <Zap size={13} className="fill-indigo-500 text-indigo-500 shrink-0" />
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
                        className="group inline-flex items-center gap-1.5 shrink-0 rounded-full bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                        title={item.text}
                      >
                        <Icon size={13} className="text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                        <span>{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Input Box */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.typeMessagePlaceholder}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 p-2.5 text-xs sm:text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 shadow-md shadow-indigo-600/20 transition-all shrink-0 cursor-pointer"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare size={48} className="mb-2 opacity-40" />
              <p className="text-sm font-semibold">{t.noChats}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
