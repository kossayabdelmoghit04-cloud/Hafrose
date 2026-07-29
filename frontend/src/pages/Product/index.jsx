import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import useRecentlyViewed from '../../hooks/useRecentlyViewed';

// ── Phase 3 & v3.0 Components ────────────────────────────────────────────────
import ProductGallery from '../../components/product/ProductGallery';
import ProductBuyBox from '../../components/product/ProductBuyBox';
import ProductTabs from '../../components/product/ProductTabs';
import ProductReviews from '../../components/product/ProductReviews';
import ProductRecommendations from '../../components/product/ProductRecommendations';
import Product360Viewer from '../../components/product/Product360Viewer';
import ImageZoomModal from '../../components/product/ImageZoomModal';
import PrivateAppointmentModal from '../../components/common/PrivateAppointmentModal';
import GiftOptionsModal from '../../components/common/GiftOptionsModal';
import TrustCertificates from '../../components/sections/TrustCertificates';
import RecentlyViewedSection from '../../components/sections/RecentlyViewedSection';

export default function Product() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { trackView } = useRecentlyViewed();

  // ── Product & related data ────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Modals v3.0 state ─────────────────────────────────────────────────────
  const [is360Open, setIs360Open] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftDetails, setGiftDetails] = useState(null);

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
        // Track in v3.0 recently viewed
        trackView(res.data);

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
  }, [slug, trackView]);

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

  // ── Loading / Error states ──────────────────────────────────────────────
  if (isLoading) return <Skeleton.ProductDetail />;
  if (error || !product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-32 text-center px-6">
        <div className="w-10 h-[1px] bg-luxury-gold mx-auto mb-8" />
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-luxury-gold mb-4">Maison Hafrose</p>
        <h1 className="font-serif text-3xl md:text-4xl text-luxury-charcoal font-light mb-4">
          Création Introuvable
        </h1>
        <p className="font-sans text-sm text-luxury-gray font-light mb-8 max-w-sm leading-relaxed">
          {error || 'Cette pièce n’est pas disponible ou a été retirée de notre collection.'}
        </p>
        <Link
          to="/shop"
          className="font-sans text-[10px] tracking-[0.3em] uppercase text-luxury-charcoal border border-luxury-charcoal/20 px-8 py-3 hover:border-luxury-gold hover:text-luxury-gold transition-all duration-300"
        >
          Découvrir la Collection
        </Link>
        <div className="w-10 h-[1px] bg-luxury-gold mx-auto mt-8" />
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32">
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
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductGallery
              images={gallery}
              productName={product.name}
              onOpen360={() => setIs360Open(true)}
              onOpenZoom={() => setIsZoomOpen(true)}
            />
          </motion.div>

          {/* BuyBox — right column */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <ProductBuyBox
              product={product}
              onOpenAppointment={() => setIsAppointmentOpen(true)}
              onOpenGiftModal={() => setIsGiftModalOpen(true)}
            />
          </motion.div>
        </div>

        {/* ── Product Tabs (Description / Histoire / Caractéristiques / Entretien / Certificat) ── */}
        <ProductTabs product={product} />

        {/* ── Trust Certificates Section (Authenticité & Garantie) ── */}
        <div className="my-12">
          <TrustCertificates />
        </div>

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

        {/* ── Recommendations ── */}
        <ProductRecommendations similar={similar} />
      </div>

      {/* ── Recently Viewed Section v3.0 ── */}
      <RecentlyViewedSection currentProductId={product.id} />

      {/* ── Modals v3.0 ── */}
      <Product360Viewer
        images={gallery}
        isOpen={is360Open}
        onClose={() => setIs360Open(false)}
        productName={product.name}
      />

      <ImageZoomModal
        imageSrc={gallery[0]}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        productName={product.name}
      />

      <PrivateAppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        productName={product.name}
      />

      <GiftOptionsModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        onSave={(gift) => {
          setGiftDetails(gift);
          Swal.fire({
            icon: 'success',
            title: 'Écrin Cadeau Ajouté',
            text: 'Votre sélection d\'écrin cadeau signature a bien été enregistrée.',
            confirmButtonColor: '#111111',
          });
        }}
      />
    </div>
  );
}
