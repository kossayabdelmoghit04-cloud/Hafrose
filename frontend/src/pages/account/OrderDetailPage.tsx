import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, MapPin, CreditCard, Download, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatPrice, formatDate, getImageUrl } from '../../utils/formatters';
import { useOrderDetail } from '../../hooks/useAccountHooks';



const TIMELINE_STEPS = [
  { id: 'created', label: 'Commande reçue', date: 'Validation OK', completed: true, active: false, icon: Package },
  { id: 'processing', label: 'En préparation', date: 'Atelier HAFROSE', completed: true, active: false, icon: Clock },
  { id: 'shipped', label: 'Expédiée VIP', date: 'En transit', completed: true, active: true, icon: Truck },
  { id: 'delivered', label: 'Livraison estimée', date: 'Sous 24h-48h', completed: false, active: false, icon: CheckCircle2 },
];

export const OrderDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const numericId = parseInt(id, 10);

  const { data: apiOrder, isLoading, isError, refetch } = useOrderDetail(numericId);

  const order: any = apiOrder;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-60 rounded-xs" />
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (isError && !apiOrder) {
    return (
      <ErrorState
        title="Commande introuvable"
        message="Impossible de récupérer le détail de cette commande."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <Link to="/account/orders" className="inline-flex items-center gap-2 text-body-sm text-neutral-600 hover:text-burgundy-600 font-medium mb-1">
            <ArrowLeft className="w-4 h-4" /> Retour à mes commandes
          </Link>
          <h1 className="font-serif text-h2 text-neutral-950 flex items-center gap-3">
            Commande {order.order_number}
          </h1>
          <p className="text-caption text-neutral-500">Passée le {formatDate(order.created_at)}</p>
        </div>

        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          Télécharger la Facture PDF
        </Button>
      </div>

      {/* Progress Timeline Step Banner */}
      <Card className="p-6 md:p-8 bg-white space-y-6">
        <h3 className="font-serif text-h4 text-neutral-950">Suivi de Livraison</h3>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-neutral-200 z-0" />
          <div
            className="hidden md:block absolute top-5 left-8 h-0.5 bg-burgundy-500 z-0 transition-all duration-500"
            style={{ width: '66%' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {TIMELINE_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex md:flex-col items-center gap-3 md:text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-caption transition-all ${
                      step.completed
                        ? 'bg-burgundy-500 text-white shadow-hafrose-xs ring-4 ring-rose-powder'
                        : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4
                      className={`font-serif text-body-sm font-semibold ${
                        step.completed ? 'text-neutral-950' : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-caption text-neutral-500">{step.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Ordered Products Table */}
      <Card className="p-6 bg-white space-y-4">
        <h3 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-3">
          Articles Commandés ({order.items?.length || 0})
        </h3>

        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex gap-4 p-3 bg-cream-100/60 rounded-xs border border-cream-300 items-center">
              <img
                src={getImageUrl(item.product?.image ?? item.product?.media?.[0]?.url ?? null)}
                alt={item.product_name}
                className="w-16 aspect-[3/4] object-cover rounded-xs"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product?.slug || ''}`} className="font-serif text-h5 text-neutral-950 hover:text-burgundy-600 transition-colors">
                  {item.product?.name || item.product_name || 'Article HAFROSE'}
                </Link>
                <p className="text-caption text-neutral-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Qté : {item.quantity} × {formatPrice(item.unit_price)}</span>
                  {item.size && (
                    <span className="bg-cream-200 text-burgundy-700 px-2 py-0.5 rounded-xs text-[11px] font-medium border border-cream-400">
                      Taille : {item.size}
                    </span>
                  )}
                  {item.color && (
                    <span className="bg-cream-200 text-burgundy-700 px-2 py-0.5 rounded-xs text-[11px] font-medium border border-cream-400">
                      {item.color}
                    </span>
                  )}
                </p>
              </div>
              <span className="font-sans font-semibold text-body-base text-neutral-950">
                {formatPrice(item.subtotal || item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Addresses & Pricing Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Addresses Column */}
        <div className="lg:col-span-7 space-y-6">
          {order.shipping_address && (
            <Card className="p-6 bg-white space-y-3">
              <h4 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-burgundy-500" /> Adresse de Livraison
              </h4>
              <div className="text-body-sm text-neutral-700 space-y-0.5">
                <p className="font-semibold text-neutral-950">{order.shipping_address.name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.postal_code} {order.shipping_address.city}, {order.shipping_address.country}</p>
                {order.shipping_address.phone && <p className="text-neutral-500 pt-1">Tél : {order.shipping_address.phone}</p>}
              </div>
            </Card>
          )}

          <Card className="p-6 bg-white space-y-3">
            <h4 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-burgundy-500" /> Mode de Paiement
            </h4>
            <p className="text-body-sm text-neutral-700">{order.payment_method}</p>
            <p className="text-caption text-success-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Paiement validé ({order.payment_status})
            </p>
          </Card>
        </div>

        {/* Pricing Totals Column */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white space-y-4">
            <h4 className="font-serif text-h4 text-neutral-950 border-b border-neutral-200 pb-2">
              Récapitulatif Financier
            </h4>

            <div className="space-y-2.5 text-body-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total HT</span>
                <span className="font-medium text-neutral-900">{formatPrice((order.subtotal_amount || order.total_amount) - (order.tax_amount || 0))}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>TVA (20%)</span>
                <span className="font-medium text-neutral-900">{formatPrice(order.tax_amount || Math.round(order.total_amount * 0.2))}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Frais de livraison</span>
                <span className="font-medium text-success-600">
                  {order.shipping_amount === 0 ? 'Offerts' : formatPrice(order.shipping_amount || 0)}
                </span>
              </div>
            </div>

            <Divider spacing="none" />

            <div className="flex justify-between items-baseline">
              <span className="font-serif text-h4 text-neutral-950">Total TTC</span>
              <span className="font-sans text-h3 font-semibold text-burgundy-600">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
