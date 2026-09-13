import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Share2,
  Check,
  BookOpen
} from 'lucide-react';
import { Language } from '../types';
import { InfoTabKey } from '../data/infoPagesData';

interface SafePurchasesSectionProps {
  lang?: Language;
  onOpenPostAd: () => void;
  onExplore: () => void;
  onOpenInfoModal?: (tab: InfoTabKey) => void;
}

export const SafePurchasesSection: React.FC<SafePurchasesSectionProps> = ({
  lang = 'uz',
  onOpenPostAd,
  onExplore,
  onOpenInfoModal
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Render skeleton during initial load to prevent layout shifts during scroll
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Oldisotti O'zbekiston - Xavfsiz xaridlar",
          text: "O'zbekiston bo'ylab xavfsiz va qulay e'lonlar platformasi",
          url
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = {
    uz: {
      safeBadge: 'Xavfsiz xarid bo‘yicha maslahatlar',
      deliveryBadge: 'Sotuvchidan yetkazish',
      verifiedBadge: 'Tekshirilgan e\'lonlar',
      title: 'O\'zbekistonda xavfsiz xaridlar & sotuvchi bilan kelishilgan yetkazish',
      description: 'O\'zbekistonning barcha hududlari bo\'ylab ishonchli bitimlar, xavfsizlik tavsiyalari hamda sotuvchi orqali to\'g\'ridan-to\'g\'ri yetkazib berish yoki olib ketish imkoniyati.',
      postAdBtn: 'E\'lon berish',
      shareBtn: 'Ulashish',
      copiedBtn: 'Nusxalandi!',
      exploreBtn: 'Barcha e\'lonlarni ko\'rish'
    },
    ru: {
      safeBadge: 'Советы по безопасности',
      deliveryBadge: 'Доставка от продавца',
      verifiedBadge: 'Проверенные объявления',
      title: 'Безопасные покупки в Узбекистане & Быстрая доставка Oldisotti',
      description: 'Надежные сделки по всем регионам Узбекистана, проверенные продавцы и возможность прямой доставки или самовывоза.',
      postAdBtn: 'Подать объявление',
      shareBtn: 'Поделиться',
      copiedBtn: 'Скопировано!',
      exploreBtn: 'Все объявления'
    },
    oz: {
      safeBadge: 'Хавфсиз харид маслаҳатлари',
      deliveryBadge: 'Сотувчидан етказиш',
      verifiedBadge: 'Текширилган эълонлар',
      title: 'Ўзбекистонда хавфсиз харидлар & Oldisotti Тезкор етказиш',
      description: 'Ўзбекистоннинг барча ҳудудлари бўйлаб ишончли битимлар, хавфсизлик тавсиялари ҳамда сотувчи орқали тўғридан-тўғри етказиб бериш ёки олиб кетиш имконияти.',
      postAdBtn: 'Эълон бериш',
      shareBtn: 'Улашиш',
      copiedBtn: 'Нусхаланди!',
      exploreBtn: 'Барча эълонларни кўриш'
    }
  }[lang] || {
    safeBadge: 'Xavfsiz xarid bo‘yicha maslahatlar',
    deliveryBadge: 'Sotuvchidan yetkazish',
    verifiedBadge: 'Tekshirilgan e\'lonlar',
    title: 'O\'zbekistonda xavfsiz xaridlar & sotuvchi bilan kelishilgan yetkazish',
    description: 'O\'zbekistonning barcha hududlari bo\'ylab ishonchli bitimlar, xavfsizlik tavsiyalari hamda sotuvchi orqali to\'g\'ridan-to\'g\'ri yetkazib berish yoki olib ketish imkoniyati.',
    postAdBtn: 'E\'lon berish',
    shareBtn: 'Ulashish',
    copiedBtn: 'Nusxalandi!',
    exploreBtn: 'Barcha e\'lonlarni ko\'rish'
  };

  return (
    <section
      id="safe-purchases-section"
      className="w-full bg-slate-900 border-t border-slate-800 text-white py-12 md:py-16 relative overflow-hidden min-h-[380px] sm:min-h-[420px] transition-all duration-300"
      aria-busy={!isHydrated}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isHydrated ? (
          /* SKELETON LOADING STATE: Renders matching geometry & dimensions to prevent layout shifts (CLS = 0) */
          <div
            id="safe-purchases-skeleton"
            className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 animate-pulse"
            aria-label="Loading Safe Purchases Section"
          >
            {/* Pill badges skeleton */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="h-7 w-36 rounded-full bg-slate-800/80 border border-slate-700/50" />
              <div className="h-7 w-40 rounded-full bg-slate-800/80 border border-slate-700/50" />
              <div className="h-7 w-36 rounded-full bg-slate-800/80 border border-slate-700/50" />
            </div>

            {/* Headline skeleton */}
            <div className="space-y-2.5 max-w-3xl mx-auto">
              <div className="h-8 sm:h-10 md:h-12 w-11/12 mx-auto rounded-xl bg-slate-800/90" />
              <div className="h-8 sm:h-10 md:h-12 w-3/4 mx-auto rounded-xl bg-slate-800/90" />
            </div>

            {/* Subtext description skeleton */}
            <div className="space-y-2 max-w-2xl mx-auto pt-1">
              <div className="h-4 w-full rounded-md bg-slate-800/70" />
              <div className="h-4 w-4/5 mx-auto rounded-md bg-slate-800/70" />
            </div>

            {/* Action buttons skeleton */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="h-11 sm:h-12 w-36 sm:w-40 rounded-xl bg-slate-800/90 border border-slate-700/40" />
              <div className="h-11 sm:h-12 w-32 sm:w-36 rounded-xl bg-slate-800/90 border border-slate-700/40" />
              <div className="h-11 sm:h-12 w-48 sm:w-56 rounded-xl bg-slate-800/90 border border-slate-700/40" />
            </div>
          </div>
        ) : (
          /* HYDRATED CONTENT: Seamlessly reveals with smooth fade-in */
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 animate-in fade-in duration-300">
            {/* Badges / Pill tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onOpenInfoModal?.('help')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide transition-all cursor-pointer"
              >
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>{content.safeBadge}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenInfoModal?.('delivery')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide transition-all cursor-pointer"
              >
                <Truck size={16} className="text-indigo-400 shrink-0" />
                <span>{content.deliveryBadge}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenInfoModal?.('rules')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                <span>{content.verifiedBadge}</span>
              </button>
            </div>

            {/* Prominent bold dark-themed headline */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {content.title}
            </h2>

            {/* Clean subtext description */}
            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {content.description}
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                id="safe-section-post-ad-btn"
                type="button"
                onClick={onOpenPostAd}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <span>{content.postAdBtn}</span>
                <ArrowRight size={18} />
              </button>

              <button
                id="safe-section-share-btn"
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-indigo-950/40 cursor-pointer"
                title={content.shareBtn}
              >
                {copied ? (
                  <>
                    <Check size={18} className="text-emerald-300 animate-in zoom-in" />
                    <span className="text-emerald-200">{content.copiedBtn}</span>
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    <span>{content.shareBtn}</span>
                  </>
                )}
              </button>

              <button
                id="safe-section-explore-btn"
                type="button"
                onClick={onExplore}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all cursor-pointer"
              >
                <span>{content.exploreBtn}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
