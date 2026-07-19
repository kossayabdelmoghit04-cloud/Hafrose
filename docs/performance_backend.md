# Optimisation des performances Backend — Hafrose (Phase 5.1)

Ce document présente l'audit et l'ensemble des optimisations de performances apportées au backend Laravel 12 de l'application Hafrose, sans altérer son comportement fonctionnel.

---

## 1. Synthèse des Optimisations Réalisées

### 1.1. Optimisations Eloquent & Réduction du Lazy Loading (N+1)
- **`WishlistService::isFavorite()`** : Remplacement du chargement de l'élément entier (`findForUserAndProduct`) par une requête d'existence légère (`exists()`). Cela évite l'instanciation inutile de modèles Eloquent et économise de la mémoire.
- **`WishlistService::removeProductFromWishlist()`** : Utilisation de `loadMissing('product')` pour éviter le lazy loading implicite généré lors de la journalisation de l'activité (accès à `$wishlistItem->product?->name`).
- **`OrderService::updateOrderStatus()`** : Ajout de `loadMissing('orderItems')` pour garantir que la liste des articles d'une commande est chargée de manière optimisée avant de mettre à jour les stocks, évitant ainsi une requête additionnelle non planifiée.

### 1.2. Optimisations SQL & Requêtes Agregées
- **`DashboardService::getMetrics()`** : Fusion de 3 requêtes de comptage/somme sur la table `orders` (nombre total, commandes en attente, et chiffre d'affaires cumulé) en une seule requête SQL agrégée (`selectRaw`).
- **`DashboardService::getPopularProducts()`** : Remplacement de la sous-requête corrélée générée par `whereHas('order', ...)` par une jointure SQL directe (`join`), permettant un plan d'exécution optimal avec utilisation d'index.
- **Sélection des colonnes utiles** : Modification de `getLatestOrders()` et `getLatestMessages()` pour sélectionner uniquement les colonnes requises à l'affichage (ex. : évite de rapatrier les longs champs comme le message de contact ou l'adresse complète).
- **`ProductRepository::paginateWithFilters()`** : Externalisation des appels de vérification de schéma (`Schema::hasColumn`) en dehors des fermetures (closures) de requêtes pour éviter des introspections de base de données répétées.

### 1.3. Optimisations des Écritures (Batching)
- **`SettingRepository::updateMultiple()`** : Remplacement de boucles d'écritures individuelles (`updateOrCreate` répété N fois) par une seule requête d'insertion en masse avec clause de mise à jour (`upsert`). Le nombre de requêtes SQL pour sauvegarder les paramètres du site passe de N à 1.

---

## 2. Indexation de la Base de Données

Une migration spécifique (`2026_07_19_180000_add_performance_indexes.php`) a été ajoutée pour poser les index indispensables au bon fonctionnement de l'application en production :

| Table | Colonne(s) | Nom de l'index | Rôle de l'optimisation |
| :--- | :--- | :--- | :--- |
| **`orders`** | `created_at` | `orders_created_at_idx` | Optimise le tri chronologique (`getLatestOrders()`) et le filtre/groupement par date (`getSalesChartData()`). |
| **`contacts`** | `is_read` | `contacts_is_read_idx` | Optimise le calcul des messages non lus du tableau de bord. |
| **`contacts`** | `created_at` | `contacts_created_at_idx` | Accélère le tri chronologique des messages clients. |
| **`order_items`** | `product_id` | `order_items_product_id_idx` | Accélère le GROUP BY et le JOIN pour identifier les produits populaires. |

> [!NOTE]
> Les index existants (`products.slug` (unique), `products.is_featured`, `reviews.is_approved`, `orders.status`, ainsi que les index sur les tables de logs) ont été contrôlés et jugés déjà optimisés.

---

## 3. Résultats des Tests de Non-Régression

La suite complète de tests de l'application (199 tests, 645 assertions) a été exécutée avec succès après application des optimisations et de la migration. Aucune régression fonctionnelle n'a été détectée :

```bash
php artisan test
```
```text
Tests:    199 passed (645 assertions)
Duration: 22.65s
```

---

## 4. Recommandations pour la Production

Pour maximiser les gains de performance en environnement de production, les commandes de mise en cache natives de Laravel doivent être exécutées :

1. **Mise en cache de la configuration** :
   ```bash
   php artisan config:cache
   ```
2. **Mise en cache des routes** :
   ```bash
   php artisan route:cache
   ```
3. **Mise en cache des vues Blade** :
   ```bash
   php artisan view:cache
   ```
4. **Optimisation d'Autoload de Composer** :
   ```bash
   composer install --optimize-autoloader --no-dev
   ```
5. **Driver de Cache** :
   S'assurer que `CACHE_STORE` utilise une solution en mémoire performante (Redis ou Memcached) au lieu du driver `database` ou `file` en production.
