import { memo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

// Handle absolute or relative images outside component definition to avoid function re-creation
const getImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=70&w=400';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `http://localhost:8000/storage/${img}`;
};

/**
 * Premium Category Card — Luxury Card System
 * Memoized to prevent redundant renders when parent elements trigger state changes.
 */
function CategoryCard({ category }) {
  return (
    <Card
      as={Link}
      to={`/shop?category=${category.slug}`}
      variant="category"
      className="aspect-[4/5] w-full"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card.Media ratio="auto" className="w-full h-full">
        {/* Background Image */}
        <Card.Image
          src={getImageUrl(category.image)}
          alt={category.name}
          zoom={true}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card-color-title/70 via-card-color-title/20 to-transparent transition-opacity duration-500" />

        {/* Text Details Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white space-y-2">
          <Card.Badge variant="featured" position="static">
            Collection
          </Card.Badge>
          <Card.Title as="h3" className="text-white text-xl md:text-2xl font-light tracking-wide">
            {category.name}
          </Card.Title>
          {category.description && (
            <Card.Description className="text-[10px] text-white/70 font-sans font-light line-clamp-2 max-w-xs transition-opacity duration-500 opacity-0 group-hover:opacity-100">
              {category.description}
            </Card.Description>
          )}
          
          {/* Subtle line indicator */}
          <div className="w-8 h-[1px] bg-card-color-accent group-hover:w-16 transition-all duration-500 mt-2" />
        </div>
      </Card.Media>
    </Card>
  );
}

export default memo(CategoryCard);
