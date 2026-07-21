<?php

namespace App\Services;

class DashboardService
{
    public function __construct(
        protected DashboardStatsService $statsService
    ) {}

    /**
     * Obtenir toutes les statistiques clés pour le tableau de bord.
     */
    public function getMetrics(): array
    {
        return $this->statsService->getMetrics();
    }

    /**
     * Obtenir les données pour le graphique des ventes (15 derniers jours).
     */
    public function getSalesChartData(int $days = 15): array
    {
        return $this->statsService->getSalesChartData($days);
    }

    /**
     * Obtenir les produits populaires (les plus vendus).
     */
    public function getPopularProducts(int $limit = 5): array
    {
        return $this->statsService->getPopularProducts($limit);
    }

    /**
     * Obtenir les 5 dernières commandes.
     */
    public function getLatestOrders(int $limit = 5): array
    {
        return $this->statsService->getLatestOrders($limit);
    }

    /**
     * Obtenir les 5 derniers messages de contact.
     */
    public function getLatestMessages(int $limit = 5): array
    {
        return $this->statsService->getLatestMessages($limit);
    }
}
