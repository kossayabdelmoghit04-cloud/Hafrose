/**
 * CATALOG FEATURE — Barrel Export
 *
 * Responsibility: Product discovery, browsing, search and filtering.
 * Contains: Product listing, product detail, category navigation.
 * Consumes: productsService, TanStack Query
 *
 * Internal structure:
 *   components/  — ProductGrid, ProductCard, ProductFilters, CategoryNav, ProductGallery
 *   hooks/       — useProducts, useProductDetail, useCategories, useProductFilters
 *   pages/       — CatalogPage, ProductDetailPage
 *   types/       — ProductFilterState
 */
export * from './hooks/useProducts';
export * from './hooks/useProductDetail';
export * from './hooks/useCategories';
