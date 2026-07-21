# Journal d'Activité Global — Documentation

## Vue d'ensemble

Le Journal d'Activité Global est le système de traçabilité centralisé de HAFROSE.  
Il capture automatiquement tous les événements importants de l'application, qu'ils proviennent des **utilisateurs**, des **administrateurs** ou du **système** (sécurité).

> **Différence avec AdminLog :**  
> `AdminLog` est un journal d'administration technique avec diff old/new values pour les opérations CRUD admin.  
> `ActivityLog` est un journal d'activité global orienté audit métier, couvrant toutes les catégories d'événements.

---

## Architecture

```
app/
├── Models/ActivityLog.php                   # Modèle + constantes de catégories/événements
├── Services/ActivityLogService.php          # Service centralisé (log + sanitisation)
├── Http/
│   ├── Controllers/Api/Admin/
│   │   └── ActivityLogController.php        # API admin read-only (index + show)
│   ├── Requests/ActivityLogIndexRequest.php # Validation des filtres
│   └── Resources/ActivityLogResource.php   # Transformation JSON
tests/Feature/
├── ActivityLogTest.php                      # Tests des événements métier
└── ActivityLogApiTest.php                   # Tests de l'API de consultation
```

---

## Schéma de la table `activity_logs`

| Colonne       | Type           | Description                                      |
|---------------|----------------|--------------------------------------------------|
| `id`          | `bigint`       | Clé primaire auto-incrémentée                    |
| `user_id`     | `bigint\|null` | Utilisateur concerné (null pour les visiteurs)   |
| `event_type`  | `string(100)`  | Type d'événement (ex: `auth.login`)              |
| `category`    | `string(50)`   | Catégorie d'événement (ex: `security`)           |
| `resource`    | `string\|null` | Ressource concernée (ex: `orders`, `api/contact`)|
| `resource_id` | `int\|null`    | ID de la ressource concernée                     |
| `ip_address`  | `string\|null` | Adresse IP du client                             |
| `user_agent`  | `string\|null` | User-Agent du client                             |
| `metadata`    | `json\|null`   | Données contextuelles sanitisées                 |
| `created_at`  | `timestamp`    | Date de création (immuable)                      |
| `updated_at`  | `timestamp`    | Date de mise à jour                              |

---

## Catégories et Événements

### Catégorie `auth`
| Constante                    | Valeur           | Déclencheur                        |
|------------------------------|------------------|------------------------------------|
| `EVENT_USER_REGISTERED`      | `auth.register`  | Inscription utilisateur            |
| `EVENT_USER_LOGIN`           | `auth.login`     | Connexion admin réussie            |
| `EVENT_USER_LOGOUT`          | `auth.logout`    | Déconnexion admin                  |

### Catégorie `order`
| Constante                    | Valeur                  | Déclencheur              |
|------------------------------|-------------------------|--------------------------|
| `EVENT_ORDER_CREATED`        | `order.created`         | Création de commande     |
| `EVENT_ORDER_STATUS_CHANGED` | `order.status_changed`  | Changement de statut     |

### Catégorie `wishlist`
| Constante               | Valeur              | Déclencheur              |
|-------------------------|---------------------|--------------------------|
| `EVENT_WISHLIST_ADDED`  | `wishlist.added`    | Ajout aux favoris        |
| `EVENT_WISHLIST_REMOVED`| `wishlist.removed`  | Retrait des favoris      |

### Catégorie `contact`
| Constante                   | Valeur                 | Déclencheur                     |
|-----------------------------|------------------------|---------------------------------|
| `EVENT_CONTACT_SENT`        | `contact.sent`         | Envoi formulaire de contact     |
| `EVENT_CONTACT_MARKED_READ` | `contact.marked_read`  | Marquage comme lu (admin)       |
| `EVENT_CONTACT_DELETED`     | `contact.deleted`      | Suppression d'un message (admin)|

### Catégorie `review`
| Constante                | Valeur              | Déclencheur              |
|--------------------------|---------------------|--------------------------|
| `EVENT_REVIEW_SUBMITTED` | `review.submitted`  | Soumission d'un avis     |
| `EVENT_REVIEW_APPROVED`  | `review.approved`   | Approbation (admin)      |
| `EVENT_REVIEW_REJECTED`  | `review.rejected`   | Rejet (admin)            |
| `EVENT_REVIEW_DELETED`   | `review.deleted`    | Suppression (admin)      |

### Catégorie `security`
| Constante                    | Valeur                          | Déclencheur                      |
|------------------------------|---------------------------------|----------------------------------|
| `EVENT_HONEYPOT_TRIGGERED`   | `security.honeypot_triggered`   | Bot détecté par honeypot         |
| `EVENT_TURNSTILE_FAILED`     | `security.turnstile_failed`     | Échec de validation CAPTCHA      |

---

## Intégration dans les Services

L'`ActivityLogService` est injecté par DI dans tous les services métier :

```php
// Exemple d'utilisation dans un service métier
$this->activityLogService->log(
    eventType:  ActivityLog::EVENT_ORDER_CREATED,
    category:   ActivityLog::CATEGORY_ORDER,
    resource:   'orders',
    resourceId: $order->id,
    metadata:   [
        'customer'    => $order->customer_name,
        'total_price' => $order->total_price,
        'city'        => $order->city,
    ]
);
```

Les middlewares `BlockSpamHoneypot` et `VerifyTurnstileToken` appellent directement le service :

```php
// Exemple dans BlockSpamHoneypot
$this->activityLogService->log(
    eventType: ActivityLog::EVENT_HONEYPOT_TRIGGERED,
    category:  ActivityLog::CATEGORY_SECURITY,
    resource:  $request->path(),
    metadata:  [
        'method'     => $request->method(),
        'route'      => $request->fullUrl(),
        'field'      => $fieldName,
        'user_agent' => $request->userAgent(),
    ]
);
```

---

## Sanitisation Automatique

Le service sanitise automatiquement les métadonnées à l'écriture. Les clés suivantes sont exclues :

```php
['password', 'password_confirmation', 'token', 'access_token', 'card_number', 'cvv']
```

Les données restantes sont retournées telles quelles par l'API (déjà sécurisées).

---

## API de Consultation

### `GET /api/admin/activity-logs`

> 🔒 Requiert : `Authorization: Bearer {token}` + rôle `admin`

**Paramètres de filtrage :**

| Paramètre    | Type    | Description                                    |
|--------------|---------|------------------------------------------------|
| `category`   | string  | Filtrer par catégorie (`auth`, `security`…)    |
| `event_type` | string  | Filtrer par type d'événement (partiel)         |
| `user_id`    | integer | Filtrer par utilisateur                        |
| `resource`   | string  | Filtrer par ressource (ex: `orders`)           |
| `date_from`  | date    | Filtrer à partir de (format `Y-m-d`)           |
| `date_to`    | date    | Filtrer jusqu'à (format `Y-m-d`)               |
| `search`     | string  | Recherche textuelle                            |
| `sort_by`    | string  | Champ de tri (`created_at`, `category`…)       |
| `sort_order` | string  | `asc` ou `desc` (défaut: `desc`)               |
| `per_page`   | integer | Résultats par page (min: 5, max: 100, défaut: 20) |

**Exemple de réponse :**

```json
{
  "success": true,
  "message": null,
  "errors": null,
  "data": [
    {
      "id": 42,
      "event_type": "security.honeypot_triggered",
      "category": "security",
      "resource": "api/contact",
      "resource_id": null,
      "metadata": {
        "method": "POST",
        "route": "http://localhost/api/contact",
        "field": "website",
        "user_agent": "curl/7.68.0"
      },
      "ip_address": "192.168.1.100",
      "user_agent": "curl/7.68.0",
      "user": null,
      "created_at": "2026-07-21T16:45:00+00:00"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 58
  }
}
```

### `GET /api/admin/activity-logs/{id}`

Retourne le détail d'une entrée. Structure identique à un élément du tableau `data` ci-dessus.

**Erreur 404 :**

```json
{
  "success": false,
  "message": "Entrée du journal d'activité introuvable.",
  "errors": null,
  "data": null
}
```

---

## Règles d'Immutabilité

Le journal d'activité est **strictement en lecture seule via l'API** :

- Seuls les verbes `GET` sont exposés.
- Aucun endpoint `POST`, `PUT`, `PATCH`, `DELETE` n'existe.
- Les modifications directes en base ne sont pas interdites côté applicatif (pour les seeds et tests), mais aucune route API ne le permet.

---

## Exécution des Tests

```bash
# Tous les tests Activity Log
php artisan test --filter=ActivityLog

# Suite API uniquement
php artisan test --filter=ActivityLogApiTest

# Suite événements métier uniquement
php artisan test --filter=ActivityLogTest
```
