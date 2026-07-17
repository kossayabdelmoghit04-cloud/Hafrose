import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingBag, FiStar } from 'react-icons/fi';
import Swal from 'sweetalert2';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
import ProductCard from '../../components/cards/ProductCard';
import Loader from '../../components/ui/Loader';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useCart } from '../../context/CartContext';
import { getProductGallery } from '../../utils/imageHelper';
import { formatPrice } from '../../utils/format';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Card from '../../components/ui/Card';
import { Form, Input, Select, Textarea } from '../../components/ui/form';
import EmptyState from '../../components/ui/EmptyState';

const RATING_OPTIONS = [
  { value: '1', label: '★ 1 — Passable' },
  { value: '2', label: '★★ 2 — Médiocre' },
  { value: '3', label: '★★★ 3 — Correct' },
  { value: '4', label: '★★★★ 4 — Très bien' },
  { value: '5', label: '★★★★★ 5 — Exceptionnel' },
];

export default function Product() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(
    product ? product.name : 'Chargement...',
    product ? product.description : 'Découvrez une création d\'exception façonnée à la main par la Maison Hafrose.'
  );

  // Gallery & Zoom state
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Purchase quantity
  const [qty, setQty] = useState(1);

  const gallery = useMemo(() => (product ? getProductGallery(product) : []), [product]);
  const avgRating = useMemo(() => {
    return product?.reviews?.length
      ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
      : null;
  }, [product?.reviews]);

  // Review form state
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProductData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await productService.getBySlug(slug);
      if (res?.success) {
        setProduct(res.data);
        setActiveImgIdx(0);
        setQty(1);

        // Fetch similar products in same category
        const simRes = await productService.getAll({ category: res.data.category?.slug, per_page: 5 });
        if (simRes?.success) {
          setSimilar(simRes.data.data.filter(p => p.id !== res.data.id).slice(0, 4));
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

  const handleZoomMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setZoomPos({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${product.name} ajouté au panier`,
      showConfirmButton: false,
      timer: 2000,
      background: '#FDFBF7',
      color: '#111111',
      iconColor: '#D4AF37'
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!revName.trim() || revComment.trim().length < 10) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Le nom est requis et le commentaire doit contenir au moins 10 caractères.', confirmButtonColor: '#111111' });
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await reviewService.create({ product_id: product.id, customer_name: revName, rating: revRating, comment: revComment });
      if (res?.success) {
        Swal.fire({ title: 'Merci', text: "Votre avis a été soumis et sera publié après validation par notre Maison.", icon: 'success', confirmButtonColor: '#111111' });
        setRevName('');
        setRevComment('');
        setRevRating(5);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: err.message || 'Soumission impossible.', confirmButtonColor: '#111111' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <Skeleton.ProductDetail />;
  if (error || !product) return <div className="py-32 text-center text-red-500 font-sans">{error || 'Création introuvable.'}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Boutique', path: '/shop' }, { label: product.category?.name || 'Créations', path: `/shop?category=${product.category?.slug}` }, { label: product.name }]} />

      {/* Main Product Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-3 flex-shrink-0">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setActiveImgIdx(i)} className={`w-16 h-20 border flex-shrink-0 overflow-hidden ${activeImgIdx === i ? 'border-luxury-gold' : 'border-luxury-charcoal/10 hover:border-luxury-gold/50'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div onMouseEnter={() => setIsZooming(true)} onMouseLeave={() => setIsZooming(false)} onMouseMove={handleZoomMove} className="flex-grow aspect-[3/4] bg-luxury-light-gray relative overflow-hidden cursor-zoom-in border border-luxury-charcoal/5">
            <img src={gallery[activeImgIdx]} alt={product.name} className="w-full h-full object-cover transition-transform duration-200" style={isZooming ? { transform: 'scale(1.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : { transform: 'scale(1)' }} />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <span className="text-[10px] tracking-[0.3em] uppercase text-luxury-gold font-sans font-semibold">{product.category?.name}</span>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-luxury-charcoal leading-tight">{product.name}</h1>

          <div className="flex items-center space-x-4 border-b border-luxury-charcoal/5 pb-4">
            <div className="flex text-luxury-gold">
              {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-4 h-4 ${i < Math.round(avgRating || 5) ? 'fill-luxury-gold' : ''}`} />)}
            </div>
            <a href="#reviews" className="text-[10px] uppercase tracking-widest text-luxury-gray hover:text-luxury-gold font-sans font-light">
              {product.reviews?.length || 0} avis client
            </a>
          </div>

          <p className="font-sans text-xl text-luxury-gold font-medium">{formatPrice(product.price)}</p>

          <div className="space-y-2 text-xs font-sans font-light text-luxury-charcoal">
            {product.material && <p><span className="text-luxury-gray uppercase tracking-wider text-[10px] font-medium mr-2">Matière :</span> {product.material}</p>}
            {product.color && <p><span className="text-luxury-gray uppercase tracking-wider text-[10px] font-medium mr-2">Coloris :</span> {product.color}</p>}
            <p><span className="text-luxury-gray uppercase tracking-wider text-[10px] font-medium mr-2">Disponibilité :</span> {product.stock > 0 ? <Badge variant="success">En Stock ({product.stock})</Badge> : <Badge variant="danger">Indisponible</Badge>}</p>
          </div>

          <p className="text-sm font-sans font-light text-luxury-gray leading-relaxed">{product.description}</p>

          {/* Action Row */}
          {product.stock > 0 && (
            <div className="pt-4 flex items-center space-x-4">
              <div className="flex items-center border border-luxury-charcoal/20">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-luxury-charcoal hover:text-luxury-gold cursor-pointer"><FiMinus size={12} /></button>
                <span className="px-4 font-sans text-sm font-light select-none">{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-luxury-charcoal hover:text-luxury-gold cursor-pointer"><FiPlus size={12} /></button>
              </div>
              <Button
                variant="primary"
                onClick={handleAddToCart}
                className="flex-grow"
                icon={<FiShoppingBag size={14} />}
              >
                Ajouter au panier
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews & Form Section */}
      <div id="reviews" className="border-t border-luxury-charcoal/10 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 text-left">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-serif text-2xl font-light text-luxury-charcoal">Avis des Clients</h2>
          <div className="space-y-4">
            {!product.reviews?.length ? (
              <EmptyState
                variant="flat"
                compact
                title="Aucun avis pour le moment"
                description="Aucun avis n'a encore été déposé. Partagez votre expérience avec cette création."
              />
            ) : (
              product.reviews.map((rev) => (
                <Card key={rev.id} variant="review" className="border-b border-luxury-charcoal/5 pb-4 p-0 shadow-none gap-2 text-left bg-transparent border-0">
                  <div className="flex items-center justify-between">
                    <Card.Title as="span" className="text-xs font-medium text-luxury-charcoal">{rev.customer_name}</Card.Title>
                    <div className="flex text-luxury-gold">
                      {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-luxury-gold' : ''}`} />)}
                    </div>
                  </div>
                  <Card.Description className="text-xs font-sans font-light text-luxury-gray leading-relaxed">{rev.comment}</Card.Description>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Review Form */}
        <Card variant="panel" className="lg:col-span-5 p-6">
          <Card.Header className="border-b-0 pb-0 mb-4">
            <Card.Title as="h3" className="text-lg font-light text-luxury-charcoal">Partager votre avis</Card.Title>
          </Card.Header>

          <Form onSubmit={handleReviewSubmit}>
            <Form.Section>
              {/* Nom */}
              <Form.Field name="revName">
                <Form.Label required>Votre Nom</Form.Label>
                <Input
                  name="revName"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  required
                  autoComplete="name"
                />
                <Form.Error />
              </Form.Field>

              {/* Note — star picker (interactive) + Select fallback */}
              <Form.Field name="revRating">
                <Form.Label required>Note</Form.Label>
                {/* Interactive star rating buttons */}
                <div className="flex space-x-1 py-1" role="group" aria-label="Choisir une note">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                      aria-pressed={star <= revRating}
                      className="text-luxury-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-luxury-gold cursor-pointer"
                    >
                      <FiStar className={`w-5 h-5 ${star <= revRating ? 'fill-luxury-gold' : ''}`} />
                    </button>
                  ))}
                </div>
                {/* Hidden select for screen reader / form serialization */}
                <Select
                  name="revRating"
                  value={String(revRating)}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  options={RATING_OPTIONS}
                  size="sm"
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </Form.Field>

              {/* Commentaire */}
              <Form.Field name="revComment">
                <Form.Label required>Commentaire (min. 10 caractères)</Form.Label>
                <Textarea
                  name="revComment"
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  rows={4}
                  required
                />
                <Form.Counter current={revComment.length} />
                <Form.Error />
              </Form.Field>
            </Form.Section>

            <Form.Footer>
              <Form.Actions align="left">
                <Button variant="primary" type="submit" fullWidth disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Transmission...' : 'Soumettre mon avis'}
                </Button>
              </Form.Actions>
            </Form.Footer>
          </Form>
        </Card>
      </div>

      {/* Similar Products Recommendation */}
      {similar.length > 0 && (
        <div className="border-t border-luxury-charcoal/10 pt-16 text-left">
          <h2 className="font-serif text-2xl font-light text-luxury-charcoal mb-10">Créations Similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similar.map((prod) => <ProductCard key={prod.id} product={prod} />)}
          </div>
        </div>
      )}
    </div>
  );
}
