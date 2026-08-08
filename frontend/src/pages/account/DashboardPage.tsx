import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LinkButton } from '../../components/ui/LinkButton';
import { useAuthStore } from '../../stores/useAuthStore';
import { useWishlistStore } from '../../stores/useWishlistStore';
import { useOrders } from '../../hooks/useAccountHooks';
import { formatPrice, formatDate } from '../../utils/formatters';

const FALLBACK_RECENT_ORDERS = [
  {
    id: 849201,
    order_number: 'HF-849201',
    created_at: new Date().toISOString(),
    status: 'Expédiée',
    total_amount: 56500,
    items_count: 2,
  },
  {
    id: 848912,
    order_number: 'HF-848912',
    created_at: new Date().toISOString(),
    status: 'Livrée',
    total_amount: 34500,
    items_count: 1,
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { data: ordersData } = useOrders();

  const userName = user?.first_name || 'Éléonore';
  const realOrders = ordersData || [];
  const recentOrders = realOrders.length > 0 ? realOrders.slice(0, 2) : FALLBACK_RECENT_ORDERS;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-burgundy-900 to-burgundy-700 text-white p-6 md:p-8 rounded-md shadow-hafrose-md">
        <span className="text-caption font-sans font-semibold tracking-luxury uppercase text-rose-powder block mb-1">
          Cercle Privé HAFROSE
        </span>
        <h1 className="font-serif text-h2 md:text-h1 mb-2">
          Ravi de vous revoir, {userName}
        </h1>
        <p className="text-body-sm text-cream-200 max-w-lg leading-relaxed">
          Gérez facilement vos commandes, consultez vos pièces coup de cœur et mettez à jour vos informations personnelles.
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6 bg-white space-y-4 hover:border-burgundy-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-rose-powder text-burgundy-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-serif text-h2 text-neutral-900">{realOrders.length || 2}</span>
          </div>
          <div>
            <h3 className="font-serif text-h4 text-neutral-950">Mes Commandes</h3>
            <p className="text-caption text-neutral-500">Historique d'achats HAFROSE</p>
          </div>
          <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-body-sm text-burgundy-600 font-semibold hover:underline pt-2">
            Voir l'historique <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card className="p-6 bg-white space-y-4 hover:border-burgundy-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-rose-powder text-burgundy-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-serif text-h2 text-neutral-900">{wishlistItems.length}</span>
          </div>
          <div>
            <h3 className="font-serif text-h4 text-neutral-950">Ma Listes d'Envies</h3>
            <p className="text-caption text-neutral-500">Pièces d'exception sauvegardées</p>
          </div>
          <Link to="/account/wishlist" className="inline-flex items-center gap-1.5 text-body-sm text-burgundy-600 font-semibold hover:underline pt-2">
            Voir mes favoris <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card className="p-6 bg-white space-y-4 hover:border-burgundy-300 transition-colors">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-rose-powder text-burgundy-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-caption font-semibold uppercase bg-success-50 text-success-700 px-2 py-0.5 rounded-xs border border-success-100">
              Active
            </span>
          </div>
          <div>
            <h3 className="font-serif text-h4 text-neutral-950">Adresse Principale</h3>
            <p className="text-caption text-neutral-500 truncate">124 Avenue Montaigne, 75008 Paris</p>
          </div>
          <Link to="/account/addresses" className="inline-flex items-center gap-1.5 text-body-sm text-burgundy-600 font-semibold hover:underline pt-2">
            Gérer mes adresses <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="p-6 bg-white space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div>
            <h3 className="font-serif text-h3 text-neutral-950">Commandes Récentes</h3>
            <p className="text-caption text-neutral-500">Suivi en temps réel de vos derniers achats</p>
          </div>
          <LinkButton href="/account/orders" variant="outline" size="sm">
            Toutes mes commandes
          </LinkButton>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order: any) => (
            <div key={order.id} className="p-4 rounded-sm bg-cream-100/70 border border-neutral-200/60 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-h5 text-neutral-900 font-semibold">{order.order_number}</span>
                  <span className="text-caption font-semibold px-2.5 py-0.5 rounded-xs bg-burgundy-50 text-burgundy-700 border border-burgundy-100 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {order.status}
                  </span>
                </div>
                <p className="text-caption text-neutral-500">
                  Passée le {formatDate(order.created_at)} • {order.items_count || order.items?.length || 1} article(s)
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-sans font-semibold text-body-base text-neutral-950">
                  {formatPrice(order.total_amount)}
                </span>
                <Link to={`/account/orders/${order.id}`}>
                  <Button variant="secondary" size="sm">
                    Détails
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reassurance Banner */}
      <div className="p-5 bg-cream-200 rounded-md border border-cream-400 flex items-center justify-between gap-4 text-neutral-700">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-burgundy-600 flex-shrink-0" />
          <p className="text-body-sm">
            Une question sur votre compte ou vos commandes ? Notre service conciergerie est à votre disposition 7j/7.
          </p>
        </div>
        <LinkButton href="/contact" variant="ghost" size="sm" className="whitespace-nowrap">
          Contact Conciergerie
        </LinkButton>
      </div>
    </div>
  );
};

export default DashboardPage;
