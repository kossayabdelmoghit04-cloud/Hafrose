import React from 'react';
import { Edit2, Trash2, Package, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '../../../types/models';
import { ApiPaginationMeta } from '../../../types/api';
import { LazyImage } from '../../ui/LazyImage/LazyImage';
import { Pagination } from '../../ui/Pagination';
import { formatPrice, getImageUrl } from '../../../utils/formatters';

interface ProductTableProps {
  products: Product[];
  meta?: ApiPaginationMeta;
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  meta,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-[11px] font-semibold uppercase text-neutral-400 tracking-wider bg-neutral-900/40">
              <th className="py-3.5 px-4">Visuel</th>
              <th className="py-3.5 px-4">Produit</th>
              <th className="py-3.5 px-4">Catégorie</th>
              <th className="py-3.5 px-4">Prix</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">En Vedette</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-xs">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400">
                  <Package className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <span>Aucun produit trouvé dans le catalogue.</span>
                </td>
              </tr>
            ) : (
              products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 flex-shrink-0">
                      <LazyImage
                        src={getImageUrl(p.image || p.image_url || '')}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white text-sm">{p.name}</p>
                    <p className="text-[10px] text-neutral-400">ID #{p.id} — {p.color || 'Standard'}</p>
                  </td>
                  <td className="py-3 px-4 text-neutral-300">
                    {p.category?.name || 'Général'}
                  </td>
                  <td className="py-3 px-4">
                    {p.sale_price && Number(p.sale_price) < Number(p.price) ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-burgundy-400 text-sm">
                          {formatPrice(Number(p.sale_price))}
                        </span>
                        <span className="text-neutral-500 line-through text-[10px]">
                          {formatPrice(Number(p.price))}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-white text-sm">
                        {formatPrice(Number(p.price))}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {(p.stock ?? 0) > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        {p.stock} en stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/50">
                        Épuisé
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {p.is_featured ? (
                      <CheckCircle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-neutral-600" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="p-4 border-t border-neutral-900 flex justify-center">
          <Pagination
            currentPage={meta.current_page}
            totalPages={meta.last_page}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
