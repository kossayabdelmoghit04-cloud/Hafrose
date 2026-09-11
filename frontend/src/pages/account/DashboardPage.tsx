import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  MapPin,
  ArrowRight,
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { LinkButton } from '../../components/ui/LinkButton';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useOrders, useAddresses } from '../../hooks/useAccountHooks';
import { formatPrice, formatDate } from '../../utils/formatters';


/* ── Status badge helper ─────────────────────────────────────────────── */
type StatusKey = 'shipped' | 'delivered' | 'processing' | 'pending' | string;

function getStatusConfig(status: StatusKey) {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'shipped' || normalized === 'expédiée' || normalized === 'expediee') {
    return {
      label: status,
      icon: Truck,
      className: 'bg-info-50 text-info-700 border-info-100',
    };
  }
  if (normalized === 'delivered' || normalized === 'livrée' || normalized === 'livree') {
    return {
      label: status,
      icon: CheckCircle2,
      className: 'bg-success-50 text-success-700 border-success-100',
    };
  }
  if (normalized === 'processing' || normalized === 'en cours' || normalized === 'en attente') {
    return {
      label: status,
      icon: Clock,
      className: 'bg-warning-50 text-warning-700 border-warning-100',
    };
  }
  return {
    label: status,
    icon: PackageCheck,
    className: 'bg-burgundy-50 text-burgundy-700 border-burgundy-100',
  };
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { data: ordersData } = useOrders();
  const { data: addressesData } = useAddresses();

  const userName = user?.first_name || user?.name || 'Membre HAFROSE';
  const realOrders = ordersData || [];
  const recentOrders = realOrders.slice(0, 3);

  /* Primary address — 100% dynamic, never hardcoded */
  const primaryAddress =
    addressesData && addressesData.length > 0
      ? addressesData.find((a) => a.is_default) || addressesData[0]
      : null;

  const addressShort = primaryAddress
    ? `${primaryAddress.address}, ${primaryAddress.postal_code} ${primaryAddress.city}`
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ══ 1. Hero / Welcome Banner ══════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-burgundy-800 rounded-md px-7 py-8 md:px-10 md:py-10 shadow-hafrose-md">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 w-48 h-full opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '8px 8px',
          }}
        />

        <span className="inline-block text-[11px] font-sans uppercase tracking-[0.2em] font-semibold text-rose-300 mb-3">
          Cercle Privé HAFROSE
        </span>

        <h1 className="font-serif text-h2 md:text-h1 text-cream-100 leading-snug mb-3">
          Bienvenue,&nbsp;{userName}
        </h1>

        <p className="text-body-sm text-cream-200/70 max-w-md leading-relaxed">
          Gérez vos commandes, retrouvez vos pièces coup de cœur et mettez à jour vos informations personnelles.
        </p>
      </div>

      {/* ══ 2. Cards de synthèse — 100% données réelles ════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* — Commandes — */}
        <Card className="group p-5 bg-white border border-neutral-200/60 hover:border-burgundy-200 hover:shadow-hafrose-hover transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-sm bg-burgundy-50 text-burgundy-600 flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5" aria-hidden="true" />
            </div>
            <span
              aria-label={`${realOrders.length} commande${realOrders.length > 1 ? 's' : ''}`}
              className="font-serif text-h1 text-neutral-900 leading-none"
            >
              {realOrders.length}
            </span>
          </div>
          <h2 className="font-serif text-h5 text-neutral-950 mb-0.5">Mes Commandes</h2>
          <p className="text-caption text-neutral-500 mb-4">
            {realOrders.length === 0
              ? 'Aucune commande enregistrée'
              : `${realOrders.length} commande${realOrders.length > 1 ? 's' : ''} passée${realOrders.length > 1 ? 's' : ''}`}
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-burgundy-600 hover:text-burgundy-800 transition-colors group-hover:gap-2.5 duration-200"
            aria-label="Voir toutes mes commandes"
          >
            Voir l'historique <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* — Favoris — */}
        <Card className="group p-5 bg-white border border-neutral-200/60 hover:border-rose-200 hover:shadow-hafrose-hover transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4.5 h-4.5" aria-hidden="true" />
            </div>
            <span
              aria-label={`${wishlistItems.length} favoris`}
              className="font-serif text-h1 text-neutral-900 leading-none"
            >
              {wishlistItems.length}
            </span>
          </div>
          <h2 className="font-serif text-h5 text-neutral-950 mb-0.5">Ma Liste d'Envies</h2>
          <p className="text-caption text-neutral-500 mb-4">
            {wishlistItems.length === 0
              ? 'Aucun favori enregistré'
              : `${wishlistItems.length} création${wishlistItems.length > 1 ? 's' : ''} sauvegardée${wishlistItems.length > 1 ? 's' : ''}`}
          </p>
          <Link
            to="/account/wishlist"
            className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-burgundy-600 hover:text-burgundy-800 transition-colors group-hover:gap-2.5 duration-200"
            aria-label="Voir mes favoris"
          >
            Voir mes favoris <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>

        {/* — Adresse principale — */}
        <Card className="group p-5 bg-white border border-neutral-200/60 hover:border-burgundy-200 hover:shadow-hafrose-hover transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-9 h-9 rounded-sm bg-cream-200 text-burgundy-600 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5" aria-hidden="true" />
            </div>
            {primaryAddress ? (
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-success-50 text-success-700 px-2 py-0.5 rounded-xs border border-success-100">
                Principale
              </span>
            ) : (
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-xs border border-neutral-200">
                Non renseignée
              </span>
            )}
          </div>
          <h2 className="font-serif text-h5 text-neutral-950 mb-0.5">Adresse Principale</h2>
          <p className="text-caption text-neutral-500 truncate mb-4" title={addressShort || 'Aucune adresse enregistrée'}>
            {addressShort || 'Aucune adresse enregistrée'}
          </p>
          <Link
            to="/account/addresses"
            className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-burgundy-600 hover:text-burgundy-800 transition-colors group-hover:gap-2.5 duration-200"
            aria-label="Gérer mes adresses"
          >
            {primaryAddress ? 'Gérer mes adresses' : 'Ajouter une adresse'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </div>

      {/* ══ 3. Commandes Récentes — Réelles ═══════════════════════════════ */}
      <Card className="bg-white border border-neutral-200/60 overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 className="font-serif text-h3 text-neutral-950">Commandes Récentes</h2>
            <p className="text-caption text-neutral-500 mt-0.5">Suivi en temps réel de vos achats</p>
          </div>
          {recentOrders.length > 0 && (
            <LinkButton
              href="/account/orders"
              variant="outline"
              size="sm"
              aria-label="Voir toutes mes commandes"
            >
              Toutes mes commandes
            </LinkButton>
          )}
        </div>

        {/* Orders list or empty state */}
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {recentOrders.map((order: any) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const itemsCount = order.items_count ?? order.items?.length ?? 1;

              return (
                <div
                  key={order.id}
                  className="group px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-cream-100/50 transition-colors duration-150"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-serif text-h5 text-neutral-900 font-semibold">
                        Commande&nbsp;#{order.order_number || order.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-xs border ${statusConfig.className}`}
                      >
                        <StatusIcon className="w-3 h-3" aria-hidden="true" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-caption text-neutral-500">
                      {formatDate(order.created_at)}&nbsp;·&nbsp;
                      {itemsCount}&nbsp;article{itemsCount > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-5 flex-shrink-0">
                    <span className="font-sans font-semibold text-body-base text-neutral-950 tabular-nums">
                      {formatPrice(order.total_amount)}
                    </span>
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-burgundy-600 hover:text-burgundy-800 transition-colors group-hover:gap-2 duration-200 whitespace-nowrap"
                      aria-label={`Voir les détails de la commande ${order.order_number || order.id}`}
                    >
                      Voir les détails <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-cream-200 text-neutral-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="font-serif text-h5 text-neutral-900">Aucune commande pour le moment</p>
              <p className="text-caption text-neutral-500 max-w-sm mx-auto mt-1">
                Vos commandes passées auprès de la Maison HAFROSE apparaîtront ici avec leur suivi détaillé.
              </p>
            </div>
            <LinkButton href="/shop" variant="primary" size="sm">
              Découvrir la Boutique
            </LinkButton>
          </div>
        )}
      </Card>

      {/* ══ 4. Bannière Conciergerie ══════════════════════════════════════ */}
      <div className="p-5 bg-cream-200/60 rounded-md border border-cream-400/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-neutral-700">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-burgundy-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-body-sm leading-relaxed">
            Une question sur votre compte ou vos commandes ?&nbsp;
            <span className="font-medium text-neutral-900">Notre service conciergerie est à votre disposition 7j/7.</span>
          </p>
        </div>
        <LinkButton
          href="/contact"
          variant="ghost"
          size="sm"
          className="whitespace-nowrap flex-shrink-0"
        >
          Contacter la Conciergerie
        </LinkButton>
      </div>
    </div>
  );
};

export default DashboardPage;

