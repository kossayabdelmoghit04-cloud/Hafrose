# HAFROSE — Phase 4.5 — CAPTCHA (Cloudflare Turnstile)

Ce document décrit l'intégration de la protection CAPTCHA **Cloudflare Turnstile** sur le projet HAFROSE.

---

## 1. Fonctionnement Général

L'intégration repose sur une validation double :

1. **Frontend (React 19)** : Un composant réutilisable charge dynamiquement le script Turnstile de Cloudflare et présente le widget à l'utilisateur. Lors de la validation réussie, un jeton unique (`token`) est généré.
2. **Backend (Laravel 12)** : Le jeton est envoyé sous le paramètre `cf-turnstile-response`. Un middleware centralisé (`VerifyTurnstileToken`) intercepte la requête, vérifie le jeton auprès de l'API de Cloudflare via un service dédié (`TurnstileService`), et bloque les requêtes non valides ou suspectes avec un code HTTP `422 Unprocessable Entity` uniforme.

---

## 2. Variables d'Environnement

Le système est entièrement configurable via les fichiers `.env` et ne nécessite aucune clé codée en dur.

### Backend (`backend/.env`)

```ini
# Activer/Désactiver Turnstile CAPTCHA (Utile pour désactiver en local ou CI)
TURNSTILE_ENABLED=true

# Clé de Site publique fournie par Cloudflare Turnstile
TURNSTILE_SITE_KEY=1x00000000000000000000AA

# Clé Secrète privée fournie par Cloudflare Turnstile (à garder secrète)
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000000000000

# URL de l'API de validation Cloudflare
TURNSTILE_VERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify

# Timeout maximal de la requête HTTP vers Cloudflare (en secondes)
TURNSTILE_TIMEOUT=5
```

### Frontend (`frontend/.env`)

```ini
# Clé de Site publique pour le widget Turnstile
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

*Note : Les clés `1x00000000000000000000AA` et `1x0000000000000000000000000000000000000000` sont des clés de test officielles fournies par Cloudflare qui acceptent toujours les requêtes, idéales pour le développement local et les tests.*

---

## 3. Configuration et Fichiers Backend

Le backend est structuré de façon modulaire et propre :

* **Configuration (`backend/config/turnstile.php`)** : Charge et expose les variables d'environnement Turnstile avec des valeurs par défaut sécurisées.
* **Service de Validation (`backend/app/Services/TurnstileService.php`)** : Effectue la requête HTTP POST asynchrone vers l'API Cloudflare Turnstile, gère le timeout, capture et logue les exceptions réseau (par exemple si Cloudflare est temporairement indisponible) et retourne un statut booléen.
* **Middleware (`backend/app/Http/Middleware/VerifyTurnstileToken.php`)** : Gère l'interception de la requête HTTP, extrait le paramètre `cf-turnstile-response`, effectue la validation à l'aide de `TurnstileService` et renvoie une réponse JSON d'erreur 422 harmonisée avec le reste de l'application en cas d'échec.
* **Bootstrap (`backend/bootstrap/app.php`)** : Enregistre l'alias du middleware sous le nom `'turnstile'`.
* **Routes (`backend/routes/api.php`)** : Applique le middleware `'turnstile'` sur les routes sensibles publiques.

---

## 4. Formulaires Protégés

Seuls les formulaires publics sensibles nécessitant une protection contre le spam ou le flood automatique sont protégés :

1. **Formulaire de Contact** : Route `POST /api/contact` (page `Contact`)
2. **Formulaire d'Avis Client** : Route `POST /api/reviews` (page `Product` détails)
3. **Formulaire de Commande** : Route `POST /api/orders` (page `Cart`/Checkout)

Les fonctionnalités back-office administratives ou les routes déjà protégées par Sanctum (comme la Wishlist ou la gestion de compte admin) n'ont pas de CAPTCHA pour ne pas altérer l'expérience d'utilisation légitime.

---

## 5. Intégration Frontend (React)

Le composant réutilisable `<Turnstile />` (`frontend/src/components/ui/Turnstile.jsx`) offre :
* Un chargement dynamique du script officiel Turnstile depuis les serveurs sécurisés de Cloudflare (une seule fois pour toute l'application).
* Une gestion propre des callbacks d'état (`onVerify`, `onExpire`, `onError`).
* Une exposition de méthode `reset()` via React ref (`useImperativeHandle`) pour permettre aux formulaires parents de réinitialiser le widget CAPTCHA après une soumission réussie ou une erreur de validation.

---

## 6. Recommandations pour la Production

1. **Clés Cloudflare Turnstile dédiées** :
   Générez une paire de clés (Site Key & Secret Key) dédiée à votre nom de domaine de production sur la console Cloudflare. Remplacez les clés de test du fichier `.env` de production par ces valeurs réelles.
2. **Gestion des Erreurs Réseau (Fail Closed)** :
   Notre implémentation utilise un modèle sécurisé de type *fail-closed* : si l'API de validation Cloudflare ne répond pas (timeout) ou renvoie une erreur 500, la requête backend est rejetée. Cela garantit qu'un robot ne peut pas contourner la protection en inondant le serveur de requêtes lorsque Cloudflare est saturé ou inaccessible.
3. **Mise en cache de configuration** :
   En production, pensez à exécuter `php artisan config:cache` pour accélérer le chargement de la configuration Turnstile.
