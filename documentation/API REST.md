# API REST – Projet Hafrose

# 1. Présentation

Le backend Laravel expose une API REST permettant au frontend React de communiquer avec la base de données.

Toutes les réponses sont retournées au format JSON.

Les routes sont regroupées dans le fichier :

routes/api.php

---

# 2. Authentification

## Login

POST

/api/login

Entrée :

```json
{
    "email": "admin@hafrose.com",
    "password": "password"
}
```

Réponse :

```json
{
    "token":"..."
}
```

---

## Logout

POST

/api/logout

Authentification requise.

---

# 3. Produits

## Liste des produits

GET

/api/products

Retourne tous les produits.

---

## Détail d'un produit

GET

/api/products/{slug}

Retourne les informations détaillées d'un produit.

---

## Ajouter un produit

POST

/api/products

Admin uniquement.

---

## Modifier un produit

PUT

/api/products/{id}

Admin uniquement.

---

## Supprimer un produit

DELETE

/api/products/{id}

Admin uniquement.

---

# 4. Catégories

GET

/api/categories

Liste des catégories.

---

GET

/api/categories/{id}

Détail d'une catégorie.

---

POST

/api/categories

Créer une catégorie.

---

PUT

/api/categories/{id}

Modifier une catégorie.

---

DELETE

/api/categories/{id}

Supprimer une catégorie.

---

# 5. Commandes

## Créer une commande

POST

/api/orders

Le client remplit :

* Nom
* Téléphone
* Adresse
* Ville
* Produits
* Quantité

Le backend :

* Vérifie les données.
* Calcule le prix total.
* Enregistre la commande.
* Retourne une confirmation.

---

## Liste des commandes

GET

/api/orders

Admin uniquement.

---

## Détail d'une commande

GET

/api/orders/{id}

---

## Modifier le statut

PATCH

/api/orders/{id}/status

Statuts :

* En attente
* Confirmée
* Expédiée
* Livrée
* Annulée

---

# 6. Contact

POST

/api/contact

Enregistre un message.

GET

/api/contact

Admin uniquement.

---

# 7. Avis

GET

/api/reviews

Retourne les avis validés.

POST

/api/reviews

Créer un avis.

PATCH

/api/reviews/{id}/approve

Valider un avis.

DELETE

/api/reviews/{id}

Supprimer un avis.

---

# 8. Galerie

GET

/api/products/{id}/gallery

Liste des images.

POST

/api/gallery

Ajouter une image.

DELETE

/api/gallery/{id}

Supprimer une image.

---

# 9. Dashboard

GET

/api/dashboard

Retourne :

* Nombre de produits
* Nombre de commandes
* Nombre de catégories
* Nombre d'avis
* Nombre de messages

---

# 10. Réponses JSON

Toutes les réponses doivent respecter le même format.

Succès :

```json
{
    "success": true,
    "message": "Opération réalisée avec succès.",
    "data": {}
}
```

Erreur :

```json
{
    "success": false,
    "message": "Une erreur est survenue.",
    "errors": {}
}
```

---

# 11. Codes HTTP

| Code | Signification             |
| ---- | ------------------------- |
| 200  | Succès                    |
| 201  | Création réussie          |
| 204  | Suppression réussie       |
| 400  | Requête invalide          |
| 401  | Non authentifié           |
| 403  | Accès interdit            |
| 404  | Ressource introuvable     |
| 422  | Erreur de validation      |
| 500  | Erreur interne du serveur |

---

# 12. Sécurité

Toutes les routes d'administration sont protégées par :

* Laravel Sanctum
* Middleware auth:sanctum
* Vérification du rôle administrateur

Les routes publiques restent accessibles aux visiteurs.

---

# 13. Flux de Communication

```text
React
   │
   │ Axios
   ▼
Laravel API
   │
   │ Eloquent ORM
   ▼
MySQL
```

Chaque action effectuée sur le frontend (consultation des produits, envoi d'un formulaire, passage d'une commande, etc.) est transmise via Axios aux endpoints de l'API Laravel. Le backend valide les données, applique les règles métier, interagit avec la base de données et renvoie une réponse JSON au frontend.
