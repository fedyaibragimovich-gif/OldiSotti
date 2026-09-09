import React from 'react';

interface ListingSkeletonProps {
  viewMode?: 'grid' | 'list';
}

/**
 * Individual skeleton loading card matching the layout and aspect-ratio of ListingCard.
 */
export const ListingSkeleton: React.FC<ListingSkeletonProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Image skeleton with shimmer */}
        <div className="relative sm:w-64 h-48 sm:h-auto min-h-[170px] shrink-0 bg-slate-200/80 dark:bg-slate-800 animate-shimmer overflow-hidden">
          {/* Top badge placeholder */}
          <div className="absolute top-2.5 left-2.5 h-4 w-12 rounded-md bg-slate-300/80 dark:bg-slate-700" />
          {/* Bottom count placeholder */}
          <div className="absolute bottom-2.5 right-2.5 h-4 w-14 rounded-md bg-slate-300/80 dark:bg-slate-700" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
          <div>
            {/* Title & Action placeholders */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5 animate-shimmer" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/5 animate-shimmer" />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
              </div>
            </div>

            {/* Price placeholder */}
            <div className="mt-4 space-y-1.5">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-36 animate-shimmer" />
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-24 animate-shimmer" />
            </div>

            {/* Extra tags placeholder */}
            <div className="flex items-center gap-2 mt-3">
              <div className="h-5 w-20 rounded-md bg-slate-100 dark:bg-slate-800 animate-shimmer" />
              <div className="h-5 w-28 rounded-full bg-slate-100 dark:bg-slate-800 animate-shimmer" />
            </div>
          </div>

          {/* Footer location & seller */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-24 animate-shimmer" />
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Thumbnail image placeholder */}
      <div className="relative aspect-4/3 w-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden animate-shimmer">
        {/* Corner badges */}
        <div className="absolute top-2.5 left-2.5 h-4 w-11 rounded-md bg-slate-300/80 dark:bg-slate-700" />
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs" />
          <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs" />
        </div>
        {/* Bottom tags */}
        <div className="absolute bottom-2.5 left-2.5 h-4 w-24 rounded-full bg-slate-300/80 dark:bg-slate-700" />
        <div className="absolute bottom-2.5 right-2.5 h-3.5 w-12 rounded-md bg-slate-300/80 dark:bg-slate-700" />
      </div>

      {/* Body details */}
      <div className="flex-1 p-3.5 flex flex-col justify-between">
        <div>
          {/* Title lines */}
          <div className="space-y-1.5">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6 animate-shimmer" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/5 animate-shimmer" />
          </div>

          {/* Price */}
          <div className="mt-3 space-y-1">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 animate-shimmer" />
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20 animate-shimmer" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-14 animate-shimmer" />
            </div>
          </div>
        </div>

        {/* Location & Time Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3 animate-shimmer" />
          <div className="h-2.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-1/3 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

interface ListingSkeletonGridProps {
  count?: number;
  viewMode?: 'grid' | 'list';
}

/**
 * Renders a grid or list of skeleton cards matching the main feed layout.
 */
export const ListingSkeletonGrid: React.FC<ListingSkeletonGridProps> = ({
  count = 10,
  viewMode = 'grid'
}) => {
  const items = Array.from({ length: count }, (_, index) => index);

  if (viewMode === 'list') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Yuklanmoqda...">
        {items.map((i) => (
          <ListingSkeleton key={`skeleton-list-${i}`} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
      aria-busy="true"
      aria-label="Yuklanmoqda..."
    >
      {items.map((i) => (
        <ListingSkeleton key={`skeleton-grid-${i}`} viewMode="grid" />
      ))}
    </div>
  );
};
