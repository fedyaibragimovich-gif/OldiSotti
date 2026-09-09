import React from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { Language } from '../types';
import { popularBrands, PopularBrand } from '../data/popularBrands';

interface PopularBrandsBarProps {
  lang: Language;
  selectedBrand?: string;
  onSelectBrand: (brandName: string) => void;
}

export const PopularBrandsBar: React.FC<PopularBrandsBarProps> = React.memo(({
  lang,
  selectedBrand,
  onSelectBrand
}) => {
  const titles = {
    uz: {
      heading: 'Ommabob brendlar',
      sub: "O'zbekistondagi eng mashhur brend mahsulotlari",
      all: 'Barcha brendlar',
      clear: 'Tozalash'
    },
    ru: {
      heading: 'Популярные бренды',
      sub: 'Самые востребованные бренды товаров в Узбекистане',
      all: 'Все бренды',
      clear: 'Сбросить'
    },
    oz: {
      heading: 'Оммабоп брендлар',
      sub: 'Ўзбекистондаги энг машҳур бренд маҳсулотлари',
      all: 'Барча брендлар',
      clear: 'Тозалаш'
    }
  }[lang] || {
    heading: 'Ommabob brendlar',
    sub: "O'zbekistondagi eng mashhur brend mahsulotlari",
    all: 'Barcha brendlar',
    clear: 'Tozalash'
  };

  return (
    <div className="w-full my-4 sm:my-6">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
              {titles.heading}
            </h3>
          </div>
        </div>

        {selectedBrand && (
          <button
            type="button"
            onClick={() => onSelectBrand('')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <X size={14} />
            <span>{titles.clear}</span>
          </button>
        )}
      </div>

      {/* Horizontal scrollable brands track */}
      <div
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 touch-auto transform-gpu"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {/* All brands reset button */}
        <button
          type="button"
          onClick={() => onSelectBrand('')}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            !selectedBrand
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span>{titles.all}</span>
        </button>

        {popularBrands.map((brand: PopularBrand) => {
          const isSelected = selectedBrand?.toLowerCase() === brand.name.toLowerCase();
          return (
            <button
              key={brand.id}
              id={`brand-btn-${brand.id}`}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectBrand('');
                } else {
                  onSelectBrand(brand.name);
                }
              }}
              className={`shrink-0 group flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20'
              }`}
            >
              <span className="text-sm shrink-0">{brand.icon}</span>
              <span className="tracking-tight">{brand.name}</span>
              <span
                className={`text-[10px] font-normal px-1.5 py-0.5 rounded-md transition-colors hidden md:inline ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}
              >
                {brand.categoryLabel[lang] || brand.categoryLabel.uz}
              </span>
              {isSelected && <Check size={13} className="text-white shrink-0 ml-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
});
