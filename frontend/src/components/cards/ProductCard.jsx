import { memo } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';
import Card from '../ui/Card';

/**
 * Premium Product Card — Luxury Card System
 * Memoized to prevent redundant renders under parent filter/search triggers.
 */
function ProductCard({ product }) {
  const isAvailable = product.stock > 0;
  const isFeatured = product.is_featured;

  return (
    <Card
      as={Link}
      to={`/product/${product.slug}`}
      variant="product"
      size="md"
      aria-label={product.name}
      className="group"
    >
      {/* ── Badge Row ── */}
      {(isFeatured || !isAvailable) && (
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {isFeatured && <Card.Badge variant="featured" position="static">Exclusif</Card.Badge>}
          {!isAvailable && <Card.Badge variant="unavailable" position="static">Indisponible</Card.Badge>}
        </div>
      )}

      {/* ── Image Container ── */}
      <Card.Media ratio="3/4">
        <Card.Image
          src={getProductImage(product)}
          alt={product.name}
          zoom={true}
        />

        {/* ── Quick View Overlay ── */}
        <Card.Overlay className="group-hover:opacity-100 group-hover:translate-y-0">
          <span className="bg-card-bg-primary text-card-color-title font-sans text-[10px] font-medium tracking-[0.30em] uppercase px-6 py-2.5">
            Aperçu rapide
          </span>
        </Card.Overlay>
      </Card.Media>

      {/* ── Product Info ── */}
      <Card.Body className="p-card-md text-center">
        <Card.Content className="gap-1">
          {product.material && (
            <Card.Meta>{product.material}</Card.Meta>
          )}
          <Card.Title className="group-hover:text-card-color-accent transition-colors duration-300">
            {product.name}
          </Card.Title>
        </Card.Content>

        <Card.Footer className="justify-center gap-2 border-t border-card-border-editorial pt-3">
          <Card.Price>{formatPrice(product.price)}</Card.Price>
          {isAvailable ? (
            <Card.Badge variant="available" position="static">Disponible</Card.Badge>
          ) : (
            <Card.Badge variant="unavailable" position="static">Indisponible</Card.Badge>
          )}
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}

export default memo(ProductCard);
