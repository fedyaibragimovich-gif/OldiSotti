import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, ArrowDown } from 'lucide-react';
import { Language } from '../types';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  displayedCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onLoadMore?: () => void;
  hasMoreToLoad?: boolean;
  isLoadingMore?: boolean;
  lang: Language;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  displayedCount,
  onPageChange,
  onPageSizeChange,
  onLoadMore,
  hasMoreToLoad = false,
  isLoadingMore = false,
  lang
}) => {
  if (totalItems <= 0) return null;

  const visibleCount = Math.min(displayedCount, totalItems);

  // This control uses progressive/cumulative loading: stage 2 means that
  // items from stages 1 and 2 are visible together, not only the second slice.
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const getLabel = () => {
    if (lang === 'ru') {
      return `Показано ${visibleCount} из ${totalItems} объявлений`;
    }
    if (lang === 'oz') {
      return `Жами ${totalItems} та эълондан ${visibleCount} таси кўрсатилмоқда`;
    }
    return `Jami ${totalItems} ta e'londan ${visibleCount} tasi ko'rsatilmoqda`;
  };

  const getLoadMoreLabel = () => {
    const remaining = Math.max(0, totalItems - displayedCount);
    const count = Math.min(pageSize, remaining || pageSize);
    if (lang === 'ru') {
      return `Загрузить ещё ${count} объявлений`;
    }
    if (lang === 'oz') {
      return `Яна ${count} та эълонни кўрсатиш`;
    }
    return `Yana ${count} ta e'lonni ko'rsatish`;
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-5 items-center">
      {/* 1. Primary "Load More" action button */}
      {hasMoreToLoad && onLoadMore && (
        <div className="w-full flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoadingMore ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{lang === 'ru' ? 'Загрузка...' : lang === 'oz' ? 'Юкланмоқда...' : 'Yuklanmoqda...'}</span>
              </>
            ) : (
              <>
                <ArrowDown size={18} className="animate-bounce" />
                <span>{getLoadMoreLabel()}</span>
              </>
            )}
          </button>
          <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((displayedCount / totalItems) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Secondary Bar: cumulative status + loading-stage navigation + batch size */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
        {/* Total stats */}
        <div className="text-center md:text-left">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{getLabel()}</span>
          {totalPages > 1 && (
            <span className="text-slate-400 dark:text-slate-500 ml-1.5">
              ({lang === 'ru' ? 'Этап' : lang === 'oz' ? 'Босқич' : 'Bosqich'} {currentPage} / {totalPages})
            </span>
          )}
        </div>

        {/* Progressive loading-stage navigator */}
        {totalPages > 1 && (
          <nav aria-label="Progressive loading stages" className="flex items-center gap-1 sm:gap-1.5">
            {/* First & Prev */}
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              aria-label="First loading stage"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous loading stage"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Stage numbers */}
            {getPageNumbers().map((p, idx) =>
              typeof p === 'number' ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={p === currentPage ? 'step' : undefined}
                  className={`min-w-[36px] h-9 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    p === currentPage
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="px-1 text-slate-400 select-none">
                  {p}
                </span>
              )
            )}

            {/* Next & Last */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next loading stage"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last loading stage"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </nav>
        )}

        {/* Batch size options */}
        {onPageSizeChange && totalItems > 12 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{lang === 'ru' ? 'Показывать по:' : lang === 'oz' ? 'Кўрсатиш:' : "Ko'rsatish:"}</span>
            {[12, 24, 48].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  pageSize === size
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
