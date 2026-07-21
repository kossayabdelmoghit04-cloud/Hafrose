# API Produits Avancés — HAFROSE Phase 5.4

> **Base URL** : `/api`  
> **Authentification** : non requise (endpoints publics)  
> **Format** : JSON  
> **Pagination** : Laravel standard (`data`, `links`, `meta`)

---

## 1. Produits similaires

Retourne les produits de la même catégorie triés par proximité de prix.  
Si la catégorie contient peu de résultats, complète avec les produits les plus récents.

### Endpoint

```
GET /api/products/{product}/similar
```

### Paramètres

| Paramètre | Type    | Requis | Défaut | Description                         |
|-----------|---------|--------|--------|-------------------------------------|
| `limit`   | integer | Non    | `4`    | Nombre de produits retournés (1–8) |

### Exemple de requête

```bash
GET /api/products/42/similar?limit=4
```

### Exemple de réponse

```json
{
    "success": true,
    "message": "Produits similaires récupérés avec succès.",
    "errors": null,
    "data": [
        {
            "id": 10,
            "name": "Sac Cuir Premium",
            "slug": "sac-cuir-premium",
            "price": "1290.00",
            "category": { "id": 3, "name": "Sacs", "slug": "sacs" }
        }
    ]
}
```

### Erreurs

| Code | Cas                         |
|------|-----------------------------|
| 404  | Produit introuvable         |
| 422  | `limit` invalide (hors 1–8) |

---

## 2. Produits populaires

Retourne les produits les plus populaires selon un score pondéré :

```
score = (nb_commandes × 3.0) + (note_moyenne × 5.0) + (nb_avis × 2.0)
```

Les poids sont configurables dans `config/recommendations.php`.

### Endpoint

```
GET /api/products/popular
```

### Paramètres

| Paramètre | Type    | Requis | Défaut | Description                          |
|-----------|---------|--------|--------|--------------------------------------|
| `limit`   | integer | Non    | `8`    | Nombre de produits retournés (1–20) |

### Exemple de requête

```bash
GET /api/products/popular?limit=6
```

### Exemple de réponse

```json
{
    "success": true,
    "message": "Produits populaires récupérés avec succès.",
    "errors": null,
    "data": [
        {
            "id": 7,
            "name": "Collier Or 18k",
            "slug": "collier-or-18k",
            "price": "4500.00",
            "order_items_count": 24,
            "approved_reviews_count": 12,
            "approved_reviews_avg_rating": 4.8
        }
    ]
}
```

### Erreurs

| Code | Cas                          |
|------|------------------------------|
| 422  | `limit` invalide (hors 1–20) |

---

## 3. Recherche avancée

Recherche multicritère avec filtres et tris personnalisés. Pagine les résultats.

### Endpoint

```
GET /api/products/search
```

### Paramètres

| Paramètre   | Type    | Requis | Défaut   | Description                                                                     |
|-------------|---------|--------|----------|---------------------------------------------------------------------------------|
| `q`         | string  | Non    | –        | Texte libre (nom, description, slug, nom de catégorie)                         |
| `category`  | string  | Non    | –        | Slug ou ID de catégorie                                                         |
| `price_min` | numeric | Non    | –        | Prix minimum (≥ 0)                                                             |
| `price_max` | numeric | Non    | –        | Prix maximum (doit être ≥ `price_min` si les deux sont fournis)                |
| `brand`     | string  | Non    | –        | Marque exacte                                                                   |
| `sort`      | string  | Non    | `newest` | Tri : `newest`, `oldest`, `price_asc`, `price_desc`, `rating`, `popular`       |
| `per_page`  | integer | Non    | `12`     | Résultats par page (1–50)                                                       |

### Logique de recherche textuelle (`q`)

Le paramètre `q` effectue une recherche `LIKE` sur :
- `products.name`
- `products.description`
- `products.slug`
- `categories.name` (via relation)
- `categories.slug` (via relation)

### Valeurs de tri

| Valeur       | Comportement                                           |
|--------------|--------------------------------------------------------|
| `newest`     | Plus récents en premier (défaut)                      |
| `oldest`     | Plus anciens en premier                               |
| `price_asc`  | Prix croissant                                        |
| `price_desc` | Prix décroissant                                      |
| `rating`     | Meilleure note moyenne (avis approuvés) en premier    |
| `popular`    | Score pondéré (commandes + note + avis) en premier   |

### Exemple de requête

```bash
GET /api/products/search?q=sac&category=maroquinerie&price_min=500&price_max=3000&sort=price_asc&per_page=12
```

### Exemple de réponse

```json
{
    "success": true,
    "message": "Résultats de recherche récupérés avec succès.",
    "errors": null,
    "data": {
        "data": [
            {
                "id": 5,
                "name": "Sac Cabas Cuir",
                "slug": "sac-cabas-cuir",
                "price": "890.00",
                "category": { "id": 2, "name": "Maroquinerie", "slug": "maroquinerie" }
            }
        ],
        "links": { "first": "...", "last": "...", "prev": null, "next": null },
        "meta": {
            "current_page": 1,
            "from": 1,
            "last_page": 1,
            "per_page": 12,
            "to": 1,
            "total": 1
        }
    }
}
```

### Erreurs

| Code | Cas                                                    |
|------|--------------------------------------------------------|
| 422  | `price_min` négatif, `price_max` < `price_min`, etc.  |

---

## 4. Filtres dynamiques

Retourne toutes les valeurs disponibles pour filtrer le catalogue : catégories, plage de prix, marques et statistiques globales.

### Endpoint

```
GET /api/products/filters
```

### Paramètres

Aucun.

### Exemple de réponse

```json
{
    "success": true,
    "message": "Filtres récupérés avec succès.",
    "errors": null,
    "data": {
        "categories": [
            { "id": 1, "name": "Bijoux", "slug": "bijoux" },
            { "id": 2, "name": "Maroquinerie", "slug": "maroquinerie" }
        ],
        "price": {
            "min": 150.00,
            "max": 12000.00
        },
        "products_count": 48,
        "brands": ["Hafrose", "Artisan Local", "Prestige"],
        "statistics": {
            "average_price": 2340.50,
            "total_stock": 312,
            "featured_count": 8
        }
    }
}
```

---

## Configuration

Les poids de popularité sont définis dans `config/recommendations.php` :

```php
'popularity_weights' => [
    'orders'  => 3.0,  // Nombre de commandes
    'rating'  => 5.0,  // Note moyenne
    'reviews' => 2.0,  // Nombre d'avis
],
```

---

## Architecture

```
ProductController
    └── ProductService
            └── ProductRepository (Eloquent)
                    ├── getRelatedProducts()
                    ├── getPopularProductsWithWeights()
                    ├── searchAdvanced()
                    └── getFilters()
```

Chaque méthode respecte le pattern **Service → Repository** avec `FormRequest` pour la validation.

---

## Tests

```bash
php artisan test --filter=AdvancedProductApiTest
```

**12 tests — 103 assertions — 100% passing**
