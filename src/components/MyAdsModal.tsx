import React, { useState, useRef } from 'react';
import { X, Plus, CheckCircle, Trash2, Sparkles, Layers, Clock3, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';
import { getTranslation } from '../data/translations';
import { updateListingInDb } from '../lib/firebase';

interface MyAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currency: Currency;
  myListings: Listing[];
  onMarkAsSold: (id: string) => Promise<void>;
  onDeleteListing: (id: string) => void;
  onUpgradeToVip: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenPostAd: () => void;
}

type MyAdsTab = 'active' | 'pending' | 'reserved' | 'sold' | 'rejected';

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
  const [activeTab, setActiveTab] = useState<MyAdsTab>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const operationInFlight = useRef(false);
  const [actionError, setActionError] = useState('');

  if (!isOpen) return null;

  const filteredListings = myListings.filter(l => l.status === activeTab);

  const setStatus = async (id: string, status: 'active' | 'reserved' | 'sold') => {
    if (operationInFlight.current) return;
    operationInFlight.current = true;
    setActionError('');
    setUpdatingId(id);
    try {
      if (status === 'sold') await onMarkAsSold(id);
      else await updateListingInDb(id, { status });
    } catch (error) {
      setActionError(lang === 'ru' ? 'Не удалось сохранить. Проверьте соединение и повторите.' : lang === 'oz' ? 'Сақланмади. Интернетни текшириб, қайта урининг.' : 'Saqlanmadi. Internetni tekshirib, qayta urining.');
    } finally {
      operationInFlight.current = false;
      setUpdatingId(null);
    }
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("E'lonni o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.");
    if (ok) onDeleteListing(id);
  };

  const tabClass = (tab: MyAdsTab) => `pb-3 text-xs sm:text-sm font-bold border-b-2 mr-5 transition-colors cursor-pointer whitespace-nowrap ${
    activeTab === tab
      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
  }`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-xs flex justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col my-auto max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400"><Layers size={18} /></div>
            <h3 className="text-lg font-bold">{t.myAdsTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><X size={20} /></button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 px-6 pt-3 overflow-x-auto">
          <button onClick={() => setActiveTab('active')} className={tabClass('active')}>
            {t.activeAds} ({myListings.filter(l => l.status === 'active').length})
          </button>
          <button onClick={() => setActiveTab('pending')} className={tabClass('pending')}>
            Tekshiruvda ({myListings.filter(l => l.status === 'pending').length})
          </button>
          <button onClick={() => setActiveTab('reserved')} className={tabClass('reserved')}>
            Band ({myListings.filter(l => l.status === 'reserved').length})
          </button>
          <button onClick={() => setActiveTab('sold')} className={tabClass('sold')}>
            {t.soldAds} ({myListings.filter(l => l.status === 'sold').length})
          </button>
          <button onClick={() => setActiveTab('rejected')} className={tabClass('rejected')}>
            Rad etilgan ({myListings.filter(l => l.status === 'rejected').length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-slate-900">
          {actionError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">{actionError}</p>}
          {updatingId && <p role="status" className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-300"><Loader2 size={16} className="animate-spin" />{lang === 'ru' ? 'Сохранение…' : lang === 'oz' ? 'Сақланмоқда…' : 'Saqlanmoqda…'}</p>}
          {filteredListings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <p className="text-sm font-semibold">{activeTab === 'pending' ? "Tekshiruvdagi e'lonlar yo‘q" : activeTab === 'rejected' ? "Rad etilgan e'lonlar yo‘q" : t.noMyAds}</p>
              <button
                onClick={() => { onClose(); onOpenPostAd(); }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              ><Plus size={16} /><span>{t.postAdBtn}</span></button>
            </div>
          ) : filteredListings.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-sm transition-all">
              <img src={item.images[0]} alt={item.title} className="w-full sm:w-28 h-28 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer" onClick={() => { onSelectListing(item); onClose(); }} />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 onClick={() => { onSelectListing(item); onClose(); }} className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors">{item.title}</h4>
                    <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                      {item.isVip && <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">VIP</span>}
                      {item.status === 'pending' && <span className="bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Tekshiruvda</span>}
                      {item.status === 'reserved' && <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Band</span>}
                      {item.status === 'sold' && <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Sotilgan</span>}
                      {item.status === 'rejected' && <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Rad etilgan</span>}
                    </div>
                  </div>
                  <div className="text-base font-black text-slate-900 dark:text-white mt-1">{formatPrice(item.price, item.currency, currency)}</div>
                  {item.status === 'pending' && (
                    <p className="mt-2 text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1.5"><Clock3 size={13} /> Admin tekshiruvidan keyin e'lon ommaga ko‘rinadi.</p>
                  )}
                  {item.status === 'rejected' && (
                    <p className="mt-2 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5"><ShieldAlert size={13} className="mt-0.5 shrink-0" /> <span>{item.rejectionReason || "E'lon moderatsiyadan o‘tmadi."}</span></p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {item.status === 'active' && (
                    <>
                      <button disabled={updatingId !== null} onClick={() => setStatus(item.id, 'reserved')} className="flex items-center gap-1 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"><Clock3 size={13} /><span>Band qilish</span></button>
                      <button disabled={updatingId !== null} onClick={() => setStatus(item.id, 'sold')} className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"><CheckCircle size={13} /><span>{t.markAsSold}</span></button>
                    </>
                  )}
                  {item.status === 'reserved' && (
                    <>
                      <button disabled={updatingId !== null} onClick={() => setStatus(item.id, 'active')} className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"><RotateCcw size={13} /><span>Faollashtirish</span></button>
                      <button disabled={updatingId !== null} onClick={() => setStatus(item.id, 'sold')} className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"><CheckCircle size={13} /><span>{t.markAsSold}</span></button>
                    </>
                  )}
                  {!item.isVip && (item.status === 'active' || item.status === 'reserved') && (
                    <button onClick={() => onUpgradeToVip(item.id)} className="flex items-center gap-1 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"><Sparkles size={13} /><span>{t.makeVip}</span></button>
                  )}
                  <button disabled={updatingId !== null} onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 px-2.5 py-1 rounded-lg font-semibold transition-colors ml-auto cursor-pointer"><Trash2 size={13} /><span>{t.deleteAd}</span></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};