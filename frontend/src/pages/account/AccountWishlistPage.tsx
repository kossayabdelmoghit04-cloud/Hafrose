import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/ui/ProductCard';
import { LinkButton } from '../../components/ui/LinkButton';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useCartStore } from '../../stores/useCartStore';
import { getImageUrl } from '../../utils/formatters';

export const AccountWishlistPage: React.FC = () => {
  const { items, removeItem, setItems } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleClear = () => {
    setItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="font-serif text-h2 text-neutral-950">Ma Liste d'Envies</h1>
          <p className="text-body-sm text-neutral-600">
            {items.length} création(s) coup de cœur sauvegardée(s) dans votre espace membre.
          </p>
        </div>

        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} leftIcon={<Trash2 className="w-4 h-4 text-error-600" />}>
            Vider la liste
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-md p-8 border border-neutral-200/80 space-y-5 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-powder text-burgundy-500 flex items-center justify-center mx-auto shadow-hafrose-xs">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-h3 text-neutral-950">Votre liste de souhaits est vide</h2>
          <p className="text-body-base text-neutral-600 leading-relaxed">
            Explorez nos dernières collections et enregistrez vos pièces coup de cœur.
          </p>
          <div className="pt-2">
            <LinkButton href="/shop" variant="primary" size="lg">
              Découvrir la Boutique
            </LinkButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item.id} className="space-y-2">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.sale_price}
                  imageUrl={getImageUrl(product.image_url ?? product.image ?? product.media?.[0]?.url ?? null)}
                  imageCardUrl={product.image_card_url ? getImageUrl(product.image_card_url) : undefined}
                  categoryName={product.category?.name}
                  isWishlisted={true}
                  onWishlistToggle={(id) => removeItem(id)}
                  onClick={(slug) => navigate(`/product/${slug}`)}
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    leftIcon={<ShoppingBag className="w-4 h-4" />}
                    onClick={() => addToCart(product, 1)}
                  >
                    Au Panier
                  </Button>
                  <button
                    type="button"
                    aria-label="Supprimer des favoris"
                    onClick={() => removeItem(product.id)}
                    className="p-2.5 text-neutral-400 hover:text-error-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountWishlistPage;
