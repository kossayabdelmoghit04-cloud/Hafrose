export interface LazyImageProps {
  /** Image source URL */
  src: string;
  /** Accessible alt text — never omit */
  alt: string;
  /** Responsive srcset attribute */
  srcSet?: string;
  /** Responsive sizes attribute */
  sizes?: string;
  /** Optional WebP source URL for <picture> wrapper */
  webpSrc?: string;
  /** CSS class applied to the <img> element */
  className?: string;
  /** CSS class applied to the wrapper <div> */
  wrapperClassName?: string;
  /** Intrinsic width (px) — used for aspect-ratio CLS prevention */
  width?: number;
  /** Intrinsic height (px) — used for aspect-ratio CLS prevention */
  height?: number;
  /** fetchpriority — use "high" for above-the-fold hero images */
  priority?: boolean;
  /** Fallback src shown when the image fails to load */
  fallbackSrc?: string;
  /** Object-fit strategy */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Placeholder color while image is loading (CSS color string) */
  placeholderColor?: string;
  /** onClick handler */
  onClick?: () => void;
}
