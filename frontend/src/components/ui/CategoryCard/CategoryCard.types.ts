export interface CategoryCardProps {
  name: string;
  slug: string;
  imageUrl?: string | null;
  imageCardUrl?: string | null;
  productCount?: number;
  onClick?: (slug: string) => void;
  className?: string;
}
