/**
 * CHECKOUT FEATURE — Barrel Export
 *
 * Responsibility: Multi-step checkout flow.
 * Steps: Address Selection → Order Summary → Payment → Confirmation
 * Consumes: ordersService, useCartStore, useAuthStore
 *
 * Internal structure:
 *   components/  — CheckoutSteps, AddressSelector, OrderSummaryPanel, PaymentForm
 *   hooks/       — useCheckout, useCreateOrder
 *   pages/       — CheckoutPage, OrderConfirmationPage
 */

// Hooks are created during the Checkout feature phase
