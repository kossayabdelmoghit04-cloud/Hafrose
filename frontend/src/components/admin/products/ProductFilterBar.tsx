import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Category } from '../../../types/models';

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  onOpenCreateModal: () => void;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-950/80 p-6 rounded-2xl border border-neutral-800/80 shadow-lg">
      <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher un produit (nom, référence)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:border-amber-500/50"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Product Button */}
      <button
        onClick={onOpenCreateModal}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy-800 hover:bg-burgundy-700 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-burgundy-900/40"
      >
        <Plus className="w-4 h-4" />
        <span>Nouveau Produit</span>
      </button>
    </div>
  );
};
