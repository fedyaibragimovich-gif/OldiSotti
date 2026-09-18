import React from 'react';
import { categories } from '../data/categories';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';
import { MaintenanceNotice } from './MaintenanceNotice';
import { X, LayoutGrid, Check } from 'lucide-react';

interface CategoriesBarProps {
  lang: Language;
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (subcategoryId: string) => void;
}

// Muted accent cards keep category icons legible in both light and dark themes.
const cardTones = [
  'bg-amber-50/90 dark:bg-amber-950/35',
  'bg-blue-50/90 dark:bg-blue-950/35',
  'bg-emerald-50/90 dark:bg-emerald-950/35',
  'bg-violet-50/90 dark:bg-violet-950/35',
  'bg-rose-50/90 dark:bg-rose-950/35',
  'bg-cyan-50/90 dark:bg-cyan-950/35',
] as const;

export const CategoriesBar: React.FC<CategoriesBarProps> = ({
  lang,
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory
}) => {
  const t = getTranslation(lang);
  const activeCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <section aria-label={t.categoriesTitle} className="bg-gradient-to-b from-indigo-50/45 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/90 dark:border-slate-800 py-5 sm:py-6 w-full max-w-full transition-colors duration-200">
      <MaintenanceNotice lang={lang} />
      <div className="mx-auto max-w-7xl px-3 sm:px-4 w-full">
        {/* Preserve existing filter semantics and reset control. */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <LayoutGrid size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.categoriesTitle}</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{categories.length}</span>
          </div>
          {selectedCategoryId && (
            <button type="button" onClick={() => { onSelectCategory(''); onSelectSubcategory(''); }}
              className="flex min-h-11 items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs cursor-pointer">
              <X size={14} /><span>{t.allCategories}</span>
            </button>
          )}
        </div>

        {/* Two-column mobile bento; larger viewports gain more columns without tiny labels. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 auto-rows-fr gap-2.5 sm:gap-3">
          {categories.map((cat, index) => {
            const isSelected = selectedCategoryId === cat.id;
            const isFeatured = index === 0;
            return (
              <button key={cat.id} id={`cat-btn-${cat.slug}`} type="button" aria-pressed={isSelected}
                onClick={() => {
                  if (isSelected) { onSelectCategory(''); onSelectSubcategory(''); }
                  else { onSelectCategory(cat.id); onSelectSubcategory(''); }
                }}
                className={`group relative flex min-h-[108px] sm:min-h-[118px] items-center gap-2.5 rounded-2xl border p-3 sm:p-4 text-left shadow-sm transition-[box-shadow,border-color,background-color] duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${isFeatured ? 'col-span-2 flex-row sm:flex-row' : 'flex-col justify-center text-center'} ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-100/90 dark:bg-indigo-950/70 ring-2 ring-indigo-500/60'
                    : `${cardTones[index % cardTones.length]} border-slate-200/90 dark:border-slate-700/90 hover:border-indigo-300 dark:hover:border-indigo-600`
                }`}>
                {isSelected && <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm"><Check size={12} strokeWidth={3} /></span>}
                <span className={`shrink-0 flex items-center justify-center rounded-2xl shadow-sm ${isFeatured ? 'h-16 w-16 sm:h-[72px] sm:w-[72px]' : 'h-12 w-12 sm:h-14 sm:w-14'} ${cat.iconBg}`}>
                  <CategoryIcon name={cat.iconName} size={isFeatured ? 32 : 28} />
                </span>
                <span className={`min-w-0 text-sm sm:text-base leading-snug break-words ${isFeatured ? 'text-base sm:text-lg text-left' : 'text-center'} ${isSelected ? 'font-bold text-indigo-800 dark:text-indigo-200' : 'font-semibold text-slate-800 dark:text-slate-100'}`}>
                  {cat.name[lang]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategory filters retain their previous IDs, values and click behavior. */}
        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 inline-flex items-center gap-1.5">
                <CategoryIcon name={activeCategory.iconName} size={15} className="text-indigo-500 shrink-0" />
                <span>{t.subcategoriesLabel}</span>
              </span>
              <button type="button" onClick={() => onSelectSubcategory('')}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  !selectedSubcategoryId ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300'
                }`}>
                <CategoryIcon name="Grid" size={13} className={!selectedSubcategoryId ? 'text-white' : 'text-slate-400'} />
                <span>{t.conditionAll}</span>
              </button>
              {activeCategory.subcategories.map((sub) => {
                const isSubSelected = selectedSubcategoryId === sub.id;
                const icon = sub.iconName || 'Layers';
                return (
                  <button key={sub.id} type="button" aria-pressed={isSubSelected} onClick={() => onSelectSubcategory(sub.id)}
                    className={`group inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSubSelected ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400/50' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}>
                    <CategoryIcon name={icon} size={13} className={`transition-colors shrink-0 ${isSubSelected ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                    <span>{sub.name[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
