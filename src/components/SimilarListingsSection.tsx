import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Layers, Tag, MapPin, Heart, ArrowRight, Filter } from 'lucide-react';
import { Listing, Currency, Language } from '../types';
import { formatPrice, formatPriceSecondary } from '../utils/formatters';
import { categories } from '../data/categories';
import { regions } from '../data/locations';
import { getTranslation } from '../data/translations';

interface SimilarListingsSectionProps {
  currentListing: Listing;
  allListings: Listing[];
  currency: Currency;
  lang: Language;
  favorites?: string[];
  onToggleFavorite: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const SimilarListingsSection: React.FC<SimilarListingsSectionProps> = ({
  currentListing,
  allListings,
  currency,
  lang,
  favorites = [],
  onToggleFavorite,
  onSelectListing
}) => {
  const t = getTranslation(lang);

  // Category & subcategories for the current listing
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === currentListing.categoryId);
  }, [currentListing.categoryId]);

  const currentSubcategory = useMemo(() => {
    if (!currentCategory || !currentListing.subcategoryId) return null;
    return currentCategory.subcategories.find((s) => s.id === currentListing.subcategoryId);
  }, [currentCategory, currentListing.subcategoryId]);

  // Active filter state: defaults to current subcategory if available, or 'all'
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>(() => {
    return currentListing.subcategoryId || 'all';
  });

  // Whenever the active listing changes, sync filter to its subcategory
  useEffect(() => {
    setSelectedSubcategoryId(currentListing.subcategoryId || 'all');
  }, [currentListing.id, currentListing.subcategoryId]);

  // All listings in the same category (excluding current)
  const categoryListings = useMemo(() => {
    return allListings.filter(
      (item) => item.status === 'active' && item.categoryId === currentListing.categoryId && item.id !== currentListing.id
    );
  }, [allListings, currentListing.categoryId, currentListing.id]);

  // Available subcategories that actually have listings in this category
  const availableSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.subcategories.filter((sub) =>
      categoryListings.some((item) => item.subcategoryId === sub.id)
    );
  }, [currentCategory, categoryListings]);

  // Filter and rank listings
  const filteredAndRankedListings = useMemo(() => {
    let pool = categoryListings;

    // If a specific subcategory is selected, filter by it
    if (selectedSubcategoryId !== 'all') {
      pool = pool.filter((item) => item.subcategoryId === selectedSubcategoryId);
    }

    // Score for intelligent relevance
    const scored = pool.map((item) => {
      let score = 0;

      // Same subcategory match boost
      if (item.subcategoryId === currentListing.subcategoryId) {
        score += 50;
      }

      // Brand match boost
      if (
        currentListing.brand &&
        item.brand &&
        item.brand.toLowerCase() === currentListing.brand.toLowerCase()
      ) {
        score += 30;
      }

      // Price proximity score (items within 40% range of current price)
      if (currentListing.price > 0) {
        const ratio = item.price / currentListing.price;
        if (ratio >= 0.6 && ratio <= 1.4) {
          score += 20;
        }
      }

      // VIP / Top status
      if (item.isVip) score += 15;
      if (item.isTop) score += 10;

      return { item, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.map((s) => s.item).slice(0, 8);
  }, [categoryListings, selectedSubcategoryId, currentListing]);

  // Helper to format item location
  const getLocationName = (item: Listing) => {
    const reg = regions.find((r) => r.id === item.location.region);
    return reg ? (reg.name[lang] || reg.name.uz || reg.name.ru) : item.location.region;
  };

  // If there are no other listings in this category at all, hide section
  if (categoryListings.length === 0) {
    return null;
  }

  return (
    <div
      id="similar-listings-section"
      className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 transition-colors"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t.similarAds}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {categoryListings.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.similarListingsSubtitle}
          </p>
        </div>

        {/* Current category breadcrumb pill */}
        {currentCategory && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Layers size={14} className="text-indigo-500" />
            <span className="font-semibold">{currentCategory.name[lang]}</span>
            {currentSubcategory && (
              <>
                <span className="text-slate-400">/</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {currentSubcategory.name[lang]}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Category & Subcategory Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {/* 'All in this Category' Tab */}
        <button
          type="button"
          id="filter-similar-all"
          onClick={() => setSelectedSubcategoryId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedSubcategoryId === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Filter size={13} />
          <span>{t.allInCategory}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedSubcategoryId === 'all'
                ? 'bg-indigo-500/80 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {categoryListings.length}
          </span>
        </button>

        {/* Subcategory Specific Tabs */}
        {availableSubcategories.map((sub) => {
          const count = categoryListings.filter((i) => i.subcategoryId === sub.id).length;
          const isCurrentListingSub = currentListing.subcategoryId === sub.id;
          const isSelected = selectedSubcategoryId === sub.id;

          return (
            <button
              key={sub.id}
              type="button"
              id={`filter-similar-${sub.id}`}
              onClick={() => setSelectedSubcategoryId(sub.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {isCurrentListingSub && (
                <Tag size={12} className={isSelected ? 'text-indigo-200' : 'text-indigo-500'} />
              )}
              <span>{sub.name[lang]}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-indigo-500/80 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Listings Grid */}
      {filteredAndRankedListings.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredAndRankedListings.map((sim) => {
            const isFav = favorites.includes(sim.id);
            const isExactSubcategory = sim.subcategoryId === currentListing.subcategoryId;

            return (
              <div
                key={sim.id}
                id={`similar-listing-card-${sim.id}`}
                onClick={() => {
                  onSelectListing(sim);
                }}
                className="group relative flex flex-col bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-950/5 transition-all duration-200 cursor-pointer"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={
                      sim.images[0] ||
                      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={sim.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top-left Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
                    {sim.isVip && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
                        VIP
                      </span>
                    )}
                    {sim.isTop && !sim.isVip && (
                      <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">
                        TOP
                      </span>
                    )}
                    {isExactSubcategory && (
                      <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        {t.sameSubcategoryBadge}
                      </span>
                    )}
                  </div>

                  {/* Favorite toggle button */}
                  <button
                    type="button"
                    id={`btn-fav-similar-${sim.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(sim.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer z-10 ${
                      isFav
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-300 hover:text-rose-500'
                    }`}
                    title={t.favorites}
                  >
                    <Heart
                      size={15}
                      className={isFav ? 'fill-rose-500 text-rose-500' : ''}
                    />
                  </button>

                  {/* Condition / Photo count */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white pointer-events-none">
                    {sim.condition === 'new' ? (
                      <span className="bg-emerald-500/90 font-bold px-1.5 py-0.5 rounded shadow-xs">
                        {lang === 'uz' ? 'Yangi' : lang === 'ru' ? 'Новый' : 'New'}
                      </span>
                    ) : (
                      <span className="bg-slate-900/60 font-medium px-1.5 py-0.5 rounded shadow-xs">
                        {lang === 'uz' ? "B/U" : lang === 'ru' ? "Б/У" : "Used"}
                      </span>
                    )}

                    {sim.images.length > 1 && (
                      <span className="bg-slate-900/70 font-medium px-1.5 py-0.5 rounded shadow-xs">
                        {sim.images.length} {lang === 'uz' ? 'rasm' : lang === 'ru' ? 'фото' : 'photos'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(sim.price, sim.currency, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatPriceSecondary(sim.price, sim.currency)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mt-1 leading-snug">
                      {sim.title}
                    </h4>
                  </div>

                  {/* Location & Time */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[65%]">
                      <MapPin size={11} className="shrink-0 text-slate-400" />
                      <span className="truncate">{getLocationName(sim)}</span>
                    </span>
                    <span className="shrink-0 text-[10px]">{sim.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State for chosen subcategory */
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.noSimilarInSubcategory}
          </p>
          <button
            type="button"
            id="btn-show-all-similar"
            onClick={() => setSelectedSubcategoryId('all')}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span>{t.viewAllSimilarCategory}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
