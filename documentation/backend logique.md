# Description Détaillée du Backend – Projet Hafrose

## Rôle Général du Backend

Le backend de Hafrose est développé avec Laravel sous forme d'une API REST sécurisée. Il constitue le cœur du système et assure la communication entre l'interface utilisateur (React) et la base de données MySQL.

Son objectif principal est de garantir une expérience fluide, dynamique et sécurisée pour les visiteurs ainsi que pour l'administrateur.

---

# Gestion Dynamique des Produits

Le backend récupère automatiquement les produits enregistrés dans la base de données et les transmet au frontend via des API.

Ainsi :

* Lorsqu'un visiteur consulte la page d'accueil, les produits vedettes sont affichés dynamiquement.
* Lorsqu'il ouvre une catégorie, seuls les produits appartenant à cette catégorie sont chargés.
* Lorsqu'il clique sur un produit, les informations détaillées sont récupérées instantanément depuis la base de données.

Cette approche permet d'éviter les contenus statiques et garantit une mise à jour automatique des informations sans modifier le code frontend.

---

# Gestion des Commandes

Le système permet aux visiteurs de passer une commande à travers un formulaire dédié.

Les informations demandées sont :

* Nom complet
* Téléphone
* Adresse
* Ville
* Produit commandé
* Quantité
* Message optionnel

Après validation :

1. Les données sont vérifiées par Laravel.
2. La commande est enregistrée dans la base de données.
3. Un statut est automatiquement attribué à la commande.
4. L'administrateur peut consulter la commande depuis son espace d'administration.

Exemples de statuts :

* En attente
* Confirmée
* Expédiée
* Livrée
* Annulée

Toutes les commandes sont stockées dans la base de données et visibles depuis phpMyAdmin ainsi que depuis le tableau de bord administrateur.

---

# Validation des Commandes

Afin d'éviter les erreurs et les données incorrectes, Laravel effectue une validation automatique :

* Nom obligatoire
* Téléphone obligatoire
* Adresse obligatoire
* Quantité supérieure à zéro
* Produit existant

Exemple :

Nom : requis

Téléphone : requis

Quantité : nombre positif

Cette validation garantit la qualité des données enregistrées.

---

# Confirmation des Commandes

Après l'enregistrement de la commande :

* Une notification apparaît à l'écran.
* La commande est enregistrée dans la base de données.
* L'administrateur reçoit la demande dans son tableau de bord.

Le système permet ensuite à l'administrateur de contacter le client à partir des informations enregistrées.

---

# Espace Administrateur

Le système possède un espace d'administration sécurisé accessible uniquement à l'administrateur principal.

Connexion :

* Email administrateur
* Mot de passe sécurisé

Fonctionnalités :

### Gestion des Produits

* Ajouter un produit
* Modifier un produit
* Supprimer un produit

### Gestion des Catégories

* Ajouter une catégorie
* Modifier une catégorie
* Supprimer une catégorie

### Gestion des Commandes

* Consulter les commandes
* Modifier le statut des commandes
* Rechercher une commande

### Gestion des Avis

* Consulter les avis clients
* Valider les avis
* Supprimer les avis inappropriés

### Gestion des Messages

* Consulter les messages de contact
* Répondre aux demandes

### Tableau de Bord

Affichage :

* Nombre total de produits
* Nombre de commandes
* Nombre de clients
* Nombre d'avis
* Produits les plus consultés

---

# Gestion des Avis Clients

Les visiteurs peuvent publier un avis après leur achat.

Le formulaire contient :

* Nom
* Note (1 à 5 étoiles)
* Commentaire

Avant publication :

* Validation des données
* Vérification des champs obligatoires
* Contrôle de sécurité

L'administrateur peut approuver ou supprimer les avis depuis son interface.

---

# Sécurité du Système

Le backend intègre plusieurs mécanismes de sécurité :

### Authentification

Connexion sécurisée avec Laravel Sanctum.

### Protection des mots de passe

Les mots de passe sont cryptés avec Hash.

### Validation des formulaires

Tous les formulaires sont validés avant enregistrement.

### Protection contre les injections SQL

Laravel Eloquent sécurise automatiquement les requêtes.

### Contrôle des accès

Les visiteurs ne peuvent pas accéder à l'espace administrateur.

Seul l'administrateur possède les droits :

* Ajouter
* Modifier
* Supprimer
* Valider

---

# Base de Données

Les données suivantes sont enregistrées :

### Produits

Informations complètes des accessoires.

### Catégories

Organisation des produits.

### Commandes

Historique complet des commandes.

### Avis

Commentaires des clients.

### Messages

Demandes envoyées via le formulaire de contact.

### Administrateur

Informations de connexion de l'administrateur.

Toutes ces données sont stockées dans MySQL et consultables via phpMyAdmin.

---

# Conclusion

Le backend Laravel de Hafrose assure la gestion complète des produits, commandes, avis, messages et utilisateurs. Il fournit une communication dynamique avec le frontend React, garantit la sécurité des données, valide les formulaires et offre un espace administrateur permettant la gestion totale du site à travers une interface simple, moderne et sécurisée.
