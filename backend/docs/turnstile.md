# Protection CAPTCHA Cloudflare Turnstile — HAFROSE Backend

> **Phase 5.5.2** — Sécurité Anti-Bot  
> Vérification serveur des tokens CAPTCHA Cloudflare Turnstile sur les formulaires publics.

---

## Table des matières

1. [Architecture](#architecture)
2. [Configuration](#configuration)
3. [Variables d'environnement](#variables-denvironnement)
4. [Middleware](#middleware)
5. [Service TurnstileService](#service-turnstileservice)
6. [API Cloudflare](#api-cloudflare)
7. [Routes protégées](#routes-protégées)
8. [Exemples frontend](#exemples-frontend)
9. [Logs générés](#logs-générés)
10. [Maintenance](#maintenance)

---

## Architecture

### Vue d'ensemble

```
Frontend                Backend Laravel 12              Cloudflare
─────────               ──────────────────              ──────────
Formulaire              routes/api.php
  │                           │
  │  POST /api/contact         │
  │  + cf-turnstile-response   │
  │ ─────────────────────────► │
  │                      VerifyTurnstileToken (middleware)
  │                            │
  │                            │──► TurnstileService::verify()
  │                            │          │
  │                            │          │── POST /siteverify ──────────────► Cloudflare API
  │                            │          │                                         │
  │                            │          │◄── { success: true/false } ◄────────────┘
  │                            │          │
  │                            │◄─────────┘
  │                            │
  │                      [success=false] → HTTP 422 JSON
  │                      [success=true]  → ContactController
```

### Composants

| Composant | Chemin | Rôle |
|---|---|---|
| **Middleware** | `app/Http/Middleware/VerifyTurnstileToken.php` | Intercepte la requête, délègue au service |
| **Service** | `app/Services/TurnstileService.php` | Logique réseau, validation, logging |
| **Config** | `config/turnstile.php` | Paramètres centralisés |
| **Alias** | `bootstrap/app.php` — `'turnstile'` | Registration du middleware |

### Ordre d'exécution des middlewares (formulaires publics)

```
throttle:contact ──► honeypot ──► turnstile ──► Controller
```

> Le **honeypot** est exécuté avant Turnstile. Si un bot est détecté par le honeypot,
> aucun appel réseau vers Cloudflare n'est effectué (optimisation + shadow block).

---

## Configuration

Fichier : `config/turnstile.php`

| Clé | Type | Défaut | Description |
|---|---|---|---|
| `enabled` | bool | `true` | Active/désactive la vérification CAPTCHA |
| `secret_key` | string | `''` | Clé secrète Cloudflare (backend uniquement) |
| `site_key` | string | `''` | Clé publique Cloudflare (frontend) |
| `verify_url` | string | URL CF | Endpoint de l'API Cloudflare |
| `timeout` | int | `5` | Timeout en secondes vers Cloudflare |
| `log_channel` | string | `stack` | Canal de log Laravel |

---

## Variables d'environnement

```dotenv
# Cloudflare Turnstile CAPTCHA
TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY=votre-clé-publique-cloudflare
TURNSTILE_SECRET_KEY=votre-clé-secrète-cloudflare
TURNSTILE_VERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify
TURNSTILE_TIMEOUT=5
TURNSTILE_LOG_CHANNEL=stack
```

### Clés de test Cloudflare (développement local)

Cloudflare fournit des clés de test qui acceptent **toujours** le token :

| Variable | Valeur de test |
|---|---|
| `TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000000000000` |

> **En environnement CI/CD** : utiliser `TURNSTILE_ENABLED=false` pour désactiver
> complètement la vérification. Aucun appel réseau ne sera effectué.

---

## Middleware

Fichier : `app/Http/Middleware/VerifyTurnstileToken.php`  
Alias : `turnstile` (enregistré dans `bootstrap/app.php`)

### Flux de décision

```
Requête entrante
      │
      ▼
Lire cf-turnstile-response
      │
      ▼
TurnstileService::verify($token, $ip, $route)
      │
   false ────────────────────────────────────────────────────►  Log::warning (IP, route, raison)
      │                                                                  │
      ▼                                                                  │
HTTP 422 JSON ◄───────────────────────────────────────────────────────────┘
{
  "success": false,
  "message": "Vérification CAPTCHA invalide ou expirée.",
  "errors": {
    "cf-turnstile-response": ["La vérification CAPTCHA a échoué..."]
  }
}

   true
      │
      ▼
$next($request) → Contrôleur
```

### Réponse JSON en cas d'échec

```json
{
    "success": false,
    "message": "Vérification CAPTCHA invalide ou expirée.",
    "errors": {
        "cf-turnstile-response": [
            "La vérification CAPTCHA a échoué. Veuillez actualiser la page et réessayer."
        ]
    },
    "data": null
}
```

HTTP Status : **422 Unprocessable Entity**

---

## Service TurnstileService

Fichier : `app/Services/TurnstileService.php`

### Méthode publique

```php
public function verify(
    ?string $token,
    ?string $ip   = null,
    string  $route = ''
): bool
```

### Cas gérés

| Cas | Comportement | Log |
|---|---|---|
| `TURNSTILE_ENABLED=false` | Retourne `true` sans appel réseau | — |
| Token null ou `""` | Retourne `false` immédiatement | — |
| Clé secrète vide | Retourne `false` | `Log::error` |
| Cloudflare `success=true` | Retourne `true` | — |
| Cloudflare `success=false` | Retourne `false` | `Log::warning` + error-codes |
| HTTP 4xx/5xx Cloudflare | Retourne `false` | `Log::warning` + statut HTTP |
| `ConnectionException` (timeout) | Retourne `false` | `Log::warning` + message d'erreur |
| Exception inattendue | Retourne `false` | `Log::error` + message |

### Méthodes privées

| Méthode | Rôle |
|---|---|
| `buildPayload()` | Prépare le corps POST pour Cloudflare |
| `parseCloudflareResponse()` | Analyse et logue la réponse JSON Cloudflare |
| `logWarning()` | Centralise les warnings via le canal configuré |
| `logError()` | Centralise les erreurs via le canal configuré |

---

## API Cloudflare

### Endpoint

```
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/x-www-form-urlencoded
```

### Paramètres

| Paramètre | Obligatoire | Description |
|---|---|---|
| `secret` | ✅ | Clé secrète Turnstile |
| `response` | ✅ | Token cf-turnstile-response |
| `remoteip` | ❌ | IP du client (renforce la validation) |

### Réponse succès

```json
{
    "success": true,
    "challenge_ts": "2026-07-21T17:00:00.000Z",
    "hostname": "hafrose.com"
}
```

### Réponse échec

```json
{
    "success": false,
    "error-codes": ["invalid-input-response"]
}
```

### Error-codes Cloudflare courants

| Code | Signification |
|---|---|
| `missing-input-secret` | Clé secrète absente dans la requête |
| `invalid-input-secret` | Clé secrète invalide |
| `missing-input-response` | Token absent dans la requête |
| `invalid-input-response` | Token invalide ou expiré |
| `bad-request` | Format de requête invalide |
| `timeout-or-duplicate` | Token expiré ou déjà utilisé |
| `internal-error` | Erreur interne Cloudflare |

---

## Routes protégées

| Route | Méthode | Middleware appliqués |
|---|---|---|
| `/api/contact` | `POST` | `throttle:contact` → `honeypot` → **`turnstile`** |
| `/api/reviews` | `POST` | `throttle:reviews` → `honeypot` → **`turnstile`** |
| `/api/orders` | `POST` | `throttle:orders` → `honeypot` → **`turnstile`** |

### Routes non protégées

Les routes GET (catalogue, catégories, avis publics) et les routes admin
(`auth:sanctum + admin`) **ne sont pas concernées** par Turnstile.

### Ajouter une nouvelle route protégée

```php
Route::post('/nouvelle-route', [MonController::class, 'store'])
    ->middleware(['throttle:api', 'honeypot', 'turnstile']);
```

---

## Exemples frontend

### HTML + Vanilla JS

```html
<!-- 1. Charger le script Cloudflare Turnstile -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<!-- 2. Ajouter le widget dans le formulaire -->
<form id="contact-form">
  <input type="text"  name="name"    required>
  <input type="email" name="email"   required>
  <input type="text"  name="subject" required>
  <textarea name="message" required></textarea>

  <!-- Widget Turnstile -->
  <div class="cf-turnstile"
       data-sitekey="VOTRE_SITE_KEY"
       data-callback="onTurnstileSuccess">
  </div>

  <button type="submit" id="submit-btn" disabled>Envoyer</button>
</form>

<script>
function onTurnstileSuccess(token) {
  // Activer le bouton quand le CAPTCHA est résolu
  document.getElementById('submit-btn').disabled = false;
}

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  // Le token est automatiquement inclus sous le nom "cf-turnstile-response"

  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
  });

  const data = await response.json();
  if (data.success) {
    alert('Message envoyé !');
  } else if (data.errors?.['cf-turnstile-response']) {
    alert('Vérification CAPTCHA échouée. Veuillez réessayer.');
    // Réinitialiser le widget Turnstile
    turnstile.reset();
  }
});
</script>
```

### React

```jsx
import { useState } from 'react';

// Installation : npm install @marsidev/react-turnstile
import { Turnstile } from '@marsidev/react-turnstile';

export function ContactForm() {
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...Object.fromEntries(formData),
        'cf-turnstile-response': token,
      }),
    });

    const data = await response.json();
    // Gérer la réponse...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <input name="subject" required />
      <textarea name="message" required />

      <Turnstile
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
        onSuccess={setToken}
      />

      <button type="submit" disabled={!token}>Envoyer</button>
    </form>
  );
}
```

---

## Logs générés

### Warning — Token invalide ou expiré

```
[2026-07-21 17:05:00] local.WARNING: [Turnstile] Token Turnstile invalide ou expiré selon Cloudflare. {
  "error_codes": ["timeout-or-duplicate"],
  "ip": "192.168.1.100",
  "route": "http://localhost:8000/api/contact",
  "timestamp": "2026-07-21 17:05:00"
}
```

### Warning — Erreur réseau Cloudflare (HTTP 500)

```
[2026-07-21 17:05:00] local.WARNING: [Turnstile] Réponse HTTP non-2xx reçue de Cloudflare. {
  "status": 500,
  "ip": "192.168.1.100",
  "route": "http://localhost:8000/api/reviews",
  "timestamp": "2026-07-21 17:05:00"
}
```

### Warning — Timeout réseau

```
[2026-07-21 17:05:00] local.WARNING: [Turnstile] Impossible de contacter Cloudflare (réseau / timeout). {
  "error": "cURL error 28: Operation timed out",
  "ip": "192.168.1.100",
  "route": "http://localhost:8000/api/orders",
  "timestamp": "2026-07-21 17:05:00"
}
```

### Error — Clé secrète manquante

```
[2026-07-21 17:05:00] local.ERROR: [Turnstile] TURNSTILE_SECRET_KEY non configurée — vérification impossible. {
  "ip": "192.168.1.100",
  "route": "http://localhost:8000/api/contact"
}
```

### Warning — Middleware (token absent)

```
[2026-07-21 17:05:00] local.WARNING: [Turnstile] Vérification CAPTCHA échouée. {
  "reason": "token absent",
  "ip": "192.168.1.100",
  "route": "http://localhost:8000/api/contact",
  "timestamp": "2026-07-21 17:05:00"
}
```

---

## Maintenance

### Changer de canal de log

```dotenv
TURNSTILE_LOG_CHANNEL=daily
```

Puis vider le cache de config :

```bash
php artisan config:clear
```

### Désactiver en développement / tests

```dotenv
TURNSTILE_ENABLED=false
```

### Surveiller les échecs CAPTCHA

```bash
# Compter les échecs
grep -c "\[Turnstile\]" storage/logs/laravel.log

# Voir les 10 derniers échecs
grep "\[Turnstile\]" storage/logs/laravel.log | tail -10

# Filtrer par type d'erreur
grep "timeout-or-duplicate" storage/logs/laravel.log
```

### Renouveler les clés Cloudflare

1. Aller dans le tableau de bord Cloudflare → Turnstile
2. Créer un nouveau site ou régénérer les clés
3. Mettre à jour `.env` :
   ```dotenv
   TURNSTILE_SITE_KEY=nouvelle-clé-publique
   TURNSTILE_SECRET_KEY=nouvelle-clé-secrète
   ```
4. Redémarrer le serveur ou vider le cache :
   ```bash
   php artisan config:clear && php artisan cache:clear
   ```
5. Mettre à jour la variable côté frontend (`VITE_TURNSTILE_SITE_KEY`)

---

*Documentation générée — Phase 5.5.2 — HAFROSE Backend Laravel 12*
