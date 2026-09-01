import React from 'react';
import { Filter } from 'lucide-react';
import { Container } from '../ui/Container';
import { Select } from '../ui/Select';
import { Radio } from '../ui/Radio';
import { Button } from '../ui/Button';
import { FilterDropdown } from './FilterDropdown';
import { Category } from '../../types/models';
import { cn } from '../../utils/cn';

export type SortOption = 'featured' | 'latest' | 'price_asc' | 'price_desc';

interface ShopFilterBarProps {
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  categories: Category[];
  priceMin: string;
  onPriceMinChange: (val: string) => void;
  priceMax: string;
  onPriceMaxChange: (val: string) => void;
  onPriceApply: () => void;
  inStockOnly: boolean;
  onStockToggle: (inStock: boolean) => void;
  onSaleOnly: boolean;
  onSaleToggle: (onSale: boolean) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeFiltersCount: number;
  onOpenMobileFilter: () => void;
}

export const ShopFilterBar: React.FC<ShopFilterBarProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
  priceMin,
  onPriceMinChange,
  priceMax,
  onPriceMaxChange,
  onPriceApply,
  inStockOnly,
  onStockToggle,
  onSaleOnly,
  onSaleToggle,
  sortBy,
  onSortChange,
  activeFiltersCount,
  onOpenMobileFilter,
}) => {
  return (
    <div className="bg-white border-b border-neutral-200/80 shadow-hafrose-xs sticky top-16 md:top-20 z-20">
      <Container>
        {/* Desktop Toolbar */}
        <div className="hidden md:flex items-center justify-between gap-4 py-2.5">
          {/* Left: Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Catégorie */}
            <FilterDropdown
              label={
                selectedCategory !== 'all'
                  ? categories.find((c) => c.slug === selectedCategory)?.name || 'Catégorie'
                  : 'Catégorie'
              }
              isActive={selectedCategory !== 'all'}
            >
              <div className="space-y-1 py-1">
                <Radio
                  name="cat-desktop"
                  label="Toutes les créations"
                  checked={selectedCategory === 'all'}
                  onChange={() => onCategoryChange('all')}
                />
                {categories.map((cat) => (
                  <Radio
                    key={cat.id}
                    name="cat-desktop"
                    label={cat.name}
                    checked={selectedCategory === cat.slug}
                    onChange={() => onCategoryChange(cat.slug)}
                  />
                ))}
              </div>
            </FilterDropdown>

            {/* Prix */}
            <FilterDropdown
              label={priceMin || priceMax ? `Prix (${priceMin || '0'}-${priceMax || '∞'})` : 'Prix'}
              isActive={Boolean(priceMin || priceMax)}
            >
              <div className="space-y-3 w-52 p-1">
                <span className="text-caption text-neutral-500 font-semibold uppercase tracking-wider block">
                  Intervalle de Prix (MAD)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => onPriceMinChange(e.target.value)}
                    className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
                  />
                  <span className="text-neutral-400 text-caption font-bold">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => onPriceMaxChange(e.target.value)}
                    className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={onPriceApply}
                  className="w-full py-1.5 text-body-sm font-medium bg-burgundy-500 text-white rounded-xs hover:bg-burgundy-600 transition-colors shadow-hafrose-xs"
                >
                  Appliquer
                </button>
              </div>
            </FilterDropdown>

            {/* Disponibilité */}
            <FilterDropdown
              label={inStockOnly ? 'En stock' : 'Disponibilité'}
              isActive={inStockOnly}
            >
              <div className="space-y-1 py-1">
                <Radio
                  name="stock-desktop"
                  label="Tous les produits"
                  checked={!inStockOnly}
                  onChange={() => onStockToggle(false)}
                />
                <Radio
                  name="stock-desktop"
                  label="En stock uniquement"
                  checked={inStockOnly}
                  onChange={() => onStockToggle(true)}
                />
              </div>
            </FilterDropdown>

            {/* En Soldes Toggle Button */}
            <button
              type="button"
              onClick={() => onSaleToggle(!onSaleOnly)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xs border text-body-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-500',
                onSaleOnly
                  ? 'border-burgundy-500 bg-burgundy-50 text-burgundy-700 font-semibold shadow-hafrose-xs'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
              )}
            >
              <span>En soldes</span>
              {onSaleOnly && <span className="w-1.5 h-1.5 rounded-full bg-burgundy-500" />}
            </button>
          </div>

          {/* Right: Tri */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-body-sm text-neutral-500 whitespace-nowrap">Trier par :</span>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              options={[
                { value: 'featured', label: 'En vedette' },
                { value: 'latest', label: 'Nouveautés' },
                { value: 'price_asc', label: 'Prix : Croissant' },
                { value: 'price_desc', label: 'Prix : Décroissant' },
              ]}
              className="text-body-sm min-w-[170px]"
            />
          </div>
        </div>

        {/* Mobile Toolbar */}
        <div className="flex md:hidden items-center justify-between gap-3 py-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter className="w-4 h-4" />}
            onClick={onOpenMobileFilter}
            className="text-body-sm font-medium"
          >
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-burgundy-500 text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          <div className="flex items-center gap-1.5">
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              options={[
                { value: 'featured', label: 'En vedette' },
                { value: 'latest', label: 'Nouveautés' },
                { value: 'price_asc', label: 'Prix ↑' },
                { value: 'price_desc', label: 'Prix ↓' },
              ]}
              className="text-body-sm min-w-[140px]"
            />
          </div>
        </div>
      </Container>
    </div>
  );
};
