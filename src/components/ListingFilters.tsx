import React, { useState } from 'react';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { FilterState, Language, SortOption, Condition } from '../types';
import { getTranslation } from '../data/translations';

interface ListingFiltersProps {
  lang: Language;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  lang,
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  viewMode,
  onViewModeChange
}) => {
  const t = getTranslation(lang);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Calculate count of active advanced filters
  let activeFilterCount = 0;
  if (filters.minPrice) activeFilterCount++;
  if (filters.maxPrice) activeFilterCount++;
  if (filters.condition !== 'all') activeFilterCount++;
  if (filters.onlyWithPhoto) activeFilterCount++;
  if (filters.onlyDelivery) activeFilterCount++;
  if (filters.onlyNegotiable) activeFilterCount++;
  if (filters.brand) activeFilterCount++;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: t.sortNewest },
    { value: 'price_asc', label: t.sortPriceAsc },
    { value: 'price_desc', label: t.sortPriceDesc },
    { value: 'popular', label: t.sortPopular }
  ];

  return (
    <div className="mb-6 w-full max-w-full">
      {/* Top filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs w-full transition-colors duration-200">
        {/* Left: Results count */}
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {totalCount} {t.itemsFound}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{t.clearFilters}</span>
            </button>
          )}
        </div>

        {/* Right: Quick actions (Filter modal button, Sort dropdown, Theme toggle, View switch) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Filter Modal Trigger */}
          <button
            id="filter-modal-trigger-btn"
            onClick={() => setFilterModalOpen(true)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal size={15} />
            <span>{t.filterBtn}</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-2xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as SortOption })}
              className="appearance-none rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-3 pr-8 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none cursor-pointer transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-800 dark:text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Kataklar ko'rinishi"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Ro'yxat ko'rinishi"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter badges row */}
      {(activeFilterCount > 0 || filters.brand) && (
        <div className="flex flex-wrap items-center gap-2 mt-2.5 px-1">
          {filters.brand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <span>Brend: {filters.brand}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ brand: undefined })}
                className="hover:text-indigo-900 dark:hover:text-indigo-100 cursor-pointer ml-0.5"
                title="Brendni olib tashlash"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {filters.condition !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>Holat: {filters.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ condition: 'all' })}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer ml-0.5"
              >
                <X size={13} />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>Narx: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ minPrice: '', maxPrice: '' })}
                className="hover:text-slate-900 dark:hover:text-white cursor-pointer ml-0.5"
              >
                <X size={13} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Filter Modal Dialog */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.filterBtn}</h3>
              </div>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-5">
              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.priceRange}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder={t.from}
                      value={filters.minPrice}
                      onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder={t.to}
                      value={filters.maxPrice}
                      onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t.condition}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'new', 'used'] as Condition[]).map((c) => {
                    const isChecked = filters.condition === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onFilterChange({ condition: c })}
                        className={`rounded-xl py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {c === 'all' && t.conditionAll}
                        {c === 'new' && t.conditionNew}
                        {c === 'used' && t.conditionUsed}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {lang === 'uz' ? 'Brend bo\'yicha saralash' : lang === 'ru' ? 'Выбор бренда' : 'Brand Filter'}
                  </label>
                  {filters.brand && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ brand: undefined })}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                    >
                      {lang === 'uz' ? 'Tozalash' : lang === 'ru' ? 'Сброс' : 'Clear'}
                    </button>
                  )}
                </div>

                {/* Popular Brand Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ brand: undefined })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      !filters.brand
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang === 'uz' ? 'Barchasi' : lang === 'ru' ? 'Все' : 'All'}
                  </button>

                  {['Apple', 'Samsung', 'Chevrolet', 'BYD', 'Artel', 'Nike', 'Bosch', 'Sony', 'Xiaomi', 'ASUS'].map((brandName) => {
                    const isSelected = filters.brand?.toLowerCase() === brandName.toLowerCase();
                    return (
                      <button
                        key={brandName}
                        type="button"
                        onClick={() => onFilterChange({ brand: isSelected ? undefined : brandName })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {brandName}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Brand Search Input */}
                <input
                  type="text"
                  placeholder={lang === 'uz' ? 'Boshqa brend nomini kiriting...' : lang === 'ru' ? 'Другой бренд...' : 'Other brand name...'}
                  value={filters.brand || ''}
                  onChange={(e) => onFilterChange({ brand: e.target.value.trim() ? e.target.value : undefined })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 text-xs sm:text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Checkbox toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.onlyWithPhoto}
                    onChange={(e) => onFilterChange({ onlyWithPhoto: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t.withPhotoOnly}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.onlyDelivery}
                    onChange={(e) => onFilterChange({ onlyDelivery: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t.withDeliveryOnly}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={filters.onlyNegotiable}
                    onChange={(e) => onFilterChange({ onlyNegotiable: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t.negotiableOnly}</span>
                </label>
              </div>
            </div>

            {/* Modal actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onResetFilters();
                  setFilterModalOpen(false);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                {t.reset}
              </button>
              <button
                type="button"
                onClick={() => setFilterModalOpen(false)}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-all text-center cursor-pointer"
              >
                {t.apply} ({totalCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
