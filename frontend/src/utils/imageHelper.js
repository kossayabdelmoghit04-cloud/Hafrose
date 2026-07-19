// Luxury Unsplash images fallback map for the Hafrose catalog
// Thumbnail quality (cards, grids): w=400&q=70
// High-quality (product detail view): w=800&q=80
const PRODUCT_IMAGES = {
  // Sacs
  'sac-a-main-cabas-en-cuir-d-autruche': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=70',
  'pochette-de-soiree-en-satin-et-cristal': 'https://images.unsplash.com/photo-1566150905458-1bf1fc15a7a0?auto=format&fit=crop&w=400&q=70',
  'sac-a-dos-signature-cuir-pleine-fleur': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=70',
  'cabas-de-voyage-en-toile-enduite': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=400&q=70',

  // Bijoux
  'bracelet-jonc-plaque-or-24k': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=70',
  'boucles-d-oreilles-perles-de-culture': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=70',
  'collier-pendentif-diamant-de-synthese': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=70',
  'bague-solitaire-eclat-infini': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=70',

  // Montres
  'chronographe-automatique-heritage': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=400&q=70',
  'montre-squelette-or-rose': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=70',
  'garde-temps-classique-cadran-nacre': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=70',
  'montre-sport-chic-lunette-ceramique': 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=400&q=70',

  // Lunettes
  'lunettes-aviateur-monture-doree': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=70',
  'lunettes-papillon-acetate-ecaille': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=70',
  'lunettes-de-soleil-masque-signature': 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=400&q=70',
  'lunettes-carrees-verres-degrades': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=400&q=70',

  // Ceintures
  'ceinture-classique-boucle-laiton-brosse': 'https://images.unsplash.com/photo-1624222247344-550fb8ecf78d?auto=format&fit=crop&w=400&q=70',
  'ceinture-reversible-cuir-de-veau': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=70',
  'ceinture-fine-cuir-saffiano': 'https://images.unsplash.com/photo-1624222247344-550fb8ecf78d?auto=format&fit=crop&w=400&q=70',
  'ceinture-large-boucle-monogramme': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=70',

  // Portefeuilles
  'compagnon-zippe-cuir-graine': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=70',
  'porte-cartes-minimaliste-en-crocodile': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=70',
  'portefeuille-a-rabat-doublure-soie': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=70',
  'porte-monnaie-signature-monogramme': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=70',
};

// High-quality product image map for the detail view
const PRODUCT_IMAGES_HQ = {
  'sac-a-main-cabas-en-cuir-d-autruche': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
  'pochette-de-soiree-en-satin-et-cristal': 'https://images.unsplash.com/photo-1566150905458-1bf1fc15a7a0?auto=format&fit=crop&w=800&q=80',
  'sac-a-dos-signature-cuir-pleine-fleur': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  'cabas-de-voyage-en-toile-enduite': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
  'bracelet-jonc-plaque-or-24k': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
  'boucles-d-oreilles-perles-de-culture': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  'collier-pendentif-diamant-de-synthese': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  'bague-solitaire-eclat-infini': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  'chronographe-automatique-heritage': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=800&q=80',
  'montre-squelette-or-rose': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  'garde-temps-classique-cadran-nacre': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
  'montre-sport-chic-lunette-ceramique': 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
  'lunettes-aviateur-monture-doree': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
  'lunettes-papillon-acetate-ecaille': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
  'lunettes-de-soleil-masque-signature': 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
  'lunettes-carrees-verres-degrades': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
  'ceinture-classique-boucle-laiton-brosse': 'https://images.unsplash.com/photo-1624222247344-550fb8ecf78d?auto=format&fit=crop&w=800&q=80',
  'ceinture-reversible-cuir-de-veau': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  'ceinture-fine-cuir-saffiano': 'https://images.unsplash.com/photo-1624222247344-550fb8ecf78d?auto=format&fit=crop&w=800&q=80',
  'ceinture-large-boucle-monogramme': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  'compagnon-zippe-cuir-graine': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
  'porte-cartes-minimaliste-en-crocodile': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
  'portefeuille-a-rabat-doublure-soie': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
  'porte-monnaie-signature-monogramme': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
};

const CATEGORY_IMAGES = {
  'sacs': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=70',
  'bijoux': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=70',
  'montres': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=400&q=70',
  'lunettes': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=70',
  'ceintures': 'https://images.unsplash.com/photo-1624222247344-550fb8ecf78d?auto=format&fit=crop&w=400&q=70',
  'portefeuilles': 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=70',
};

const GALLERY_FALLBACKS = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=70',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=70',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=70',
];

const GALLERY_FALLBACKS_HQ = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
];

/**
 * Returns a thumbnail URL for a product image (cards, grids).
 * Uses w=400&q=70 for optimal bandwidth on listing pages.
 */
export function getProductImage(product) {
  if (!product) return GALLERY_FALLBACKS[0];
  if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) {
    return product.image;
  }
  
  const slug = product.slug;
  if (PRODUCT_IMAGES[slug]) return PRODUCT_IMAGES[slug];
  
  // Try matching by category slug
  const catSlug = product.category?.slug || '';
  if (CATEGORY_IMAGES[catSlug]) return CATEGORY_IMAGES[catSlug];
  
  return GALLERY_FALLBACKS[0];
}

/**
 * Returns a high-quality URL for a product image (detail/zoom view).
 * Uses w=800&q=80 for crisp rendering at full size.
 */
export function getProductImageHQ(product) {
  if (!product) return GALLERY_FALLBACKS_HQ[0];
  if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) {
    // If it's a real stored image, return as-is (backend serves its own quality)
    return product.image;
  }
  
  const slug = product.slug;
  if (PRODUCT_IMAGES_HQ[slug]) return PRODUCT_IMAGES_HQ[slug];
  
  const catSlug = product.category?.slug || '';
  if (CATEGORY_IMAGES[catSlug]) {
    return CATEGORY_IMAGES[catSlug].replace('w=400&q=70', 'w=800&q=80');
  }
  
  return GALLERY_FALLBACKS_HQ[0];
}

/**
 * Returns a valid URL for a category image.
 */
export function getCategoryImage(category) {
  if (!category) return GALLERY_FALLBACKS[0];
  if (category.image && (category.image.startsWith('http') || category.image.startsWith('data:'))) {
    return category.image;
  }
  
  const slug = category.slug;
  if (CATEGORY_IMAGES[slug]) return CATEGORY_IMAGES[slug];
  
  return GALLERY_FALLBACKS[0];
}

/**
 * Returns secondary gallery images for the product detail view.
 * Generates high-quality fallbacks if galleries is empty.
 */
export function getProductGallery(product) {
  const list = [];
  if (product?.galleries && product.galleries.length > 0) {
    product.galleries.forEach(g => {
      if (g.image) {
        if (g.image.startsWith('http')) list.push(g.image);
        else list.push(`http://localhost:8000/storage/${g.image}`);
      }
    });
  }
  
  // If empty, generate beautiful fallback gallery with HQ images
  if (list.length === 0) {
    list.push(getProductImageHQ(product));
    list.push(GALLERY_FALLBACKS_HQ[1]);
    list.push(GALLERY_FALLBACKS_HQ[2]);
  }
  
  return list;
}
