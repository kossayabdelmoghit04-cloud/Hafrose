# Protection Honeypot — HAFROSE Backend

> **Phase 5.5.1** — Sécurité Anti-Bot  
> Middleware transparent de protection contre les soumissions automatisées.

---

## Table des matières

1. [Fonctionnement](#fonctionnement)
2. [Configuration](#configuration)
3. [Variables d'environnement](#variables-denvironnement)
4. [Routes protégées](#routes-protégées)
5. [Exemples d'intégration frontend](#exemples-dintégration-frontend)
6. [Logs générés](#logs-générés)
7. [Maintenance](#maintenance)

---

## Fonctionnement

### Principe

La protection Honeypot repose sur un champ de formulaire **caché visuellement** mais présent dans le DOM HTML.

- **Les utilisateurs humains** ne le voient pas et ne le remplissent jamais.
- **Les robots (bots)** parcourent automatiquement le DOM et remplissent tous les champs détectés, y compris les champs cachés.

Lorsque le middleware détecte que ce champ est rempli, il en déduit que la requête provient d'un bot.

### Stratégie Shadow Block

Au lieu de retourner une erreur HTTP explicite (400/403), le middleware utilise la stratégie **Shadow Block** :

```
Bot soumet formulaire
      │
      ▼
Champ "website" rempli ?
      │
     OUI ──────────────────────────────────────────────────►  Log warning (IP, UA, route)
      │                                                                │
      ▼                                                                │
Retourner HTTP 201 factice ◄──────────────────────────────────────────┘
(Aucune écriture en base)

     NON
      │
      ▼
Passer la requête au contrôleur (comportement normal)
```

**Pourquoi le Shadow Block ?**

Un bot qui reçoit une erreur 400 ou 403 peut adapter son comportement (changer d'IP, supprimer le champ, etc.). En recevant un faux succès, le bot croit avoir réussi et ne relance pas l'attaque.

### Middleware

```
app/Http/Middleware/BlockSpamHoneypot.php
```

Enregistré sous l'alias `honeypot` dans `bootstrap/app.php`.

---

## Configuration

Fichier : `config/honeypot.php`

| Clé           | Type    | Défaut  | Description                                                                    |
|---------------|---------|---------|--------------------------------------------------------------------------------|
| `enabled`     | bool    | `true`  | Active ou désactive globalement la protection                                   |
| `field_name`  | string  | `website` | Nom du champ honeypot dans le formulaire HTML                               |
| `log_channel` | string  | `stack` | Canal de log Laravel pour les warnings de détection                            |
| `shadow_block`| bool    | `true`  | Si `true`, retourne une réponse factice 201 ; si `false`, retourne une erreur 400 |
| `error_message`| string | `Requête invalide.` | Message retourné lorsque `shadow_block = false`                  |

---

## Variables d'environnement

Ajouter dans le fichier `.env` :

```dotenv
# Honeypot Anti-Bot Protection
HONEYPOT_ENABLED=true
HONEYPOT_FIELD=website
HONEYPOT_LOG_CHANNEL=stack
HONEYPOT_SHADOW_BLOCK=true
```

| Variable               | Valeur recommandée (production) | Description                               |
|------------------------|---------------------------------|-------------------------------------------|
| `HONEYPOT_ENABLED`     | `true`                          | Activer la protection                     |
| `HONEYPOT_FIELD`       | `website`                       | Nom du champ caché HTML                   |
| `HONEYPOT_LOG_CHANNEL` | `daily` ou `stack`              | Canal de log Laravel                      |
| `HONEYPOT_SHADOW_BLOCK`| `true`                          | Retourner une réponse factice aux bots    |

> **En environnement de test (CI/CD)** : laisser `HONEYPOT_ENABLED=true` et ne pas envoyer le champ honeypot dans les tests, ou utiliser `config(['honeypot.enabled' => false])` en début de test.

---

## Routes protégées

Le middleware `honeypot` est appliqué aux formulaires publics suivants :

| Route              | Méthode | Middleware appliqués                              |
|--------------------|---------|---------------------------------------------------|
| `/api/contact`     | `POST`  | `throttle:contact`, **`honeypot`**, `turnstile`   |
| `/api/reviews`     | `POST`  | `throttle:reviews`, **`honeypot`**, `turnstile`   |
| `/api/orders`      | `POST`  | `throttle:orders`, **`honeypot`**, `turnstile`    |

> **Routes non protégées** : Les routes GET (catalogue, catégories, avis publics) et les routes admin (protégées par `auth:sanctum + admin`) **ne sont pas concernées** par le middleware honeypot.

Extrait de `routes/api.php` :

```php
// Formulaire de contact
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware(['throttle:contact', 'honeypot', 'turnstile']);

// Soumission d'avis
Route::post('/reviews', [ReviewController::class, 'store'])
    ->middleware(['throttle:reviews', 'honeypot', 'turnstile']);

// Passage de commande
Route::post('/orders', [OrderController::class, 'store'])
    ->middleware(['throttle:orders', 'honeypot', 'turnstile']);
```

---

## Exemples d'intégration frontend

### HTML — Champ honeypot caché en CSS

```html
<form action="/api/contact" method="POST">
  <!-- Champs normaux du formulaire -->
  <input type="text"  name="name"    placeholder="Votre nom" required>
  <input type="email" name="email"   placeholder="Votre email" required>
  <input type="text"  name="subject" placeholder="Sujet" required>
  <textarea name="message" placeholder="Votre message" required></textarea>

  <!-- ⚠️ Champ Honeypot — invisible pour les humains, rempli par les bots -->
  <!-- Ne jamais utiliser type="hidden" — utiliser du CSS à la place -->
  <div style="position: absolute; left: -9999px; overflow: hidden;">
    <label for="website">Ne pas remplir ce champ</label>
    <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
  </div>

  <button type="submit">Envoyer</button>
</form>
```

> **Important** : Ne jamais utiliser `type="hidden"` pour masquer le champ. Certains robots intelligents ignorent les champs `hidden`. Il faut utiliser du CSS (`position: absolute; left: -9999px`).
>
> L'attribut `tabindex="-1"` empêche les utilisateurs de naviguer vers ce champ avec la touche Tab.

### React / Vue — Exemple fetch

```javascript
const submitForm = async (formData) => {
  // Le champ "website" doit être envoyé vide (ou absent)
  // Ne jamais le remplir côté JavaScript
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      // website: '',  // ← Ne pas envoyer ou envoyer vide
    }),
  });
  return response.json();
};
```

---

## Logs générés

Lors de la détection d'un bot, le middleware enregistre un **warning** dans les logs Laravel.

### Format du log

```
[2026-07-21 17:05:00] local.WARNING: [Honeypot] Bot détecté — soumission bloquée. {
  "ip": "192.168.1.100",
  "user_agent": "curl/7.68.0",
  "route": "http://localhost:8000/api/contact",
  "method": "POST",
  "field": "website",
  "timestamp": "2026-07-21 17:05:00"
}
```

### Champs enregistrés

| Champ       | Description                                   |
|-------------|-----------------------------------------------|
| `ip`        | Adresse IP de l'émetteur de la requête        |
| `user_agent`| User-Agent HTTP (identifiant du client/robot) |
| `route`     | URL complète de la route appelée              |
| `method`    | Méthode HTTP (POST)                           |
| `field`     | Nom du champ honeypot déclenché               |
| `timestamp` | Date et heure de la détection                 |

### Emplacement des logs

Par défaut (`LOG_STACK=single`) :

```
storage/logs/laravel.log
```

Pour un suivi quotidien, changer le canal :

```dotenv
HONEYPOT_LOG_CHANNEL=daily
```

---

## Maintenance

### Changer le nom du champ honeypot

Si un bot sophistiqué apprend à ignorer le champ `website`, changer son nom :

```dotenv
HONEYPOT_FIELD=fax_number
```

Mettre à jour simultanément tous les formulaires frontend.

### Désactiver temporairement

```dotenv
HONEYPOT_ENABLED=false
```

Redémarrer le cache de config :

```bash
php artisan config:clear
```

### Ajouter le middleware à une nouvelle route

```php
Route::post('/nouvelle-route', [MonController::class, 'store'])
    ->middleware(['throttle:api', 'honeypot']);
```

### Surveiller les attaques

Compter les détections dans les logs :

```bash
grep -c "Honeypot] Bot détecté" storage/logs/laravel.log
```

Voir les 10 dernières détections :

```bash
grep "Honeypot] Bot détecté" storage/logs/laravel.log | tail -10
```

---

*Documentation générée — Phase 5.5.1 — HAFROSE Backend Laravel 12*
