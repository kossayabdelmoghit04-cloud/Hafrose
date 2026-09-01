/**
 * ORDERS FEATURE — Barrel Export
 *
 * Source de vérité : src/hooks/useAccountHooks.ts & src/services/orders.service.ts
 * Responsabilité : Consultation et suivi des commandes client.
 */

export {
  useOrders,
  useOrderDetail,
  useCreateOrder,
} from '../../hooks/useAccountHooks';
export { ordersService } from '../../services/orders.service';

