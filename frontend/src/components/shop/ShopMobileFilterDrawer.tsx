import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Radio } from '../ui/Radio';
import { Button } from '../ui/Button';
import { Category } from '../../types/models';

interface ShopMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
  onResetFilters: () => void;
  totalCount: number;
}

export const ShopMobileFilterDrawer: React.FC<ShopMobileFilterDrawerProps> = ({
  isOpen,
  onClose,
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
  onResetFilters,
  totalCount,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      title="Filtres"
    >
      <div className="p-5 space-y-6">
        {/* Catégories */}
        <div className="space-y-2.5">
          <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 block">
            Catégorie
          </span>
          <Radio
            name="cat-mobile"
            label="Toutes les créations"
            checked={selectedCategory === 'all'}
            onChange={() => {
              onCategoryChange('all');
              onClose();
            }}
          />
          {categories.map((cat) => (
            <Radio
              key={cat.id}
              name="cat-mobile"
              label={cat.name}
              checked={selectedCategory === cat.slug}
              onChange={() => {
                onCategoryChange(cat.slug);
                onClose();
              }}
            />
          ))}
        </div>

        {/* Prix */}
        <div className="space-y-2.5 pt-4 border-t border-neutral-100">
          <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 block">
            Prix (MAD)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => onPriceMinChange(e.target.value)}
              className="w-full border border-neutral-300 rounded-xs px-2.5 py-1.5 text-body-sm focus:outline-none focus:border-burgundy-500"
            />
            <span className="text-neutral-400 font-bold">–</span>
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
            onClick={() => {
              onPriceApply();
              onClose();
            }}
            className="w-full py-2 text-body-sm font-medium bg-burgundy-500 text-white rounded-xs hover:bg-burgundy-600 transition-colors shadow-hafrose-xs"
          >
            Appliquer le prix
          </button>
        </div>

        {/* Disponibilité */}
        <div className="space-y-2.5 pt-4 border-t border-neutral-100">
          <span className="text-caption font-semibold uppercase tracking-wider text-neutral-500 block">
            Disponibilité &amp; Promotions
          </span>
          <Radio
            name="stock-mobile"
            label="Tous les produits"
            checked={!inStockOnly}
            onChange={() => onStockToggle(false)}
          />
          <Radio
            name="stock-mobile"
            label="En stock uniquement"
            checked={inStockOnly}
            onChange={() => onStockToggle(true)}
          />
          <Radio
            name="sale-mobile"
            label="Articles en soldes uniquement"
            checked={onSaleOnly}
            onChange={() => onSaleToggle(true)}
          />
        </div>

        {/* Actions Drawer */}
        <div className="pt-6 border-t border-neutral-200 space-y-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => {
              onResetFilters();
              onClose();
            }}
          >
            Réinitialiser tous les filtres
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={onClose}
          >
            Voir les résultats ({totalCount})
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
