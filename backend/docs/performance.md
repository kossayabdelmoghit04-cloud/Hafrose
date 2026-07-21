# Architecture de Performance & Cache Backend — HAFROSE

## Vue d'ensemble

Le système de performance du backend Laravel 12 HAFROSE est conçu pour optimiser la réactivité de l'application, réduire la charge sur la base de données MySQL et minimiser la consommation de ressources réseau et mémoire.

---

## 1. Architecture & Stratégie de Cache

### PerformanceCacheManager
Le service `App\Services\PerformanceCacheManager` centralise la gestion du cache.
- **Transparence et Fallback** : Si le driver de cache ne supporte pas les tags (ex: driver `database` ou `file`), la gestion par clés explicites prend le relais de manière transparente.
- **Interrupteur Global** : La mise en cache peut être désactivée via `CACHE_PERFORMANCE_ENABLED=false` sans modifier le code applicatif.

### Fichier de Configuration (`config/cache-performance.php`)
Permet d'ajuster l'intégralité des paramètres de performance :

```php
return [
    'enabled' => env('CACHE_PERFORMANCE_ENABLED', true),
    'ttls' => [
        'products'          => 3600,     // 1 heure
        'categories'        => 86400,    // 24 heures
        'dashboard'         => 1800,     // 30 minutes
        'statistics'        => 1800,     // 30 minutes
        'search'            => 600,      // 10 minutes
        'filters'           => 3600,     // 1 heure
        'popular_products'  => 3600,     // 1 heure
        'similar_products'  => 3600,     // 1 heure
        'public_config'     => 86400,    // 24 heures
    ],
    'pagination' => [
        'max_per_page'      => 100,
        'default_per_page'  => 12,
    ],
    'images' => [
        'quality' => 85,
        'sizes' => [
            'thumbnail' => ['width' => 150, 'height' => 150, 'crop' => true],
            'medium'    => ['width' => 600, 'height' => 600, 'crop' => false],
            'large'     => ['width' => 1200, 'height' => 1200, 'crop' => false],
        ],
    ],
];
```

---

## 2. Invalidation Automatique (Observers)

Toute création, modification ou suppression d'un modèle invalide automatiquement les caches associés via les Observers Eloquent enregistrés dans `AppServiceProvider` :

| Modèle | Observer | Caches Invalidés |
|---|---|---|
| `Product` | `ProductObserver` | Liste produits, filtres, populaires, similaires, dashboard metrics |
| `Category` | `CategoryObserver` | Liste catégories, filtres boutique, dashboard metrics |
| `Order` | `OrderObserver` | Métriques dashboard, graphique des ventes, produits populaires |
| `Review` | `ReviewObserver` | Liste des avis approuvés, note moyenne produit, dashboard metrics |
| `Contact` | `ContactObserver` | Derniers messages contact, métriques dashboard |

---

## 3. Cache des Statistiques du Dashboard (`DashboardStatsService`)

Le service `DashboardStatsService` calcule et met en cache l'ensemble des données du tableau de bord d'administration :
- Métriques clés (nombre de produits, catégories, commandes, CA total, avis en attente, messages non lus).
- Graphique d'évolution des ventes sur 15 jours.
- Produits les plus vendus.
- Dernières commandes et derniers messages.

### Endpoint de rafraîchissement forcé
Les administrateurs peuvent forcer le rafraîchissement du cache du tableau de bord :
`POST /api/admin/cache/dashboard/refresh`

---

## 4. Optimisation des Requêtes Eloquent (Anti N+1 & Query Slimming)

Toutes les méthodes des Repositories ont été optimisées :
1. **Eager Loading Systématique** : `with(['category', 'galleries'])` et `with(['orderItems.product'])` sont appliqués sur toutes les requêtes de liste et détails pour supprimer définitivement le problème des requêtes N+1.
2. **Sélection Restreinte de Colonnes** : Utilisation de `select('id', 'name', 'slug', 'price')` dans les fermetures eager loading pour charger uniquement les attributs requis par l'API.
3. **Agrégats SQL Directs** : Calcul des filtres, des prix min/max, et du stock total en une seule requête `selectRaw('MIN(price) as min_price, MAX(price) as max_price...')`.

---

## 5. Pagination Contrôlée & Plafonnée

Pour éviter la surcharge serveur via des paramètres `per_page` démesurés :
- `per_page` est plafonné à `PAGINATION_MAX_PER_PAGE` (100 par défaut).
- Support natif des paramètres `page` et `per_page`.

---

## 6. Service d'Optimisation des Images (`ImageOptimizationService`)

Traitement automatique des images téléversées en backend :
- **Formats supportés** : JPEG, PNG, WEBP.
- **Conservation de l'original** : L'image source originale est préservée intacte.
- **Génération automatique des déclinaisons** :
  - `thumbnail` (150x150 pixels, rogné/crop)
  - `medium` (600x600 pixels, ratio conservé)
  - `large` (1200x1200 pixels, ratio conservé)
- **Nettoyage automatique** : La suppression d'une image entraîne la suppression physique de toutes ses déclinaisons sur le stockage.

---

## 7. APIs d'Administration du Cache

Toutes protégées par Sanctum (`auth:sanctum`) et le rôle `admin` (`middleware: admin`) :

1. `POST /api/admin/cache/clear` : Vider l'intégralité du cache de performance.
2. `POST /api/admin/cache/dashboard/refresh` : Forcer le recalcul des statistiques et métriques.
3. `GET /api/admin/cache/status` : Consulter l'état du cache (driver actif, état hit/miss des clés principales, TTLs configurés).

---

## 8. Monitoring Interne en Développement

En environnement de développement (`PERFORMANCE_MONITORING_ENABLED=true`), le middleware `PerformanceMonitoringMiddleware` injecte des en-têtes HTTP de diagnostic sans altérer la structure JSON des réponses :
- `X-Perf-Time-Ms` : Temps d'exécution du serveur en millisecondes.
- `X-Perf-Memory-Peak-Mb` : Pic de consommation mémoire en Mo.
- `X-Perf-SQL-Queries` : Nombre exact de requêtes SQL exécutées pendant la requête.

---

## 9. Bonnes Pratiques & Maintenance

1. **Changement de driver** : Pour un environnement haute charge, passer à Redis dans le fichier `.env` (`CACHE_STORE=redis`) pour activer le support natif des tags de cache.
2. **Vérification régulière** : Exécuter `php artisan test` lors de toute modification de modèle pour vérifier qu'aucun Observer ne manque à l'invalidation.
