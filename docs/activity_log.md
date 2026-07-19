# Journal d'activité global (Activity Log)

## Présentation

Le journal d'activité global permet de tracer les événements métier clés de l'application HAFROSE, aussi bien pour les utilisateurs que pour les administrateurs. Il est entièrement distinct du journal des actions d'administration afin d'assurer une séparation claire des responsabilités.

Ce système est développé sans dépendance externe en utilisant uniquement les fonctionnalités natives de Laravel 12.

---

## Architecture

Le journal d'activité repose sur les composants suivants :

### 1. Base de données
- **Table** : `activity_logs`
- **Modèle** : `App\Models\ActivityLog`
- Contient les champs nécessaires à l'analyse post-événement (qui, quoi, quand, métadonnées non sensibles).

### 2. Service centralisé
- **Classe** : `App\Services\ActivityLogService`
- Méthode principale : `log(string $eventType, string $category, ?string $resource = null, ?int $resourceId = null, ?array $metadata = null, ?int $userId = null): void`
- **Sécurité et résilience** :
  - L'IP et le User-Agent sont automatiquement extraits de la requête courante en utilisant le helper `request()` de Laravel.
  - L'opération d'écriture est encapsulée dans un bloc `try-catch`. Si l'enregistrement en base de données échoue (ex. problème de base de données), l'exception est interceptée et consignée dans les logs système (`storage/logs/laravel.log`) pour éviter d'interrompre l'expérience utilisateur ou les opérations métier.
  - Les métadonnées sont expurgées de toute donnée sensible (ex. `password`, `token`, `access_token`, etc.) via une méthode de filtrage préventif (`sanitizeMetadata`).

### 3. Intégration métier
L'intégration est effectuée directement au niveau de la couche des services métier de l'application. Cela garantit que les actions sont tracées peu importe d'où elles sont appelées (API, CLI, Events, etc.).

---

## Événements suivis

| Événement (Constante de type) | Catégorie | Déclencheur | Métadonnées enregistrées |
|---|---|---|---|
| `auth.register` | `auth` | Inscription d'un utilisateur *(supporté pour évolutions futures)* | Non applicable |
| `auth.login` | `auth` | Connexion réussie d'un utilisateur/administrateur | `email` |
| `auth.logout` | `auth` | Déconnexion d'un utilisateur/administrateur | Aucune |
| `order.created` | `order` | Création d'une commande client réussie | `customer`, `total_price`, `city` |
| `order.status_changed` | `order` | Changement de statut d'une commande par l'administrateur | `old_status`, `new_status` |
| `wishlist.added` | `wishlist` | Ajout réussi d'un produit aux favoris | `product_name` |
| `wishlist.removed` | `wishlist` | Suppression réussie d'un produit des favoris | `product_name` |
| `contact.sent` | `contact` | Envoi d'un message de contact public | `name`, `email`, `subject` |
| `contact.marked_read` | `contact` | Marquage d'un message comme lu par l'administrateur | `name`, `subject` |
| `contact.deleted` | `contact` | Suppression d'un message de contact | `name`, `subject` |
| `review.submitted` | `review` | Soumission réussie d'un avis client public | `customer_name`, `rating`, `product_id` |
| `review.approved` | `review` | Approbation d'un avis par l'administrateur | `customer_name`, `rating` |
| `review.rejected` | `review` | Rejet d'un avis par l'administrateur | `customer_name`, `rating` |
| `review.deleted` | `review` | Suppression d'un avis par l'administrateur | `customer_name`, `rating` |

> [!NOTE]
> Les requêtes échouées (ex. mot de passe incorrect, stock insuffisant lors d'une commande, formulaire invalide) ne génèrent **aucune** activité grâce au mécanisme transactionnel SQL et aux validations préalables.

---

## Informations enregistrées

Pour chaque entrée du journal, les informations suivantes sont collectées et enregistrées :

- **`user_id`** (BigInt, nullable) : L'identifiant de l'utilisateur ou administrateur connecté à l'origine de l'action.
- **`event_type`** (String) : Le type précis de l'action (ex: `order.created`).
- **`category`** (String) : La catégorie globale de l'action (ex: `order`).
- **`resource`** (String, nullable) : Le nom de la table ou de l'entité concernée (ex: `orders`).
- **`resource_id`** (BigInt, nullable) : L'identifiant unique de la ressource concernée.
- **`ip_address`** (String, nullable) : L'adresse IP de l'utilisateur au format IPv4/IPv6.
- **`user_agent`** (Text, nullable) : Le User-Agent brut du navigateur ou du client HTTP ayant émis la requête.
- **`metadata`** (JSON, nullable) : Objet contenant des informations contextuelles non sensibles pertinentes pour l'événement.
- **`created_at`** (Timestamp) : Date et heure précises de l'événement.

---

## Recommandations de conservation des données (RGPD / GDPR)

### 1. Durée de conservation
En vertu du RGPD, la conservation de données personnelles (telles que l'adresse IP, le nom, l'email ou les comportements d'achat) doit être proportionnée aux finalités de sécurité ou de statistiques.
- **Sécurité et prévention de la fraude** : Conserver les adresses IP et les logs d'activité pendant **6 mois maximum**.
- **Logs d'administration** : Une durée de **1 à 2 ans** peut être envisagée à des fins d'audit de sécurité des accès privilégiés.

### 2. Automatisation de la purge (Pruning)
Pour automatiser le nettoyage des logs obsolètes, il est recommandé d'utiliser le mécanisme de nettoyage natif d'Eloquent (Mass Pruning).

#### Exemple d'implémentation du Pruning dans le modèle `ActivityLog` :

```php
use Illuminate\Database\Eloquent\MassPruning;

class ActivityLog extends Model
{
    use MassPruning;

    /**
     * Déterminer la requête de purge des logs obsolètes (ex. plus vieux que 6 mois).
     */
    public function prunable(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('created_at', '<', now()->subMonths(6));
    }
}
```

Puis, planifier l'exécution quotidienne de la commande de purge dans `routes/console.php` (ou via le Scheduler) :

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('model:prune')->daily();
```
