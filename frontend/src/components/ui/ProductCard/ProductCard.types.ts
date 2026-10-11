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
  /**
   * MC-09 — "ACHETER" direct purchase CTA.
   * When provided, renders a prominent "ACHETER" button in the card footer.
   * Caller is responsible for the buy-now logic (add to cart + checkout redirect).
   * Setting `isBuyingNow` to true disables the button and shows a loading state.
   */
  onBuyNow?: (id: number) => void;
  /** True while the buy-now action is in progress for this specific card. */
  isBuyingNow?: boolean;
  onClick?: (slug: string) => void;
  className?: string;
}
