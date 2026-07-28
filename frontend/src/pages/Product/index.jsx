import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import Turnstile from '../../components/ui/Turnstile';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Skeleton from '../../components/ui/Skeleton';
import { useCart } from '../../context/CartContext';
import { getProductGallery } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';
import useSEO from '../../hooks/useSEO';

// ── Phase 3 Components ──────────────────────────────────────────────────────
import ProductGallery from '../../components/product/ProductGallery';
import ProductBuyBox from '../../components/product/ProductBuyBox';
import ProductTabs from '../../components/product/ProductTabs';
import ProductReviews from '../../components/product/ProductReviews';
import ProductRecommendations, {
  trackProductView,
  getRecentlyViewed,
} from '../../components/product/ProductRecommendations';

export default function Product() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  // ── Product & related data ────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Derived values ────────────────────────────────────────────────────────
  const gallery = useMemo(() => (product ? getProductGallery(product) : []), [product]);
  const avgRating = useMemo(() => {
    return product?.reviews?.length
      ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
      : null;
  }, [product?.reviews]);

  // ── JSON-LD Product schema ────────────────────────────────────────────────
  const productSchema = useMemo(() => {
    if (!product) return null;
    const productUrl = `https://hafrose.com/products/${product.slug}`;
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: gallery,
        sku: product.slug,
        brand: { '@type': 'Brand', name: 'Maison Hafrose' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'EUR',
          price: product.price,
          availability:
            product.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'Maison Hafrose' },
        },
        ...(avgRating && product.reviews?.length
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating,
                reviewCount: product.reviews.length,
                bestRating: 5,
                worstRating: 1,
              },
              review: product.reviews.slice(0, 5).map((r) => ({
                '@type': 'Review',
                author: { '@type': 'Person', name: r.name },
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
                reviewBody: r.comment,
              })),
            }
          : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://hafrose.com/' },
          { '@type': 'ListItem', position: 2, name: 'La Boutique', item: 'https://hafrose.com/shop' },
          { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
        ],
      },
    ];
  }, [product, gallery, avgRating]);

  useSEO({
    title: product ? product.name : 'Chargement...',
    description: product
      ? product.description
      : "Découvrez une création d'exception façonnée à la main par la Maison Hafrose.",
    canonical: product ? `https://hafrose.com/products/${product.slug}` : undefined,
    ogType: 'product',
    ogImage: gallery[0] || 'https://hafrose.com/og-default.jpg',
    schema: productSchema,
  });

  // ── Review form state ─────────────────────────────────────────────────────
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [revWebsite, setRevWebsite] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const turnstileRef = useRef(null);
  const [reviewErrors, setReviewErrors] = useState({});

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchProductData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getBySlug(slug);
      if (res?.success) {
        setProduct(res.data);

        // Track view in localStorage for "Vus Récemment"
        trackProductView(res.data);
        setRecentlyViewed(getRecentlyViewed(res.data.id));

        // Fetch similar products
        const simRes = await productService.getRelated(res.data.id);
        if (simRes?.success) {
          setSimilar(simRes.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Impossible de charger les détails de cette pièce.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // ── Review form submit ────────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!revName.trim()) errs.customer_name = 'Le nom est requis.';
    if (revComment.trim().length < 10) errs.comment = 'Le commentaire doit contenir au moins 10 caractères.';
    if (!captchaToken) errs.captcha = 'Veuillez valider le CAPTCHA.';

    if (Object.keys(errs).length > 0) {
      setReviewErrors(errs);
      Swal.fire({
        icon: 'error',
        title: 'Erreur de validation',
        text: errs.captcha || 'Veuillez remplir tous les champs requis.',
        confirmButtonColor: '#111111',
      });
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await reviewService.create({
        product_id: product.id,
        customer_name: revName,
        rating: revRating,
        comment: revComment,
        website: revWebsite,
        'cf-turnstile-response': captchaToken,
      });
      if (res?.success) {
        Swal.fire({
          title: 'Merci',
          text: "Votre avis a été soumis et sera publié après validation par notre Maison.",
          icon: 'success',
          confirmButtonColor: '#111111',
        });
        setRevName('');
        setRevComment('');
        setRevRating(5);
        setRevWebsite('');
        setCaptchaToken(null);
        setReviewErrors({});
        turnstileRef.current?.reset();
      }
    } catch (err) {
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      if (err.errors) setReviewErrors(err.errors);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.message || 'Soumission impossible.',
        confirmButtonColor: '#111111',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) return <Skeleton.ProductDetail />;
  if (error || !product)
    return (
      <div className="py-32 text-center text-red-500 font-sans">
        {error || 'Création introuvable.'}
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Boutique', path: '/shop' },
          {
            label: product.category?.name || 'Créations',
            path: `/shop?category=${product.category?.slug}`,
          },
          { label: product.name },
        ]}
      />

      {/* ── Main Product Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8 mb-4">
        {/* Gallery — left column */}
        <div className="lg:col-span-7">
          <ProductGallery images={gallery} productName={product.name} />
        </div>

        {/* BuyBox — right column */}
        <div className="lg:col-span-5">
          <ProductBuyBox product={product} />
        </div>
      </div>

      {/* ── Product Tabs (Description / Caractéristiques / Entretien / Livraison) ── */}
      <ProductTabs product={product} />

      {/* ── Reviews Section ── */}
      <ProductReviews
        reviews={product.reviews || []}
        reviewForm={{
          revName,
          setRevName,
          revRating,
          setRevRating,
          revComment,
          setRevComment,
          revWebsite,
          setRevWebsite,
          isSubmitting: isSubmittingReview,
          captchaToken,
          reviewErrors,
          turnstileRef,
          onSubmit: handleReviewSubmit,
        }}
        TurnstileComponent={
          <Turnstile
            ref={turnstileRef}
            onVerify={(token) => {
              setCaptchaToken(token);
              setReviewErrors((prev) => ({ ...prev, captcha: null }));
            }}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        }
      />

      {/* ── Recommendations: Similar & Recently Viewed ── */}
      <ProductRecommendations similar={similar} recentlyViewed={recentlyViewed} />
    </div>
  );
}
