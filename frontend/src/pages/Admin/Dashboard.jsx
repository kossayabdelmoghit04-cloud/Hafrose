import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiFolder, 
  FiMail, 
  FiStar, 
  FiBox, 
  FiArrowRight, 
  FiCalendar
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Récupérer toutes les données du tableau de bord
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data),
  });

  if (isLoading) return <Loader fullPage />;
  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-800/40 text-red-400 rounded-lg text-center font-serif text-lg">
        Une erreur est survenue lors du chargement des données du tableau de bord : {error.message}
      </div>
    );
  }

  const { metrics, sales_chart, popular_products, latest_orders, latest_messages } = data;

  // Calculs pour le graphique SVG adaptatif
  const maxSales = Math.max(...sales_chart.map(d => d.sales), 100);
  const chartHeight = 220;
  const chartWidth = 600;
  const padding = 40;

  // Générer les coordonnées pour les points du tracé de courbe SVG
  const points = sales_chart.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (sales_chart.length - 1);
    // Inverser l'axe Y car l'origine SVG (0,0) est en haut à gauche
    const y = chartHeight - padding - (d.sales / maxSales) * (chartHeight - padding * 2);
    return { x, y, label: d.date, value: d.sales };
  });

  const svgPath = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  // Chemin pour le dégradé sous la courbe
  const areaPath = points.length > 0 
    ? `${svgPath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : '';

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif text-luxury-charcoal">Rapport d'Activité</h2>
          <p className="text-sm text-luxury-gray">Aperçu en temps réel et performances de la boutique Hafrose.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded border border-luxury-gold/15 text-sm text-luxury-gray shadow-sm">
          <FiCalendar className="text-luxury-gold" />
          <span>Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric Card: Revenue */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-luxury-gray uppercase tracking-wider font-semibold">Chiffre d'Affaires</span>
              <span className="text-2xl font-semibold mt-2 font-serif text-luxury-charcoal">{metrics.revenue.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="p-3 bg-luxury-gold/10 text-luxury-gold rounded-lg">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-luxury-gray">Commandes non annulées cumulées</div>
        </div>

        {/* Metric Card: Orders */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-luxury-gray uppercase tracking-wider font-semibold">Commandes</span>
              <span className="text-2xl font-semibold mt-2 font-serif text-luxury-charcoal">{metrics.orders_count}</span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FiShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600 font-semibold">
            {metrics.pending_orders} commande(s) en attente
          </div>
        </div>

        {/* Metric Card: Unread Messages */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-luxury-gray uppercase tracking-wider font-semibold">Messages Contact</span>
              <span className="text-2xl font-semibold mt-2 font-serif text-luxury-charcoal">{metrics.unread_contacts}</span>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <FiMail className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-600 font-semibold">Messages de contact non lus</div>
        </div>

        {/* Metric Card: Pending Reviews */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-luxury-gray uppercase tracking-wider font-semibold">Avis Modération</span>
              <span className="text-2xl font-semibold mt-2 font-serif text-luxury-charcoal">{metrics.pending_reviews}</span>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <FiStar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-yellow-600 font-semibold">Avis clients en attente d'approbation</div>
        </div>

      </div>

      {/* Main Charts & Popular Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Sales Trend Chart */}
        <div className="lg:col-span-2 p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-luxury-charcoal">Évolution des Ventes</h3>
            <span className="text-xs text-luxury-gray uppercase tracking-wider">Derniers {sales_chart.length} jours</span>
          </div>

          <div className="relative flex-grow min-h-[220px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
              {/* Grids and Axes */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#F5F5F5" strokeWidth={1} />
              <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#F5F5F5" strokeWidth={1} />
              
              {/* Y Axis Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight - padding - ratio * (chartHeight - padding * 2);
                const value = Math.round(ratio * maxSales);
                return (
                  <g key={ratio}>
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#F5F5F5" strokeDasharray="3 3" />
                    <text x={padding - 10} y={y + 4} textAnchor="end" fontSize={10} fill="#7F7F7F">{value} €</text>
                  </g>
                );
              })}

              {/* Area under line with gradient */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

              {/* Curve Line */}
              {svgPath && <path d={svgPath} fill="none" stroke="#D4AF37" strokeWidth={2.5} />}

              {/* Points & Tooltips */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={4} fill="#111111" stroke="#D4AF37" strokeWidth={2} className="cursor-pointer hover:r-6 transition-all duration-300" />
                  <text x={p.x} y={chartHeight - padding + 18} textAnchor="middle" fontSize={10} fill="#7F7F7F">{p.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Popular Products List */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm">
          <h3 className="font-serif text-lg text-luxury-charcoal mb-6">Produits Populaires</h3>
          <div className="space-y-4">
            {popular_products.map((prod) => (
              <div key={prod.id} className="flex justify-between items-center pb-3 border-b border-luxury-light-gray last:border-b-0 last:pb-0">
                <div>
                  <div className="text-sm font-semibold text-luxury-charcoal truncate max-w-[180px]">
                    {prod.name}
                  </div>
                  <div className="text-xs text-luxury-gray">{prod.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-luxury-gold">{prod.sales_qty} vendus</div>
                  <div className="text-xs text-luxury-gray">{prod.price.toFixed(2)} €</div>
                </div>
              </div>
            ))}
            {popular_products.length === 0 && (
              <p className="text-sm text-luxury-gray text-center py-6">Aucune vente enregistrée.</p>
            )}
          </div>
        </div>

      </div>

      {/* Latest Orders & Contact Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latest Orders */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-luxury-charcoal">Dernières Commandes</h3>
            <Link to="/admin/orders" className="text-xs text-luxury-gold hover:underline flex items-center gap-1">
              Voir tout <FiArrowRight />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-luxury-light-gray text-xs text-luxury-gray uppercase tracking-wider">
                  <th className="py-3">Client</th>
                  <th className="py-3">Ville</th>
                  <th className="py-3">Montant</th>
                  <th className="py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {latest_orders.map((order) => (
                  <tr key={order.id} className="border-b border-luxury-light-gray last:border-0 hover:bg-luxury-light-gray/20 transition-all duration-200">
                    <td className="py-3 font-semibold">{order.customer_name}</td>
                    <td className="py-3 text-luxury-gray">{order.city}</td>
                    <td className="py-3 font-medium text-luxury-charcoal">{parseFloat(order.total_price).toFixed(2)} €</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${
                        order.status === 'En attente' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'Confirmée' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Expédiée' ? 'bg-sky-100 text-sky-700' :
                        order.status === 'Livrée' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {latest_orders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-luxury-gray">Aucune commande récente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Contact Messages */}
        <div className="p-6 bg-white border border-luxury-gold/10 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-luxury-charcoal">Derniers Messages</h3>
            <Link to="/admin/contacts" className="text-xs text-luxury-gold hover:underline flex items-center gap-1">
              Consulter <FiArrowRight />
            </Link>
          </div>
          <div className="space-y-4">
            {latest_messages.map((msg) => (
              <div key={msg.id} className={`p-4 rounded border transition-all duration-200 ${
                msg.is_read 
                  ? 'bg-luxury-light-gray/20 border-luxury-light-gray' 
                  : 'bg-luxury-gold/5 border-luxury-gold/20 shadow-sm'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-semibold text-luxury-charcoal">{msg.name}</span>
                    <span className="text-xs text-luxury-gray block">{msg.email}</span>
                  </div>
                  {!msg.is_read && (
                    <span className="text-[10px] bg-luxury-gold text-luxury-charcoal font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Nouveau
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs font-semibold text-luxury-charcoal">Sujet : {msg.subject}</div>
                <p className="mt-1 text-xs text-luxury-gray line-clamp-2">{msg.message}</p>
              </div>
            ))}
            {latest_messages.length === 0 && (
              <p className="text-sm text-luxury-gray text-center py-6">Aucun message reçu.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
