import React from 'react';
import { Language } from '../types';

interface PopularBrandsBarProps {
  lang: Language;
  selectedBrand?: string;
  onSelectBrand: (brandName: string) => void;
}

/**
 * Popular brands row is intentionally hidden.
 * Brand filtering remains available through the listing filters.
 */
export const PopularBrandsBar: React.FC<PopularBrandsBarProps> = React.memo(() => null);
