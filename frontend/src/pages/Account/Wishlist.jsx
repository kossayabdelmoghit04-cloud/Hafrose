import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/cards/ProductCard';
import EmptyWishlist from '../../components/common/EmptyWishlist';
import useSEO from '../../hooks/useSEO';

export default function AccountWishlist() {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();

  useSEO({
    title: 'Mes Favoris — Espace Client',
    description: 'Consultez vos créations d\'exception sauvegardées dans votre liste de désirs.',
  });

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-beige pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-luxury-charcoal">
            Mes Favoris
          </h1>
          <p className="font-sans text-xs text-warm-gray font-light mt-1">
            Vos pièces de maroquinerie d'exception sauvegardées ({wishlistCount} créations).
          </p>
        </div>

        {wishlistCount > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-red-600 transition-colors"
          >
            Tout vider
          </button>
        )}
      </div>

      {wishlistCount === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
