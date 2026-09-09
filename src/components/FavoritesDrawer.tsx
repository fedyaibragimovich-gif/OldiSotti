import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';
import { getTranslation } from '../data/translations';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  favoriteListings: Listing[];
  onRemoveFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  favoriteListings,
  onRemoveFavorite,
  onSelectListing
}) => {
  if (!isOpen) return null;

  const t = getTranslation(lang);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 dark:bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <Heart size={18} className="fill-rose-500 text-rose-500" />
            </div>
            <h3 className="text-base font-bold">{t.favorites}</h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-bold px-2.5 py-0.5 rounded-full">
              {favoriteListings.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          {favoriteListings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3 text-slate-300 dark:text-slate-600">
                <Heart size={32} />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tanlangan e'lonlar yo'q</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Sizga yoqqan e'lonlarni yurakcha belgisini bosish orqali bu yerga saqlab qo'yishingiz mumkin.
              </p>
            </div>
          ) : (
            favoriteListings.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectListing(item);
                  onClose();
                }}
                className="group flex gap-3 p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      {formatPrice(item.price, item.currency, currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(item.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
