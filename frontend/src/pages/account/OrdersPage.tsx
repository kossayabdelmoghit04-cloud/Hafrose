import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useOrders } from '../../hooks/useAccountHooks';
import { formatPrice, formatDate, getImageUrl } from '../../utils/formatters';

import heroImg from '../../assets/images/hero-main.png';
import bagsImg from '../../assets/images/category-bags.jpg';
import shoesImg from '../../assets/images/category-shoes.jpg';

const STATUS_TABS = [
  { id: 'all', label: 'Toutes les commandes' },
  { id: 'processing', label: 'En cours' },
  { id: 'shipped', label: 'Expédiées' },
  { id: 'delivered', label: 'Livrées' },
];

const FALLBACK_ORDERS = [
  {
    id: 849201,
    order_number: 'HF-849201',
    created_at: new Date().toISOString(),
    status: 'shipped',
    total_amount: 56500,
    items: [
      { id: 1, product_name: 'Robe Fourreau Bordeaux Silk', unit_price: 28900, quantity: 1, product: { media: [{ url: heroImg }] } },
      { id: 2, product_name: 'Sac Mini Bucket Rose Poudré', unit_price: 27600, quantity: 1, product: { media: [{ url: bagsImg }] } },
    ],
  },
  {
    id: 848912,
    order_number: 'HF-848912',
    created_at: new Date().toISOString(),
    status: 'delivered',
    total_amount: 21000,
    items: [
      { id: 3, product_name: 'Escarpins Satin Noir Prestige', unit_price: 21000, quantity: 1, product: { media: [{ url: shoesImg }] } },
    ],
  },
];

export const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ordersData, isLoading, isError, refetch } = useOrders();

  const ordersList = (ordersData && ordersData.length > 0) ? ordersData : FALLBACK_ORDERS;

  const filteredOrders = ordersList.filter((order: any) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesQuery =
      !searchQuery.trim() ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item: any) => item.product_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-h2 text-neutral-950">Mes Commandes</h1>
        <p className="text-body-sm text-neutral-600">
          Suivez la livraison de vos pièces HAFROSE et téléchargez vos factures.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Rechercher un N° de commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-neutral-400" />}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xs text-caption font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-burgundy-500 text-white font-semibold shadow-hafrose-xs'
                    : 'text-neutral-600 hover:bg-cream-100 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Erreur lors du chargement des commandes"
          message="Une erreur s'est produite. Vos commandes seront affichées dès rétablissement de la connexion."
          onRetry={() => refetch()}
        />
      )}

      {/* Orders List */}
      {!isLoading && !isError && (
        filteredOrders.length === 0 ? (
          <Card className="p-12 text-center bg-white space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-powder text-burgundy-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-h3 text-neutral-950">Aucune commande trouvée</h3>
            <p className="text-body-sm text-neutral-600">
              Aucune commande ne correspond à vos critères de recherche.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <Card key={order.id} className="p-6 bg-white space-y-4 hover:border-neutral-300 transition-colors">
                {/* Order Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-h4 text-neutral-950">{order.order_number}</span>
                      <span
                        className={`text-caption font-semibold px-2.5 py-0.5 rounded-xs border flex items-center gap-1.5 ${
                          order.status === 'shipped'
                            ? 'bg-burgundy-50 text-burgundy-700 border-burgundy-100'
                            : 'bg-success-50 text-success-700 border-success-100'
                        }`}
                      >
                        {order.status === 'shipped' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-caption text-neutral-500">Commande passée le {formatDate(order.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-caption text-neutral-500 block">Total TTC</span>
                      <span className="font-sans text-h4 font-semibold text-neutral-950">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                    <Link to={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Détails
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Order Items Thumbnails */}
                {order.items && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-2.5 bg-cream-100/60 rounded-xs border border-cream-300">
                        <img
                          src={getImageUrl(item.product?.media?.[0]?.url ?? null)}
                          alt={item.product_name}
                          className="w-14 aspect-[3/4] object-cover rounded-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-serif text-body-sm font-medium text-neutral-900 truncate">
                            {item.product_name}
                          </h4>
                          <p className="text-caption text-neutral-500">
                            Qté : {item.quantity}
                          </p>
                          <p className="text-caption font-semibold text-neutral-900">
                            {formatPrice(item.unit_price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            <div className="pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={1}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default OrdersPage;
