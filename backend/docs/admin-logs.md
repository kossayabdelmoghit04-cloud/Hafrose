# Administration Logging — HAFROSE Backend

> **Phase 5.5.3** — Journalisation d'Administration  
> Système centralisé, réutilisable et sécurisé d'audit des actions administrateur.

---

## Table des matières

1. [Architecture](#architecture)
2. [Base de données](#base-de-données)
3. [Service AdminLogService](#service-adminlogservice)
4. [Actions journalisées](#actions-journalisées)
5. [API d'Administration](#api-dadministration)
6. [Filtres et Recherche](#filtres-et-recherche)
7. [Exemples de réponses API](#exemples-de-réponses-api)
8. [Sécurité et Immuabilité](#sécurité-et-immuabilité)
9. [Maintenance](#maintenance)

---

## Architecture

Le système d'administration logging repose sur une couche dédiée :

```
Contrôleur Admin (ex: ProductController)
        │
        ▼
AdminLogService::log()
        │
        ├── Auto-sanitization (exclut passwords, tokens, secrets)
        ├── Capture IP, User-Agent, URL, Méthode HTTP
        └── Génération d'une description lisible par défaut
        │
        ▼
Modèle AdminLog ──► Table Database `admin_logs`
        │
        ▼
GET /api/admin/logs ──► AdminLogController ──► AdminLogResource
```

### Composants principaux

| Composant | Chemin | Rôle |
|---|---|---|
| **Modèle** | `app/Models/AdminLog.php` | Représente l'entrée de log d'administration |
| **Service** | `app/Services/AdminLogService.php` | Enregistre, nettoie et formate les logs |
| **Contrôleur** | `app/Http/Controllers/Api/Admin/AdminLogController.php` | Endpoint de consultation des logs |
| **FormRequest** | `app/Http/Requests/AdminLogIndexRequest.php` | Valide les filtres et paramètres de pagination |
| **Resource** | `app/Http/Resources/AdminLogResource.php` | Formate le contrat de réponse JSON |
| **Migration** | `database/migrations/2026_07_21_180000_add_details_to_admin_logs_table.php` | Migration ajoutant `description`, `url`, `method` |

---

## Base de données

Fichier migration : `database/migrations/2026_07_17_200000_create_admin_logs_table.php` + `2026_07_21_180000_add_details_to_admin_logs_table.php`

### Structure de la table `admin_logs`

| Colonne | Type | Description |
|---|---|---|
| `id` | `bigint` (unsigned, PK) | Identifiant unique du log |
| `admin_id` | `bigint` (nullable, FK -> `users.id`) | ID de l'administrateur |
| `action` | `varchar(50)` (indexed) | Type d'action (`create`, `update`, `delete`, etc.) |
| `resource` | `varchar(100)` (indexed) | Type de ressource (`product`, `category`, `order`, etc.) |
| `resource_id` | `bigint` (nullable) | Identifiant de la ressource impactée |
| `description` | `varchar(255)` (nullable) | Résumé lisible de l'action |
| `old_values` | `json` (nullable) | Valeurs avant modification |
| `new_values` | `json` (nullable) | Valeurs après modification |
| `ip_address` | `varchar(45)` (nullable) | Adresse IP du client |
| `user_agent` | `text` (nullable) | User-Agent du navigateur/client |
| `url` | `varchar(500)` (nullable) | URL complète de la requête |
| `method` | `varchar(10)` (nullable) | Méthode HTTP (`GET`, `POST`, `PATCH`, `DELETE`) |
| `created_at` | `timestamp` (indexed) | Horodatage de l'action |
| `updated_at` | `timestamp` | Horodatage de mise à jour |

---

## Service AdminLogService

`app/Services/AdminLogService.php`

```php
$adminLogService->log(
    request:     $request,
    action:      AdminLog::ACTION_CREATE,
    resource:    AdminLog::RESOURCE_PRODUCT,
    resourceId:  $product->id,
    description: "Création du produit : {$product->name}",
    oldValues:   $oldValues,
    newValues:   $newValues,
);
```

### Fonctionnalités du service
1. **Sanitisation automatique** : supprime les clés sensibles (`password`, `token`, `secret`, `credit_card`, `cvv`, etc.) de `old_values` et `new_values`.
2. **Génération de description** : si `$description` n'est pas fournie, génère une description compréhensible automatique (ex: *"Modification de Product #12"*).
3. **Capture d'environnement** : enregistre l'IP, le User-Agent, l'URL complète et la méthode HTTP depuis l'objet `Illuminate\Http\Request`.
4. **Tolérance aux pannes** : tout échec d'écriture de log est capturé par `try/catch` et tracé dans `Log::error`, évitant ainsi d'interrompre le flux métier principal.

---

## Actions journalisées

| Domaine | Actions |
|---|---|
| **Produits** | `create`, `update`, `delete` |
| **Catégories** | `create`, `update`, `delete` |
| **Commandes** | `status_change`, `export` (PDF) |
| **Avis** | `approve`, `reject`, `delete` |
| **Contacts** | `mark_read`, `delete` |
| **Authentification** | `login`, `logout` |
| **Paramètres** | `update` |
| **Médiathèque** | `upload`, `delete` |

---

## API d'Administration

Endpoints protégés par `auth:sanctum` et le middleware `admin`.

### 1. Liste des logs d'administration

- **Route** : `GET /api/admin/logs`
- **Méthode** : `GET`
- **Droits** : Administrateur uniquement.

#### Paramètres de requête (query params)

| Paramètre | Type | Par défaut | Description |
|---|---|---|---|
| `per_page` | integer | `15` | Nombre d'éléments par page (max 100) |
| `page` | integer | `1` | Numéro de la page |
| `admin_id` | integer | null | Filtrer par ID administrateur |
| `action` | string | null | Filtrer par action (ex: `create`, `update`, `delete`) |
| `resource` | string | null | Filtrer par ressource (ex: `product`, `category`, `order`) |
| `resource_type` | string | null | Alias de `resource` |
| `search` | string | null | Recherche par mot-clé (description, IP, nom/email admin) |
| `date_from` | string (Y-m-d) | null | Date de début |
| `date_to` | string (Y-m-d) | null | Date de fin |
| `sort_by` | string | `created_at` | Champ de tri (`created_at`, `action`, `resource`, `id`) |
| `sort_order` | string | `desc` | Ordre de tri (`asc` ou `desc`) |

---

### 2. Détail d'un log spécifique

- **Route** : `GET /api/admin/logs/{id}`
- **Méthode** : `GET`
- **Droits** : Administrateur uniquement.

---

## Exemples de réponses API

### Réponse `GET /api/admin/logs`

```json
{
    "success": true,
    "message": null,
    "errors": null,
    "data": [
        {
            "id": 42,
            "admin": {
                "id": 1,
                "name": "Admin Hafrose",
                "email": "admin@hafrose.com",
                "role": "admin"
            },
            "admin_id": 1,
            "action": "update",
            "resource": "product",
            "resource_type": "product",
            "resource_id": 15,
            "description": "Modification du produit : Montre Chrono Or",
            "old_values": {
                "price": 4500.00
            },
            "new_values": {
                "price": 4990.00
            },
            "ip_address": "127.0.0.1",
            "user_agent": "Mozilla/5.0...",
            "url": "http://localhost:8000/api/admin/products/15",
            "method": "POST",
            "created_at": "2026-07-21T17:00:00+00:00"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 73
    }
}
```

---

## Sécurité et Immuabilité

1. **Restriction d'accès** : Les endpoints `/api/admin/logs` sont réservés exclusivement aux administrateurs. Un utilisateur client reçoit un code `403 Forbidden` et un utilisateur non identifié reçoit `401 Unauthorized`.
2. **Immuabilité stricte** : Aucune route de modification (`PUT`, `PATCH`) ni de suppression (`DELETE`) n'est enregistrée pour l'API des logs. L'historique ne peut pas être altéré par le personnel d'administration.
3. **Protection des données sensibles** : Les mots de passe, jetons d'authentification et données bancaires sont filtrés avant sauvegarde en base de données.

---

## Performance

- **N+1 Prevention** : Eager loading de la relation `admin:id,name,email,role`.
- **Index SQL** : Indexation sur `admin_id`, `action`, `resource` et `created_at`.
- **Pagination** : Obligatoire pour limiter la consommation mémoire.

---

*Documentation — Phase 5.5.3 — HAFROSE Backend Laravel 12*
