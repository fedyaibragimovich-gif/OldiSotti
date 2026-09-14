import React from 'react';
import { Listing, Currency, Language } from '../types';
import { formatPrice } from '../utils/formatters';

export const PriceHistoryChart = ({ listing, currency, lang }: { listing: Listing; currency: Currency; lang: Language }) => (
  <section className="rounded-2xl p-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
    <h4 className="font-bold">{lang === 'ru' ? 'Текущая цена' : lang === 'oz' ? 'Жорий нарх' : 'Joriy narx'}</h4>
    <p className="mt-2 text-lg font-bold">{formatPrice(listing.price, listing.currency, currency)}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
      {lang === 'ru' ? 'История изменения цены пока не собирается.' : lang === 'oz' ? 'Нарх ўзгаришлари тарихи ҳозирча тўпланмайди.' : 'Narx o‘zgarishlari tarixi hozircha to‘planmaydi.'}
    </p>
  </section>
);
