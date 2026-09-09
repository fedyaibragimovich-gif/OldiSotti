import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { TrendingDown, TrendingUp, Minus, Sparkles, AlertCircle } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';
import { USD_TO_UZS_RATE } from '../utils/formatters';
import { getTranslation } from '../data/translations';

interface PriceHistoryChartProps {
  listing: Listing;
  currency: Currency;
  lang: Language;
}

interface PricePoint {
  dayLabel: string;
  daysAgo: number;
  rawDate: string;
  price: number;
  formattedPrice: string;
  eventNote?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  listing,
  currency,
  lang
}) => {
  const t = getTranslation(lang);

  // Normalize current price to active display currency
  const normalizedCurrentPrice = useMemo(() => {
    if (listing.currency === currency) {
      return listing.price;
    }
    if (currency === 'USD') {
      return Math.round(listing.price / USD_TO_UZS_RATE);
    }
    return listing.price * USD_TO_UZS_RATE;
  }, [listing.price, listing.currency, currency]);

  // Deterministically generate 30-day price history based on listing properties
  const { data, minPrice, maxPrice, avgPrice, percentageChange, trendType } = useMemo(() => {
    // Generate a deterministic hash from listing ID
    let hash = 0;
    for (let i = 0; i < listing.id.length; i++) {
      hash = (hash * 31 + listing.id.charCodeAt(i)) % 1000;
    }

    // Pattern archetypes:
    // 0: Price dropped recently (popular on classifieds - started higher, reduced to sell) (~65% chance)
    // 1: Steady / fixed price throughout 30 days (~25% chance)
    // 2: Small test increase (~10% chance)
    const patternType = hash % 10 < 6 ? 'drop' : hash % 10 < 9 ? 'stable' : 'rise';

    let dropPercent = 0;
    if (patternType === 'drop') {
      // Drop between 4% and 12%
      dropPercent = 4 + (hash % 9);
    } else if (patternType === 'rise') {
      dropPercent = -(2 + (hash % 5));
    }

    const currentP = normalizedCurrentPrice;
    const initialP = Math.round(currentP * (1 + dropPercent / 100));
    const midP1 = Math.round(initialP * 0.98);
    const midP2 = Math.round((midP1 + currentP) / 2);

    const now = new Date();
    const formatDate = (daysBack: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysBack);
      return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    const points: PricePoint[] = [
      {
        daysAgo: 30,
        dayLabel: t.priceHistory30DaysAgo || '30 k. oldin',
        rawDate: formatDate(30),
        price: initialP,
        formattedPrice: formatPrice(initialP, currency, currency),
        eventNote: patternType === 'drop' ? (lang === 'uz' ? "Boshlang'ich narx" : lang === 'ru' ? "Начальная цена" : "Initial price") : undefined
      },
      {
        daysAgo: 22,
        dayLabel: '22 d.',
        rawDate: formatDate(22),
        price: patternType === 'stable' ? currentP : midP1,
        formattedPrice: formatPrice(patternType === 'stable' ? currentP : midP1, currency, currency)
      },
      {
        daysAgo: 14,
        dayLabel: '14 d.',
        rawDate: formatDate(14),
        price: patternType === 'stable' ? currentP : midP2,
        formattedPrice: formatPrice(patternType === 'stable' ? currentP : midP2, currency, currency),
        eventNote: patternType === 'drop' && dropPercent > 6 ? (lang === 'uz' ? "Chegirma e'lon qilindi" : lang === 'ru' ? "Снижение цены" : "Price reduced") : undefined
      },
      {
        daysAgo: 7,
        dayLabel: '7 d.',
        rawDate: formatDate(7),
        price: currentP,
        formattedPrice: formatPrice(currentP, currency, currency)
      },
      {
        daysAgo: 0,
        dayLabel: t.priceHistoryToday || 'Bugun',
        rawDate: formatDate(0),
        price: currentP,
        formattedPrice: formatPrice(currentP, currency, currency),
        eventNote: lang === 'uz' ? "Joriy narx" : lang === 'ru' ? "Текущая цена" : "Current price"
      }
    ];

    const prices = points.map((p) => p.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const avg = Math.round(prices.reduce((sum, val) => sum + val, 0) / prices.length);
    const pctChange = Math.round(((currentP - initialP) / initialP) * 100);

    return {
      data: points,
      minPrice: minP,
      maxPrice: maxP,
      avgPrice: avg,
      percentageChange: pctChange,
      trendType: patternType
    };
  }, [listing.id, normalizedCurrentPrice, currency, lang, t]);

  // Color scheme based on trend
  const themeColors = useMemo(() => {
    if (percentageChange < 0) {
      return {
        stroke: '#10b981', // Emerald for drop (advantageous for buyer)
        fill: '#10b981',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        icon: TrendingDown
      };
    }
    if (percentageChange > 0) {
      return {
        stroke: '#f59e0b', // Amber for price rise
        fill: '#f59e0b',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
        badgeText: 'text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
        icon: TrendingUp
      };
    }
    return {
      stroke: '#6366f1', // Indigo for steady/stable
      fill: '#6366f1',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      dot: 'bg-indigo-500',
      icon: Minus
    };
  }, [percentageChange]);

  const TrendIcon = themeColors.icon;

  // Domain buffer calculation so line doesn't hit container ceiling/floor
  const yDomain = useMemo(() => {
    const range = maxPrice - minPrice;
    const padding = range === 0 ? minPrice * 0.05 : range * 0.2;
    return [Math.max(0, Math.round(minPrice - padding)), Math.round(maxPrice + padding)];
  }, [minPrice, maxPrice]);

  return (
    <div
      id={`price-history-chart-card-${listing.id}`}
      className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
    >
      {/* Header section */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {t.priceHistoryTitle}
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              30 {lang === 'uz' ? 'kun' : lang === 'ru' ? 'дней' : 'days'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {t.priceHistorySubtitle}
          </p>
        </div>

        {/* Dynamic Trend Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${themeColors.badgeBg} ${themeColors.badgeText}`}
        >
          <span className={`w-2 h-2 rounded-full ${themeColors.dot} animate-pulse`} />
          <TrendIcon size={14} className="shrink-0" />
          <span>
            {percentageChange < 0 ? (
              <>
                {Math.abs(percentageChange)}% {t.priceHistoryDrop}
              </>
            ) : percentageChange > 0 ? (
              <>
                +{percentageChange}% {t.priceHistoryRise}
              </>
            ) : (
              t.priceHistoryStable
            )}
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="mt-3 w-full h-36 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 10, left: 10, bottom: 4 }}
          >
            <defs>
              <linearGradient id={`priceGradient-${listing.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColors.fill} stopOpacity={0.28} />
                <stop offset="95%" stopColor={themeColors.fill} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dayLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              dy={4}
            />
            <YAxis
              domain={yDomain}
              hide
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const point = payload[0].payload as PricePoint;
                  return (
                    <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700/80 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between gap-3">
                        <span>{point.rawDate}</span>
                        {point.eventNote && (
                          <span className="text-emerald-400 font-bold text-[9px] bg-emerald-950/60 px-1 rounded">
                            {point.eventNote}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-black mt-0.5 tracking-tight text-white">
                        {point.formattedPrice}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={themeColors.stroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#priceGradient-${listing.id})`}
              dot={{
                r: 3.5,
                fill: '#ffffff',
                stroke: themeColors.stroke,
                strokeWidth: 2
              }}
              activeDot={{
                r: 6,
                fill: themeColors.stroke,
                stroke: '#ffffff',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 30-day Statistics Pills */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
            {t.priceHistoryMin}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
            {formatPrice(minPrice, currency, currency)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
            {t.priceHistoryAverage}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
            {formatPrice(avgPrice, currency, currency)}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
            {t.priceHistoryMax}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5 block truncate">
            {formatPrice(maxPrice, currency, currency)}
          </span>
        </div>
      </div>

      {/* Decision-making Insight Box */}
      <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 text-xs border border-indigo-100 dark:border-indigo-900/60">
        <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          {percentageChange < 0 ? (
            <span>
              <strong>{t.priceHistoryGoodDeal}:</strong>{' '}
              {lang === 'uz'
                ? `Narx so'nggi 30 kun ichida eng past nuqtada turibdi. Xarid qilish yoki sotuvchi bilan bog'lanish uchun ayni qulay fursat!`
                : lang === 'ru'
                ? `Цена находится на минимальном уровне за 30 дней. Отличный момент для покупки или связи с продавцом!`
                : `The price is currently at its lowest in 30 days. This is a great opportunity to contact the seller and buy!`}
            </span>
          ) : percentageChange > 0 ? (
            <span>
              <strong>{lang === 'uz' ? "Bozor tavsiyasi" : lang === 'ru' ? "Совет покупателю" : "Buying tip"}:</strong>{' '}
              {lang === 'uz'
                ? `Sotuvchi bilan savdolashish (narxni kelishish) tugmasi orqali qulayroq narx taklif qilishingiz mumkin.`
                : lang === 'ru'
                ? `Вы можете предложить продавцу свою цену через чат или торг.`
                : `You can negotiate with the seller through chat to propose a better offer.`}
            </span>
          ) : (
            <span>
              <strong>{lang === 'uz' ? "Narx barqarorligi" : lang === 'ru' ? "Стабильность цены" : "Price stability"}:</strong>{' '}
              {lang === 'uz'
                ? `Ushbu e'lon narxi 30 kun davomida bir xil saqlanib turibdi. Bozor qiymatiga mos taklif hisoblanadi.`
                : lang === 'ru'
                ? `Цена на этот товар стабильна на протяжении 30 дней и соответствует рынку.`
                : `The price for this item has remained stable over 30 days, reflecting consistent market value.`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
