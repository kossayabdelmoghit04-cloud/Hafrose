export interface CategoryCardProps {
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount?: number;
  onClick?: (slug: string) => void;
  className?: string;
}
