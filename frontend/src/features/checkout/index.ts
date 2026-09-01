/**
 * CHECKOUT FEATURE — Barrel Export
 *
 * Source de vérité : src/hooks/useAccountHooks.ts (useCreateOrder), src/stores/useCartStore.ts, src/services/orders.service.ts
 * Responsabilité : Processus de commande et paiement.
 */

export { useCreateOrder } from '../../hooks/useAccountHooks';
export { useCartStore } from '../../stores/useCartStore';
export { ordersService } from '../../services/orders.service';

