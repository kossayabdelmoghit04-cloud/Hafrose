# Cahier des Charges – Projet Hafrose

# 1. Présentation du Projet

## Nom du projet

**Hafrose**

## Contexte

Hafrose est une marque spécialisée dans la vente d'accessoires de mode haut de gamme. Le projet consiste à développer un site web vitrine moderne mettant en valeur les produits de la marque tout en offrant une expérience utilisateur fluide, élégante et responsive.

Le site permettra aux visiteurs de découvrir les collections, consulter les produits, obtenir des informations détaillées et passer une commande via un formulaire sécurisé. Une interface d'administration permettra au gestionnaire de piloter l'ensemble du contenu du site.

---

# 2. Objectifs du Projet

## Objectif Général

Concevoir et développer une application web moderne permettant de présenter les produits de la marque Hafrose et de faciliter la gestion des contenus grâce à un espace administrateur sécurisé.

## Objectifs Spécifiques

* Présenter la marque Hafrose.
* Mettre en avant les collections d'accessoires.
* Offrir une navigation fluide et intuitive.
* Permettre aux visiteurs de consulter les produits.
* Permettre aux visiteurs de passer une commande.
* Permettre aux visiteurs de contacter la marque.
* Fournir un tableau de bord d'administration complet.
* Garantir la sécurité des données.
* Assurer une expérience responsive sur tous les appareils.

---

# 3. Public Cible

Le site s'adresse principalement :

* Aux particuliers recherchant des accessoires de mode élégants.
* Aux clients souhaitant commander directement depuis le site.
* À l'administrateur chargé de gérer les produits, les commandes et les contenus.

---

# 4. Fonctionnalités du Site

## Partie Visiteur

Le visiteur peut :

* Consulter la page d'accueil.
* Découvrir la marque.
* Parcourir les catégories.
* Consulter les produits.
* Voir les détails d'un produit.
* Effectuer une recherche.
* Filtrer les produits.
* Envoyer un message de contact.
* Passer une commande.
* Consulter les avis clients.

---

## Partie Administrateur

L'administrateur peut :

* Se connecter à son espace sécurisé.
* Ajouter un produit.
* Modifier un produit.
* Supprimer un produit.
* Gérer les catégories.
* Gérer les commandes.
* Consulter les messages.
* Gérer les avis.
* Consulter les statistiques du site.

---

# 5. Architecture Fonctionnelle

Le système est composé de deux interfaces principales :

## Interface Visiteur

Accessible à tous les utilisateurs.

Elle permet :

* La consultation des produits.
* La navigation dans les catégories.
* La recherche.
* Le formulaire de contact.
* Le formulaire de commande.

## Interface Administrateur

Accessible uniquement après authentification.

Elle permet la gestion complète du contenu du site.

---

# 6. Description des Pages

## Accueil

Contient :

* Hero Banner
* Présentation de Hafrose
* Produits vedettes
* Collections
* Avis clients
* Contact rapide

---

## Boutique

Affiche l'ensemble des produits disponibles avec :

* Recherche
* Filtre par catégorie
* Filtre par prix
* Pagination

---

## Détail Produit

Chaque produit présente :

* Images
* Nom
* Prix
* Description
* Caractéristiques
* Disponibilité
* Bouton Commander

---

## Contact

Formulaire contenant :

* Nom
* Email
* Téléphone
* Message

---

## Commande

Formulaire contenant :

* Nom complet
* Téléphone
* Adresse
* Ville
* Produit
* Quantité

---

## Dashboard Administrateur

Le tableau de bord affiche :

* Nombre de produits
* Nombre de commandes
* Nombre de messages
* Nombre d'avis
* Statistiques générales

---

# 7. Exigences Fonctionnelles

Le système doit :

* Charger les données de manière dynamique.
* Communiquer avec une API REST.
* Enregistrer les commandes dans MySQL.
* Enregistrer les messages de contact.
* Permettre la gestion complète des produits.
* Gérer les catégories.
* Gérer les avis.
* Valider tous les formulaires.
* Sécuriser les accès administrateur.

---

# 8. Exigences Non Fonctionnelles

Le projet doit être :

* Rapide.
* Sécurisé.
* Responsive.
* Évolutif.
* Maintenable.
* Accessible.
* Optimisé pour le référencement (SEO de base).
* Compatible avec les principaux navigateurs modernes.

---

# 9. Technologies

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* Framer Motion
* React Icons

## Backend

* Laravel
* Sanctum
* Spatie Permission
* API REST

## Base de Données

* MySQL

---

# 10. Gestion des Données

Le système doit gérer les informations suivantes :

* Produits
* Catégories
* Images
* Commandes
* Messages
* Avis
* Utilisateurs administrateurs

Toutes les données sont stockées dans une base MySQL.

---

# 11. Gestion des Commandes

Le visiteur remplit un formulaire contenant :

* Nom
* Téléphone
* Adresse
* Ville
* Produit
* Quantité

Le backend :

* Vérifie les données.
* Enregistre la commande.
* Affecte un statut (En attente par défaut).
* Rend la commande visible dans le tableau de bord administrateur.

---

# 12. Gestion des Avis

Les visiteurs peuvent publier un avis.

Chaque avis contient :

* Nom
* Note
* Commentaire

Les avis sont validés par l'administrateur avant leur publication.

---

# 13. Sécurité

Le projet doit assurer :

* Authentification sécurisée.
* Protection des mots de passe.
* Validation de tous les formulaires.
* Protection contre les injections SQL.
* Protection contre les attaques XSS.
* Contrôle des rôles.
* Accès réservé à l'administrateur pour le tableau de bord.

---

# 14. Expérience Utilisateur (UX)

L'interface doit être :

* Intuitive.
* Élégante.
* Moderne.
* Fluide.
* Facile à utiliser.

La navigation doit permettre d'accéder aux principales fonctionnalités en un minimum de clics.

---

# 15. Design (UI)

L'identité visuelle de Hafrose repose sur un univers premium.

Le design doit respecter les éléments suivants :

* Palette de couleurs dominée par des nuances de rose.
* Typographie élégante et lisible.
* Cartes produits uniformes avec images de qualité.
* Boutons modernes avec effets de survol.
* Header fixe avec logo et menu de navigation.
* Footer contenant les informations de copyright et les liens vers les réseaux sociaux.
* Animations légères pour améliorer l'expérience utilisateur.
* Interface responsive adaptée aux smartphones, tablettes et ordinateurs.

---

# 16. Livrables Attendus

À la fin du projet, les éléments suivants devront être disponibles :

* Application Frontend React.
* API Backend Laravel.
* Base de données MySQL.
* Tableau de bord administrateur.
* Documentation technique.
* Code source organisé.
* Projet versionné avec Git.

---

# 17. Critères de Réussite

Le projet sera considéré comme réussi si :

* Toutes les fonctionnalités prévues sont opérationnelles.
* L'application est responsive.
* Les formulaires sont validés et sécurisés.
* Les commandes sont enregistrées correctement.
* Les produits sont gérés dynamiquement.
* Le tableau de bord administrateur est fonctionnel.
* Le code respecte les bonnes pratiques de développement.
* L'application offre une expérience utilisateur professionnelle et cohérente avec l'image de la marque Hafrose.

