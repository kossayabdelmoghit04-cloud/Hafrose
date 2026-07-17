# Protection Honeypot anti-spam

## Présentation

Le mécanisme Honeypot est une protection passive contre les soumissions automatiques de formulaires (robots, scrapers). Il fonctionne sans package tiers, sans CAPTCHA visible et sans impact sur l'expérience utilisateur.

## Principe de fonctionnement

Un champ de saisie masqué (`website`) est inséré dans chaque formulaire public protégé. Ce champ est :

- Invisible pour l'utilisateur humain (propriété CSS `hidden`).
- Ignoré par les lecteurs d'écran (`aria-hidden="true"`).
- Exclu de la navigation au clavier (`tabIndex="-1"`).
- Exclu de la complétion automatique du navigateur (`autoComplete="off"`).

Un robot qui analyse et remplit le formulaire renseignera automatiquement ce champ, trahissant sa nature de bot.

### Comportement de blocage (Shadow Block)

Lorsque le champ `website` contient une valeur non vide, le middleware **`BlockSpamHoneypot`** intercepte la requête **avant** qu'elle n'atteigne le contrôleur ou la validation. Il retourne une **fausse réponse de succès HTTP 201** cohérente avec la route demandée (Contact, Avis, Commande), mais **n'écrit rien en base de données**.

Cette approche "shadow block" a plusieurs avantages :

- Le robot croit que la soumission a réussi et ne tente pas de contourner la protection.
- Aucune donnée de spam n'est persistée.
- Aucun log suspect ne révèle l'existence du filtre.

---

## Configuration

Le comportement du Honeypot est configurable dans `config/honeypot.php` ou via les variables d'environnement.

| Variable | Valeur par défaut | Description |
|---|---|---|
| `HONEYPOT_ENABLED` | `true` | Active ou désactive globalement le Honeypot |
| `HONEYPOT_FIELD_NAME` | `website` | Nom du champ masqué dans les formulaires |

### Désactiver temporairement (ex. tests manuels)

```env
HONEYPOT_ENABLED=false
```

---

## Formulaires protégés

| Formulaire | Route | Middleware |
|---|---|---|
| Contact | `POST /api/contact` | `throttle:contact` + `honeypot` |
| Avis client | `POST /api/reviews` | `throttle:reviews` + `honeypot` |
| Commande | `POST /api/orders` | `throttle:orders` + `honeypot` |

Les formulaires **non concernés** par le spam (lecture seule, authentifiés, admin) ne sont pas protégés par le Honeypot.

---

## Architecture

### Backend

| Fichier | Rôle |
|---|---|
| `config/honeypot.php` | Configuration centralisée (activation, nom du champ) |
| `app/Http/Middleware/BlockSpamHoneypot.php` | Middleware réutilisable de détection et de blocage silencieux |
| `bootstrap/app.php` | Enregistrement de l'alias `honeypot` |
| `routes/api.php` | Application du middleware sur les routes publiques POST |

### Frontend

| Fichier | Modification |
|---|---|
| `src/pages/Contact/index.jsx` | Champ honeypot déjà présent depuis la phase précédente |
| `src/pages/Product/index.jsx` | Champ honeypot ajouté dans le formulaire d'avis |
| `src/pages/Cart/index.jsx` | Champ honeypot ajouté dans le formulaire de commande |

---

## Tests

Chaque formulaire protégé dispose d'un scénario dédié :

| Test | Classe | Scénario vérifié |
|---|---|---|
| `test_contact_honeypot_blocks_submission` | `ContactApiTest` | HTTP 201 retourné, `contacts` table vide |
| `test_review_honeypot_blocks_submission` | `ReviewApiTest` | HTTP 201 retourné, `reviews` table vide |
| `test_order_honeypot_blocks_submission` | `OrderApiTest` | HTTP 201 retourné, `orders` et `order_items` tables vides, stock inchangé |

---

## Limites du système

1. **Robots avancés** : Un robot sophistiqué qui analyse le CSS et ignore les champs masqués pourrait contourner le Honeypot. Dans ce cas, combiner avec le Rate Limiting (déjà en place) reste efficace.

2. **Champ connu** : Si un acteur malveillant connaît le nom du champ (`website`) et l'omet intentionnellement, le Honeypot ne sera pas déclenché. Changer régulièrement le nom via `HONEYPOT_FIELD_NAME` peut mitiger ce risque.

3. **Pas de protection contre les attaques ciblées** : Le Honeypot est inefficace contre un attaquant humain ou un robot programmé spécifiquement pour contourner cette application. Le Rate Limiting et une analyse de logs complémentaire restent indispensables.

4. **Compatibilité avec les gestionnaires de mots de passe** : Certains gestionnaires de mots de passe ou extensions de navigateur peuvent renseigner automatiquement des champs cachés. Il est conseillé de tester les formulaires avec des outils courants pour s'assurer qu'ils n'interfèrent pas.
