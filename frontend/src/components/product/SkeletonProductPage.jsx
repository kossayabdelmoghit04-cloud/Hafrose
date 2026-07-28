import { memo } from 'react';
import Skeleton from '../ui/Skeleton';

/**
 * SkeletonProductPage — HAFROSE Design System Phase 3
 * Standalone wrapper for the product detail page skeleton.
 */
const SkeletonProductPage = memo(function SkeletonProductPage(props) {
  return <Skeleton.ProductDetail {...props} />;
});

export default SkeletonProductPage;
