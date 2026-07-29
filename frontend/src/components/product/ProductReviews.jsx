import { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiThumbsUp, FiFilter, FiCheck } from 'react-icons/fi';

/**
 * ProductReviews — HAFROSE Design System Phase 3
 * Section avis avec histogramme de notes, filtres par étoiles, badge "Acheteur Vérifié",
 * et formulaire d'avis avec Cloudflare Turnstile. Réutilise la logique existante
 * de pages/Product/index.jsx (états, handlers) via props.
 */

/* ── Star rating display ──────────────────────────────────────────── */
function StarRating({ value = 0, max = 5, size = 14, className = '' }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${value} étoiles sur ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          className={i < Math.round(value) ? 'text-luxury-gold fill-luxury-gold' : 'text-beige'}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ── Histogram bar ────────────────────────────────────────────────── */
function RatingBar({ star, count, total, isActive, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full group transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
      aria-label={`Filtrer par ${star} étoiles — ${count} avis`}
    >
      <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray w-12 text-right flex-shrink-0">
        {star} ★
      </span>
      <div className="flex-1 h-1.5 bg-beige rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isActive ? 'bg-rose-gold' : 'bg-luxury-gold/60 group-hover:bg-luxury-gold'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="font-sans text-[10px] text-warm-gray w-6 flex-shrink-0 text-left">
        {count}
      </span>
    </button>
  );
}

/* ── Single Review Card ───────────────────────────────────────────── */
function ReviewCard({ review }) {
  const date = review.created_at
    ? new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(review.created_at)
      )
    : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-beige pb-6 last:border-0"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-medium text-luxury-charcoal">
              {review.customer_name}
            </span>
            {review.verified && (
              <span className="flex items-center gap-1 font-sans text-[9px] uppercase tracking-wider text-success-text bg-success-bg border border-success/30 px-1.5 py-0.5 rounded-sm">
                <FiCheck size={8} aria-hidden="true" />
                Acheteur Vérifié
              </span>
            )}
          </div>
          {date && (
            <time className="font-sans text-[10px] text-warm-gray" dateTime={review.created_at}>
              {date}
            </time>
          )}
        </div>
        <StarRating value={review.rating} size={12} className="flex-shrink-0" />
      </div>

      <p className="font-sans text-sm font-light text-luxury-gray leading-relaxed">
        {review.comment}
      </p>

      {/* Helpful vote */}
      <div className="flex items-center gap-2 mt-4">
        <button
          type="button"
          className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-warm-gray hover:text-rose-gold transition-colors"
        >
          <FiThumbsUp size={11} aria-hidden="true" />
          Utile {review.helpful_count ? `(${review.helpful_count})` : ''}
        </button>
      </div>
    </motion.article>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
const ProductReviews = memo(function ProductReviews({
  reviews = [],
  reviewForm,  // { revName, setRevName, revRating, setRevRating, revComment, setRevComment, revWebsite, setRevWebsite, isSubmitting, captchaToken, reviewErrors, turnstileRef, onSubmit }
  TurnstileComponent,
}) {
  const [filterStar, setFilterStar] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'high' | 'low'

  /* ── Aggregated stats ── */
  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0, dist: {} };
    const total = reviews.length;
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      sum += r.rating;
    });
    return { avg: (sum / total).toFixed(1), total, dist };
  }, [reviews]);

  /* ── Filtered + Sorted reviews ── */
  const displayed = useMemo(() => {
    let list = filterStar ? reviews.filter((r) => r.rating === filterStar) : [...reviews];
    if (sortBy === 'recent') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'high') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'low') list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, filterStar, sortBy]);

  const {
    revName, setRevName,
    revRating, setRevRating,
    revComment, setRevComment,
    revWebsite, setRevWebsite,
    isSubmitting,
    reviewErrors = {},
    turnstileRef,
    onSubmit,
  } = reviewForm || {};

  return (
    <section id="reviews" className="mt-20 border-t border-beige pt-16 scroll-mt-24" aria-label="Avis clients">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* ── Left: Reviews List ── */}
        <div className="lg:col-span-7 space-y-10">

          {/* Score global + Histogramme */}
          {stats.total > 0 && (
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Big Score */}
              <div className="text-center flex-shrink-0">
                <p className="font-serif text-6xl font-light text-luxury-charcoal leading-none">
                  {stats.avg}
                </p>
                <StarRating value={parseFloat(stats.avg)} size={16} className="mt-2 justify-center" />
                <p className="font-sans text-[10px] uppercase tracking-widest text-warm-gray mt-1.5">
                  {stats.total} avis
                </p>
              </div>

              {/* Histogram */}
              <div className="flex-1 space-y-2.5 w-full">
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar
                    key={star}
                    star={star}
                    count={stats.dist[star] || 0}
                    total={stats.total}
                    isActive={filterStar === star}
                    onClick={() => setFilterStar(filterStar === star ? null : star)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sort + Filter Controls */}
          {stats.total > 0 && (
            <div className="flex items-center justify-between gap-4 border-b border-beige pb-4">
              <div className="flex items-center gap-2">
                {filterStar && (
                  <button
                    type="button"
                    onClick={() => setFilterStar(null)}
                    className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-wider text-rose-gold hover:text-luxury-charcoal transition-colors"
                  >
                    <FiFilter size={10} />
                    Filtré {filterStar} ★ — Effacer
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-sans text-[10px] uppercase tracking-widest text-warm-gray mr-2">Trier :</span>
                {[
                  { key: 'recent', label: 'Récents' },
                  { key: 'high', label: 'Meilleures' },
                  { key: 'low', label: 'Plus basses' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSortBy(s.key)}
                    className={`font-sans text-[10px] uppercase tracking-widest px-2 py-1 transition-colors ${
                      sortBy === s.key ? 'text-luxury-charcoal font-semibold' : 'text-warm-gray hover:text-luxury-charcoal'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {displayed.length > 0 ? (
                displayed.map((rev) => <ReviewCard key={rev.id} review={rev} />)
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <p className="font-serif text-lg text-luxury-charcoal font-light mb-2">
                    {filterStar ? `Aucun avis ${filterStar} étoile` : 'Aucun avis pour le moment'}
                  </p>
                  <p className="font-sans text-xs font-light text-warm-gray">
                    {filterStar
                      ? 'Essayez un autre filtre ou consultez tous les avis.'
                      : 'Soyez le premier à partager votre expérience avec cette création.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Review Form ── */}
        {onSubmit && (
          <div className="lg:col-span-5">
            <div className="border border-beige bg-off-white p-8 sticky top-28">
              <h3 className="font-serif text-xl font-light text-luxury-charcoal mb-6">
                Partager votre avis
              </h3>

              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={revWebsite}
                  onChange={(e) => setRevWebsite(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Nom */}
                <div>
                  <label htmlFor="review-name" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2">
                    Votre Nom <span className="text-rose-gold">*</span>
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full border border-form-border bg-form-bg px-4 py-3 font-sans text-sm font-light text-luxury-charcoal focus:outline-none focus:border-form-border-focus transition-colors placeholder:text-warm-gray/50"
                    placeholder="Marie Dupont"
                  />
                  {reviewErrors.customer_name && (
                    <p className="text-red-500 text-[10px] mt-1">{reviewErrors.customer_name}</p>
                  )}
                </div>

                {/* Note en étoiles */}
                <div>
                  <label className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2">
                    Note <span className="text-rose-gold">*</span>
                  </label>
                  <div className="flex gap-1" role="group" aria-label="Choisir une note">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRevRating(star)}
                        aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                        aria-pressed={star <= revRating}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold rounded cursor-pointer"
                      >
                        <FiStar
                          size={22}
                          className={`transition-colors ${star <= revRating ? 'text-luxury-gold fill-luxury-gold' : 'text-beige hover:text-luxury-gold'}`}
                        />
                      </button>
                    ))}
                    <span className="font-sans text-xs text-warm-gray self-center ml-2">
                      {revRating}/5
                    </span>
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <label htmlFor="review-comment" className="block font-sans text-[10px] uppercase tracking-widest text-luxury-charcoal mb-2">
                    Commentaire <span className="text-rose-gold">*</span>
                  </label>
                  <textarea
                    id="review-comment"
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    rows={5}
                    required
                    className="w-full border border-form-border bg-form-bg px-4 py-3 font-sans text-sm font-light text-luxury-charcoal focus:outline-none focus:border-form-border-focus transition-colors resize-none placeholder:text-warm-gray/50"
                    placeholder="Partagez votre expérience avec cette création..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className={`font-sans text-[10px] ${revComment?.length < 10 ? 'text-red-400' : 'text-warm-gray'}`}>
                      Min. 10 caractères
                    </span>
                    <span className="font-sans text-[10px] text-warm-gray">
                      {revComment?.length || 0} car.
                    </span>
                  </div>
                  {reviewErrors.comment && (
                    <p className="text-red-500 text-[10px] mt-1">{reviewErrors.comment}</p>
                  )}
                </div>

                {/* Turnstile Captcha */}
                {TurnstileComponent && (
                  <div className="flex flex-col items-center">
                    {TurnstileComponent}
                    {reviewErrors.captcha && (
                      <p className="text-red-500 text-[10px] mt-1">{reviewErrors.captcha}</p>
                    )}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-luxury-charcoal text-off-white font-sans text-[10px] uppercase tracking-widest py-4 hover:bg-rose-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Transmission en cours…
                    </>
                  ) : 'Soumettre mon avis'}
                </button>

                <p className="font-sans text-[10px] text-center text-warm-gray leading-relaxed">
                  Votre avis sera publié après validation par la Maison Hafrose.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default ProductReviews;
