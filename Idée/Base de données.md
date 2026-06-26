# Base de Données – Projet Hafrose

# 1. Présentation

La base de données du projet **Hafrose** est conçue sous MySQL afin d'assurer une gestion fiable, sécurisée et performante des données.

Elle permet de gérer :

* Les administrateurs
* Les catégories
* Les produits
* Les galeries d'images
* Les commandes
* Les détails des commandes
* Les messages de contact
* Les avis des clients

Toutes les tables sont reliées entre elles grâce aux clés étrangères afin de garantir l'intégrité des données.

---

# 2. Diagramme Conceptuel

```text
                     USERS (Admin)
                          │
                          │
                 Gère toutes les données
                          │

CATEGORIES ────────────────┐
       │                   │
       │ 1                N│
       ▼                   │
     PRODUCTS──────────────┘
         │
         │1
         │
         ▼
     GALLERIES

PRODUCTS
     │
     │1
     │
     ▼
ORDER_ITEMS
     ▲
     │N
     │
ORDERS

CONTACTS

REVIEWS
```

---

# 3. Tables de la Base de Données

La base contient les tables suivantes :

* users
* categories
* products
* galleries
* orders
* order_items
* contacts
* reviews

---

# 4. Table Users

Cette table contient uniquement les administrateurs du site.

## Champs

| Champ      | Type      | Description          |
| ---------- | --------- | -------------------- |
| id         | BIGINT    | Identifiant          |
| name       | VARCHAR   | Nom                  |
| email      | VARCHAR   | Adresse email        |
| password   | VARCHAR   | Mot de passe chiffré |
| role       | VARCHAR   | Rôle                 |
| created_at | TIMESTAMP | Date création        |
| updated_at | TIMESTAMP | Date modification    |

Un seul administrateur possède un accès au tableau de bord.

---

# 5. Table Categories

Cette table regroupe les catégories des accessoires.

Exemples :

* Sacs
* Bijoux
* Montres
* Lunettes
* Ceintures
* Portefeuilles

## Champs

| Champ       | Type      |
| ----------- | --------- |
| id          | BIGINT    |
| name        | VARCHAR   |
| slug        | VARCHAR   |
| description | TEXT      |
| image       | VARCHAR   |
| created_at  | TIMESTAMP |
| updated_at  | TIMESTAMP |

Relation :

Une catégorie possède plusieurs produits.

---

# 6. Table Products

Cette table représente les accessoires proposés par Hafrose.

## Champs

| Champ             | Type      |
| ----------------- | --------- |
| id                | BIGINT    |
| category_id       | BIGINT    |
| name              | VARCHAR   |
| slug              | VARCHAR   |
| description       | LONGTEXT  |
| short_description | TEXT      |
| price             | DECIMAL   |
| stock             | INTEGER   |
| color             | VARCHAR   |
| material          | VARCHAR   |
| brand             | VARCHAR   |
| image             | VARCHAR   |
| is_featured       | BOOLEAN   |
| created_at        | TIMESTAMP |
| updated_at        | TIMESTAMP |

Relation :

Un produit appartient à une catégorie.

---

# 7. Table Galleries

Chaque produit peut posséder plusieurs images.

## Champs

| Champ      | Type      |
| ---------- | --------- |
| id         | BIGINT    |
| product_id | BIGINT    |
| image      | VARCHAR   |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

Relation :

Un produit possède plusieurs images.

---

# 8. Table Orders

Cette table enregistre toutes les commandes des visiteurs.

## Champs

| Champ         | Type      |
| ------------- | --------- |
| id            | BIGINT    |
| customer_name | VARCHAR   |
| phone         | VARCHAR   |
| address       | TEXT      |
| city          | VARCHAR   |
| total_price   | DECIMAL   |
| status        | ENUM      |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

Valeurs possibles pour le statut :

* En attente
* Confirmée
* Expédiée
* Livrée
* Annulée

---

# 9. Table Order_Items

Cette table contient le détail de chaque commande.

## Champs

| Champ      | Type      |
| ---------- | --------- |
| id         | BIGINT    |
| order_id   | BIGINT    |
| product_id | BIGINT    |
| quantity   | INTEGER   |
| unit_price | DECIMAL   |
| subtotal   | DECIMAL   |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

Relation :

Une commande peut contenir plusieurs produits.

---

# 10. Table Contacts

Cette table stocke les messages envoyés depuis le formulaire de contact.

## Champs

| Champ      | Type      |
| ---------- | --------- |
| id         | BIGINT    |
| name       | VARCHAR   |
| email      | VARCHAR   |
| phone      | VARCHAR   |
| subject    | VARCHAR   |
| message    | TEXT      |
| created_at | TIMESTAMP |

---

# 11. Table Reviews

Cette table contient les avis des clients.

## Champs

| Champ         | Type      |
| ------------- | --------- |
| id            | BIGINT    |
| product_id    | BIGINT    |
| customer_name | VARCHAR   |
| rating        | INTEGER   |
| comment       | TEXT      |
| is_approved   | BOOLEAN   |
| created_at    | TIMESTAMP |
| updated_at    | TIMESTAMP |

Un avis doit être validé par l'administrateur avant d'être affiché.

---

# 12. Relations Eloquent

## Category

```php
hasMany(Product::class)
```

---

## Product

```php
belongsTo(Category::class)

hasMany(Gallery::class)

hasMany(Review::class)

hasMany(OrderItem::class)
```

---

## Gallery

```php
belongsTo(Product::class)
```

---

## Order

```php
hasMany(OrderItem::class)
```

---

## OrderItem

```php
belongsTo(Order::class)

belongsTo(Product::class)
```

---

## Review

```php
belongsTo(Product::class)
```

---

# 13. Contraintes de la Base de Données

Le système doit garantir :

* L'unicité des emails administrateurs.
* L'unicité des slugs des catégories et des produits.
* Les clés étrangères avec suppression contrôlée.
* Les champs obligatoires (`NOT NULL`) lorsque nécessaire.
* Des index sur les colonnes fréquemment utilisées (slug, category_id, product_id, order_id).

---

# 14. Sécurité des Données

La base de données doit respecter les règles suivantes :

* Les mots de passe sont stockés sous forme chiffrée.
* Les clés étrangères assurent la cohérence des données.
* Les validations Laravel empêchent l'enregistrement de données invalides.
* Les requêtes utilisent Eloquent ORM afin d'éviter les injections SQL.
* Les sauvegardes de la base doivent être réalisées régulièrement.

---

# 15. Flux des Données

## Création d'un produit

Administrateur

↓

Formulaire React

↓

API Laravel

↓

Validation

↓

Insertion dans MySQL

↓

Produit visible sur le site

---

## Passage d'une commande

Visiteur

↓

Formulaire de commande

↓

Validation Laravel

↓

Insertion dans la table Orders

↓

Insertion des produits dans Order_Items

↓

Commande disponible dans le Dashboard Administrateur

---

## Publication d'un avis

Visiteur

↓

Formulaire d'avis

↓

Validation

↓

Table Reviews

↓

Validation par l'administrateur

↓

Affichage sur le site

---

# 16. Évolutivité

La structure est conçue pour permettre l'ajout futur de nouvelles fonctionnalités, telles que :

* Gestion des promotions.
* Coupons de réduction.
* Paiement en ligne.
* Liste de souhaits (Wishlist).
* Historique des commandes par client.
* Gestion de plusieurs administrateurs.
* Tableau de bord analytique avancé.

La conception relationnelle garantit une base de données évolutive, cohérente et adaptée aux besoins futurs du projet Hafrose.
