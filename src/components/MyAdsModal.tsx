import React, { useState } from 'react';
import { X, Plus, CheckCircle, Trash2, Sparkles, Eye, Layers } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';
import { getTranslation } from '../data/translations';

interface MyAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  myListings: Listing[];
  onMarkAsSold: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onUpgradeToVip: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenPostAd: () => void;
}

export const MyAdsModal: React.FC<MyAdsModalProps> = ({
  isOpen,
  onClose,
  lang,
  currency,
  myListings,
  onMarkAsSold,
  onDeleteListing,
  onUpgradeToVip,
  onSelectListing,
  onOpenPostAd
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');

  if (!isOpen) return null;

  const filteredListings = myListings.filter(l => l.status === activeTab);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Layers size={18} />
            </div>
            <h3 className="text-lg font-bold">{t.myAdsTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 px-6 pt-3">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 mr-6 transition-colors cursor-pointer ${
              activeTab === 'active'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.activeAds} ({myListings.filter(l => l.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sold'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.soldAds} ({myListings.filter(l => l.status === 'sold').length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-slate-900">
          {filteredListings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <p className="text-sm font-semibold">{t.noMyAds}</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenPostAd();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>{t.postAdBtn}</span>
              </button>
            </div>
          ) : (
            filteredListings.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 dark:bg-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-sm transition-all"
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full sm:w-28 h-28 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer"
                  onClick={() => {
                    onSelectListing(item);
                    onClose();
                  }}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          onSelectListing(item);
                          onClose();
                        }}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors"
                      >
                        {item.title}
                      </h4>
                      {item.isVip && (
                        <span className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                      {formatPrice(item.price, item.currency, currency)}
                    </div>
                  </div>

                  {/* Actions toolbar */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {item.status === 'active' && (
                      <button
                        onClick={() => onMarkAsSold(item.id)}
                        className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        <CheckCircle size={13} />
                        <span>{t.markAsSold}</span>
                      </button>
                    )}

                    {!item.isVip && item.status === 'active' && (
                      <button
                        onClick={() => onUpgradeToVip(item.id)}
                        className="flex items-center gap-1 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        <Sparkles size={13} />
                        <span>{t.makeVip}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteListing(item.id)}
                      className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-2.5 py-1 rounded-lg font-semibold transition-colors ml-auto cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>{t.deleteAd}</span>
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
