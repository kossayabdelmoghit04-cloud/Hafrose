export interface ProductCardProps {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  imageCardUrl?: string | null;
  categoryName?: string;
  badgeText?: string;
  isWishlisted?: boolean;
  onWishlistToggle?: (id: number) => void;
  onQuickAdd?: (id: number) => void;
  onClick?: (slug: string) => void;
  className?: string;
}
