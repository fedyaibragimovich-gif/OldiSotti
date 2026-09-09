import React from 'react';
import { categories } from '../data/categories';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { CategoryIcon } from './CategoryIcon';
import { X, LayoutGrid, Check } from 'lucide-react';

interface CategoriesBarProps {
  lang: Language;
  selectedCategoryId: string;
  selectedSubcategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (subcategoryId: string) => void;
}

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
    <section aria-label={t.categoriesTitle} className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 py-5 sm:py-6 w-full max-w-full overflow-hidden transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 w-full">
        {/* Header with Title and Reset */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {t.categoriesTitle}
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {categories.length}
            </span>
          </div>

          {selectedCategoryId && (
            <button
              type="button"
              onClick={() => {
                onSelectCategory('');
                onSelectSubcategory('');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs cursor-pointer"
            >
              <X size={14} />
              <span>{t.allCategories}</span>
            </button>
          )}
        </div>

        {/* Main Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5 sm:gap-3 text-center">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.slug}`}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onSelectCategory('');
                    onSelectSubcategory('');
                  } else {
                    onSelectCategory(cat.id);
                    onSelectSubcategory('');
                  }
                }}
                className={`group relative flex flex-col items-center p-2 sm:p-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border-2 border-indigo-600 dark:border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/80 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-xs'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xs">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}

                {/* Squircle Icon Container */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-2xs ${cat.iconBg} ${
                    isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900' : ''
                  }`}
                >
                  <CategoryIcon name={cat.iconName} size={24} />
                </div>

                {/* Category Name */}
                <span
                  className={`mt-2 text-xs leading-snug transition-colors line-clamp-2 ${
                    isSelected
                      ? 'font-bold text-indigo-700 dark:text-indigo-300'
                      : 'font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                >
                  {cat.name[lang]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategories pill strip with dedicated icons */}
        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 inline-flex items-center gap-1.5">
                <CategoryIcon name={activeCategory.iconName} size={15} className="text-indigo-500 shrink-0" />
                <span>{t.subcategoriesLabel}</span>
              </span>

              {/* All subcategories button with icon */}
              <button
                type="button"
                onClick={() => onSelectSubcategory('')}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  !selectedSubcategoryId
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300'
                }`}
              >
                <CategoryIcon name="Grid" size={13} className={!selectedSubcategoryId ? 'text-white' : 'text-slate-400'} />
                <span>{t.conditionAll}</span>
              </button>

              {/* Subcategory buttons with individual icon set */}
              {activeCategory.subcategories.map((sub) => {
                const isSubSelected = selectedSubcategoryId === sub.id;
                const icon = sub.iconName || 'Layers';
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onSelectSubcategory(sub.id)}
                    className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isSubSelected
                        ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400/50'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                  >
                    <CategoryIcon
                      name={icon}
                      size={13}
                      className={`transition-colors shrink-0 ${
                        isSubSelected
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                      }`}
                    />
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
