import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';
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
import Table from '../../components/ui/Table';

export default function Dashboard() {
  // Récupérer toutes les données du tableau de bord
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data),
  });

  if (isLoading) return <Skeleton.Dashboard />;
  if (error) {
    return (
      <Card variant="alert" size="md" animate={false}>
        <Card.Body>
          <p className="text-red-400 font-serif text-center">
            Une erreur est survenue lors du chargement des données du tableau de bord : {error.message}
          </p>
        </Card.Body>
      </Card>
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
        <Card variant="flat" size="xs" animate={false} className="flex items-center gap-2 text-sm text-luxury-gray">
          <Card.Content className="flex-row items-center gap-2 py-2 px-4">
            <FiCalendar className="text-luxury-gold" />
            <span>Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </Card.Content>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric Card: Revenue */}
        <Card variant="statistic" size="md" hoverable animate={false}>
          <Card.Content className="flex-row items-center justify-between">
            <div className="flex flex-col">
              <Card.Subtitle>Chiffre d'Affaires</Card.Subtitle>
              <Card.Title as="span" className="text-2xl font-semibold mt-2">
                {metrics.revenue.toLocaleString('fr-FR')} €
              </Card.Title>
            </div>
            <div className="p-3 bg-luxury-gold/10 text-luxury-gold rounded-lg shrink-0">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </Card.Content>
          <Card.Meta className="mt-2 px-5 pb-4">Commandes non annulées cumulées</Card.Meta>
        </Card>

        {/* Metric Card: Orders */}
        <Card variant="statistic" size="md" hoverable animate={false}>
          <Card.Content className="flex-row items-center justify-between">
            <div className="flex flex-col">
              <Card.Subtitle>Commandes</Card.Subtitle>
              <Card.Title as="span" className="text-2xl font-semibold mt-2">
                {metrics.orders_count}
              </Card.Title>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <FiShoppingCart className="w-6 h-6" />
            </div>
          </Card.Content>
          <Card.Meta className="mt-2 px-5 pb-4 text-blue-600 font-semibold">
            {metrics.pending_orders} commande(s) en attente
          </Card.Meta>
        </Card>

        {/* Metric Card: Unread Messages */}
        <Card variant="statistic" size="md" hoverable animate={false}>
          <Card.Content className="flex-row items-center justify-between">
            <div className="flex flex-col">
              <Card.Subtitle>Messages Contact</Card.Subtitle>
              <Card.Title as="span" className="text-2xl font-semibold mt-2">
                {metrics.unread_contacts}
              </Card.Title>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
              <FiMail className="w-6 h-6" />
            </div>
          </Card.Content>
          <Card.Meta className="mt-2 px-5 pb-4 text-red-600 font-semibold">Messages de contact non lus</Card.Meta>
        </Card>

        {/* Metric Card: Pending Reviews */}
        <Card variant="statistic" size="md" hoverable animate={false}>
          <Card.Content className="flex-row items-center justify-between">
            <div className="flex flex-col">
              <Card.Subtitle>Avis Modération</Card.Subtitle>
              <Card.Title as="span" className="text-2xl font-semibold mt-2">
                {metrics.pending_reviews}
              </Card.Title>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
              <FiStar className="w-6 h-6" />
            </div>
          </Card.Content>
          <Card.Meta className="mt-2 px-5 pb-4 text-yellow-600 font-semibold">Avis clients en attente d'approbation</Card.Meta>
        </Card>

      </div>

      {/* Main Charts & Popular Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Sales Trend Chart */}
        <Card variant="dashboard" size="md" animate={false} className="lg:col-span-2">
          <Card.Header>
            <Card.Title as="h3" className="font-serif text-lg">Évolution des Ventes</Card.Title>
            <Card.Meta>Derniers {sales_chart.length} jours</Card.Meta>
          </Card.Header>
          <Card.Body>
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
          </Card.Body>
        </Card>

        {/* Popular Products List */}
        <Card variant="dashboard" size="md" animate={false}>
          <Card.Header>
            <Card.Title as="h3" className="font-serif text-lg">Produits Populaires</Card.Title>
          </Card.Header>
          <Card.Body>
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
                <Card variant="empty" size="sm" animate={false}>
                  <Card.Body>
                    <p className="text-sm text-luxury-gray text-center py-6">Aucune vente enregistrée.</p>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Card.Body>
        </Card>

      </div>

      {/* Latest Orders & Contact Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latest Orders */}
        <Card variant="dashboard" size="md" animate={false}>
          <Card.Header>
            <Card.Title as="h3" className="font-serif text-lg">Dernières Commandes</Card.Title>
            <Link to="/admin/orders" className="text-xs text-luxury-gold hover:underline flex items-center gap-1">
              Voir tout <FiArrowRight />
            </Link>
          </Card.Header>
          <Card.Body className="!p-0">
            <Table aria-label="Dernières commandes" variant="dashboard" density="comfortable">
              <Table.Container>
                <Table.Head>
                  <Table.HeadRow>
                    <Table.HeadCell>Client</Table.HeadCell>
                    <Table.HeadCell hideBelow="lg">Ville</Table.HeadCell>
                    <Table.HeadCell align="right">Montant</Table.HeadCell>
                    <Table.HeadCell>Statut</Table.HeadCell>
                  </Table.HeadRow>
                </Table.Head>
                <Table.Body>
                  {latest_orders.map((order) => (
                    <Table.Row key={order.id}>
                      <Table.Cell>
                        <Table.PrimaryText>{order.customer_name}</Table.PrimaryText>
                      </Table.Cell>
                      <Table.Cell hideBelow="lg">
                        {order.city}
                      </Table.Cell>
                      <Table.Cell align="right" numeric>
                        {parseFloat(order.total_price).toFixed(2)} €
                      </Table.Cell>
                      <Table.Cell>
                        <Table.StatusBadge status={order.status} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  <Table.Empty
                    visible={latest_orders.length === 0}
                    colSpan={4}
                    icon={<FiShoppingCart />}
                    title="Aucune commande récente"
                  />
                </Table.Body>
              </Table.Container>
            </Table>
          </Card.Body>
        </Card>

        {/* Latest Contact Messages */}
        <Card variant="dashboard" size="md" animate={false}>
          <Card.Header>
            <Card.Title as="h3" className="font-serif text-lg">Derniers Messages</Card.Title>
            <Link to="/admin/contacts" className="text-xs text-luxury-gold hover:underline flex items-center gap-1">
              Consulter <FiArrowRight />
            </Link>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {latest_messages.map((msg) => (
                <Card
                  key={msg.id}
                  variant={msg.is_read ? 'flat' : 'outlined'}
                  size="sm"
                  animate={false}
                  className={!msg.is_read ? 'border-luxury-gold/20 bg-luxury-gold/5' : ''}
                >
                  <Card.Content>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-semibold text-luxury-charcoal">{msg.name}</span>
                        <span className="text-xs text-luxury-gray block">{msg.email}</span>
                      </div>
                      {!msg.is_read && (
                        <Card.Badge variant="featured" position="static" className="text-[10px]">
                          Nouveau
                        </Card.Badge>
                      )}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-luxury-charcoal">Sujet : {msg.subject}</div>
                    <p className="mt-1 text-xs text-luxury-gray line-clamp-2">{msg.message}</p>
                  </Card.Content>
                </Card>
              ))}
              {latest_messages.length === 0 && (
                <Card variant="empty" size="sm" animate={false}>
                  <Card.Body>
                    <p className="text-sm text-luxury-gray text-center py-4">Aucun message reçu.</p>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Card.Body>
        </Card>

      </div>

    </div>
  );
}
