import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  HelpCircle,
  FileText,
  Crown,
  Truck,
  Scale,
  Lock,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Send,
  Mail,
  Zap,
  Sparkles,
  ArrowRight,
  CreditCard,
  RotateCcw,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Language } from '../types';
import {
  InfoTabKey,
  INFO_TABS,
  HELP_FAQS,
  LISTING_RULES_DATA,
  VIP_SERVICES_DATA,
  DELIVERY_TERMS_DATA,
  TERMS_OF_SERVICE_DATA,
  PRIVACY_POLICY_DATA
} from '../data/infoPagesData';

interface InfoPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoTabKey;
  lang: Language;
  onOpenPostAd?: () => void;
}

export const InfoPagesModal: React.FC<InfoPagesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'help',
  lang,
  onOpenPostAd
}) => {
  const [activeTab, setActiveTab] = useState<InfoTabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState<'all' | 'buy' | 'sell' | 'pay' | 'safety' | 'account'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const tabsNavRef = useRef<HTMLDivElement>(null);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Scroll active tab into view in mobile tabs bar
  useEffect(() => {
    if (tabsNavRef.current) {
      const activeBtn = tabsNavRef.current.querySelector<HTMLElement>(`[data-tab-key="${activeTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return HELP_FAQS.filter((item) => {
      if (faqCategory !== 'all' && item.category !== faqCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const questionText = (item.q[lang] || item.q.uz).toLowerCase();
        const answerText = (item.a[lang] || item.a.uz).toLowerCase();
        return questionText.includes(q) || answerText.includes(q);
      }
      return true;
    });
  }, [faqCategory, searchQuery, lang]);

  if (!isOpen) return null;

  const currentTabMeta = INFO_TABS.find((t) => t.key === activeTab) || INFO_TABS[0];

  const handleCopyTelegram = async () => {
    try {
      await navigator.clipboard.writeText('@oldisotti_support');
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2000);
    } catch {
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2000);
    }
  };

  const getTabIcon = (key: InfoTabKey, size = 18, className = '') => {
    switch (key) {
      case 'help':
        return <HelpCircle size={size} className={className} />;
      case 'rules':
        return <FileText size={size} className={className} />;
      case 'vip':
        return <Crown size={size} className={className} />;
      case 'delivery':
        return <Truck size={size} className={className} />;
      case 'terms':
        return <Scale size={size} className={className} />;
      case 'privacy':
        return <Lock size={size} className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden z-10 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 shrink-0">
              {getTabIcon(activeTab, 20)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentTabMeta.title[lang] || currentTabMeta.title.uz}
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                  {currentTabMeta.badge?.[lang] || 'Oldisotti'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {currentTabMeta.subtitle[lang] || currentTabMeta.subtitle.uz}
              </p>
            </div>
          </div>

          <button
            id="close-info-modal-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Yopish (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Bar (Swipeable on mobile) */}
        <div
          ref={tabsNavRef}
          className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-6 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 sm:gap-2 shrink-0"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        >
          {INFO_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`info-tab-btn-${tab.key}`}
                data-tab-key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {getTabIcon(tab.key, 15, isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400')}
                <span>{tab.title[lang] || tab.title.uz}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200">
          {/* TAB 1: Yordam markazi */}
          {activeTab === 'help' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Search Bar inside Help Center */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="help-center-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'ru'
                      ? 'Поиск по вопросам (например: оплата, доставка, блокировка)...'
                      : lang === 'oz'
                      ? 'Саволингизни қидиринг (масалан: тўлов, етказиш, хавфсизлик)...'
                      : 'Savolingizni qidiring (masalan: to\'lov, yetkazish, xavfsizlik)...'
                  }
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Quick Topics Filter */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {[
                  { key: 'all', label: { uz: 'Barcha savollar', ru: 'Все вопросы', oz: 'Барча саволлар' } },
                  { key: 'buy', label: { uz: '🛍️ Xarid qilish', ru: '🛍️ Покупки', oz: '🛍️ Харид қилиш' } },
                  { key: 'sell', label: { uz: '📦 E\'lon berish', ru: '📦 Публикация', oz: '📦 Эълон бериш' } },
                  { key: 'safety', label: { uz: '🛡️ Xavfsizlik', ru: '🛡️ Безопасность', oz: '🛡️ Хавфсизлик' } },
                  { key: 'pay', label: { uz: '💳 To\'lov & VIP', ru: '💳 Оплата & VIP', oz: '💳 Тўлов & VIP' } },
                  { key: 'account', label: { uz: '👤 Profil & Hisob', ru: '👤 Аккаунт', oz: '👤 Профил & Ҳисоб' } }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFaqCategory(item.key as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      faqCategory === item.key
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label[lang] || item.label.uz}
                  </button>
                ))}
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3 max-w-3xl mx-auto">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden transition-all shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full flex items-center justify-between p-4 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <span className="pr-4">{faq.q[lang] || faq.q.uz}</span>
                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-indigo-600' : ''
                            }`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
                            {faq.a[lang] || faq.a.uz}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">Hech qanday ma'lumot topilmadi.</p>
                  </div>
                )}
              </div>

              {/* Live Support Channel Cards */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <h3 className="text-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  {lang === 'ru'
                    ? 'Служба поддержки пользователей'
                    : lang === 'oz'
                    ? 'Жонли қўллаб-қувватлаш хизмати'
                    : 'Jonli qo\'llab-quvvatlash xizmati'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
                  {/* Telegram */}
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1 font-bold text-sm">
                        <Send size={16} />
                        <span>Telegram Bot</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tezkor 5-10 daqiqada rasmiy yordam olish
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyTelegram}
                      className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>{copiedTelegram ? 'Nusxalandi!' : '@oldisotti_support'}</span>
                      {copiedTelegram ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1 font-bold text-sm">
                        <Phone size={16} />
                        <span>Call-markaz</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Har kuni soat 09:00 dan 21:00 gacha
                      </p>
                    </div>
                    <a
                      href="tel:+998712000000"
                      className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                    >
                      <span>+998 71 200-00-00</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1 font-bold text-sm">
                        <Mail size={16} />
                        <span>Email so'rov</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Hamkorlik va rasmiy xatlar uchun
                      </p>
                    </div>
                    <a
                      href="mailto:support@oldisotti.uz"
                      className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                    >
                      <span>support@oldisotti.uz</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: E'lon joylashtirish qoidalari */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Alert Warning Box */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Qoidalarga qat'iy rioya qiling!</h4>
                  <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80 text-xs">
                    Oldisotti platformasida e'lonlar avtomatlashtirilgan va qo'lda tekshiriluvchi (moderatsiya) tizimidan o'tadi. Taqiqlangan tovarlar yoki yolg'on ma'lumot kiritilgan taqdirda e'lon darhol bloklanadi.
                  </p>
                </div>
              </div>

              {/* Prohibited items list */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-black">
                    ✕
                  </span>
                  <span>Taqiqlangan mahsulot va xizmatlar (Qat'iy taqiq)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LISTING_RULES_DATA.prohibitedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20"
                    >
                      <h5 className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400">
                        {item.title[lang] || item.title.uz}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.desc[lang] || item.desc.uz}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Posting requirements */}
              <div className="pt-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 text-xs font-black">
                    ✓
                  </span>
                  <span>E'lon qabul qilinishi uchun asosiy talablar</span>
                </h3>
                <div className="space-y-3">
                  {LISTING_RULES_DATA.postingRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-start gap-3"
                    >
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {req.title[lang] || req.title.uz}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {req.desc[lang] || req.desc.uz}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              {onOpenPostAd && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      Qoidalar bilan tanishdingizmi?
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Endi birinchi e'loningizni mutlaqo bepul joylashtirishingiz mumkin.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPostAd();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>E'lon berish</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pullik xizmatlar va VIP tariflar */}
          {activeTab === 'vip' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center max-w-xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
                  <Sparkles size={14} />
                  <span>3 baravargacha tezroq va manfaatli sotuv</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  VIP Lenta va Yuqoriga ko'tarish tariflari
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Har kuni 100 000 dan ortiq xaridorlar diqqat markazida bo'ling.
                </p>
              </div>

              {/* Tariffs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {VIP_SERVICES_DATA.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-2xl border ${service.borderColor} bg-white dark:bg-slate-800/80 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden`}
                  >
                    {/* Top Ribbon Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {service.badge[lang] || service.badge.uz}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {service.duration[lang] || service.duration.uz}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {service.name[lang] || service.name.uz}
                      </h4>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {service.priceUZS}
                        </span>
                        <span className="text-xs font-bold text-slate-400">so'm</span>
                      </div>

                      {/* Feature check items */}
                      <ul className="mt-4 space-y-2.5">
                        {service.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat[lang] || feat.uz}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPostAd?.();
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r ${service.color} hover:opacity-90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5`}
                      >
                        <Zap size={15} />
                        <span>Faollashtirish</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supported payment systems */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    O'zbekistondagi barcha xavfsiz to'lov tizimlari orqali:
                  </span>
                </div>
                <div className="flex items-center gap-3 font-bold text-slate-600 dark:text-slate-300">
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Payme
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Click Up
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Uzum Pay
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    Uzcard / Humo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Sotuvchidan yetkazish shartlari */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <ShieldCheck size={22} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <h4 className="font-bold text-indigo-950 dark:text-indigo-200">
                    Xavfsiz xarid va yetkazib berish kafolati
                  </h4>
                  <p className="mt-0.5 text-indigo-900/80 dark:text-indigo-300/80 text-xs leading-relaxed">
                    Sotuvchi tomonidan yetkazib beriladigan tovarlar bo'yicha shartlar bevosita sotuvchi bilan kelishiladi. Hech qachon tovar qo'lingizga tegmasdan oldin to'liq pul o'tkazmang!
                  </p>
                </div>
              </div>

              {/* Delivery Types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DELIVERY_TERMS_DATA.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-2xs"
                  >
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      {item.title[lang] || item.title.uz}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc[lang] || item.desc.uz}
                    </p>
                  </div>
                ))}
              </div>

              {/* Step by step safe dealing steps */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Xaridor uchun xavfsiz qabul qilish bosqichlari:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base block mb-1">1</span>
                    <strong className="block text-slate-900 dark:text-white mb-0.5">Bog'laning va kelishing</strong>
                    <span className="text-slate-500 dark:text-slate-400">Yetkazish narxi va vaqtini aniqlashtirib oling.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base block mb-1">2</span>
                    <strong className="block text-slate-900 dark:text-white mb-0.5">Qutisini ochib ko'ring</strong>
                    <span className="text-slate-500 dark:text-slate-400">Tovar nuqsonlarsiz va e'longa mos ekanini tekshiring.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base block mb-1">3</span>
                    <strong className="block text-slate-900 dark:text-white mb-0.5">Shundan so'ng to'lang</strong>
                    <span className="text-slate-500 dark:text-slate-400">Faqat to'liq rozi bo'lganingizdan so'ng hisob-kitob qiling.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Foydalanish shartlari */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-200 max-w-4xl mx-auto">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Oxirgi yangilanish: 2026-yil 1-fevral. Mazkur hujjat Oldisotti xizmatlaridan foydalanish bo'yicha ommaviy ofertadir.
                </p>
              </div>

              {TERMS_OF_SERVICE_DATA.map((section, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {section.title[lang] || section.title.uz}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {section.content[lang] || section.content.uz}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: Maxfiylik siyosati */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-200 max-w-4xl mx-auto">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck size={18} className="shrink-0" />
                <span>
                  O'zbekiston Respublikasining <strong>"Shaxsga doir ma'lumotlar to'g'risida"</strong>gi Qonuniga muvofiq kafolatlangan.
                </span>
              </div>

              {PRIVACY_POLICY_DATA.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {sec.title[lang] || sec.title.uz}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.content[lang] || sec.content.uz}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions inside modal */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Oldisotti © 2026 — O'zbekiston</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
