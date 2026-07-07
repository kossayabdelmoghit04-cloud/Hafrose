# 02 — Cartographie et Audit des Pages

Ce document dresse un état des lieux de toutes les pages de l'application Hafrose, en analysant leurs composants, leur layout, leur niveau de finition visuel et fonctionnel, leurs points faibles UX et leur priorité de transformation.

---

## 1. Pages de l'Espace Client (Storefront)

### 1.1. Accueil (`/`)
- **Rôle** : Vitrine immersive de la Maison Hafrose, introduction à la philosophie de marque, mise en avant des catégories clés, des produits vedettes et de la newsletter.
- **Composants utilisés** :
  - `Hero.jsx` (Introduction)
  - `MaisonPresentation.jsx` (Récit de marque)
  - `PopularCategories.jsx` (Collections phares)
  - `FeaturedProducts.jsx` (Sélection de créations)
  - `WhyChooseUs.jsx` (Engagements de la Maison)
  - `Testimonials.jsx` (Avis des esthètes)
  - `Newsletter.jsx` (Formulaire de contact VIP)
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Bon sur le plan fonctionnel. Visuellement, l'organisation est classique mais manque de raffinement typographique et d'espaces de respiration.
- **Problèmes observés** :
  - Utilisation systématique de la couleur jaune or (`#D4AF37`), qui alourdit l'interface et contredit la charte luxe rose gold / beige.
  - Marges et espacements (`py-24`) trop standardisés, ne créant pas de sensation de luxe (le luxe repose sur le vide et les contrastes de taille).
  - Images de catégories chargées depuis Unsplash avec des résolutions et des filtres disparates.
- **Priorité UX** : 🔴 Critique (première page vue par le client).

### 1.2. La Boutique (`/shop`)
- **Rôle** : Catalogue complet de pièces d'exception avec filtres avancés (recherche textuelle, catégories, prix min/max, couleurs, matières nobles) et tri.
- **Composants utilisés** :
  - `Breadcrumb.jsx`
  - `Input.jsx` (pour la barre de recherche et les prix)
  - `ProductCard.jsx` (grille de produits)
  - `Pagination.jsx`
  - `Loader.jsx`
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Très complet techniquement (filtres cumulatifs synchronisés dans l'URL via `useSearchParams`).
- **Problèmes observés** :
  - Les boutons de catégories se chevauchent sur les petits écrans ou obligent à un défilement horizontal peu gracieux.
  - Le panneau des filtres avancés s'ouvre de manière abrupte et manque de finesse (les champs numériques de budget et le sélecteur de matière sont trop bruts).
  - Les pastilles de couleurs utilisent des couleurs pleines sans bordures ni effets de sélection subtils adaptés à la joaillerie et maroquinerie (ex: "Argent satiné" représenté par un gris plat).
- **Priorité UX** : 🔴 Critique (cœur de l'expérience e-commerce).

### 1.3. Page Produit (`/product/:slug`)
- **Rôle** : Fiche détaillée d'une création avec galerie d'images, zoom interactif au survol, sélection de quantité, ajout au panier, système de notation et de commentaires par avis clients, et recommandations de pièces similaires.
- **Composants utilisés** :
  - `Breadcrumb.jsx`
  - `Badge.jsx` (statut du stock)
  - `Input.jsx` (nom dans l'avis)
  - `Button.jsx` (action principale d'achat)
  - `ProductCard.jsx` (produits similaires)
  - `Loader.jsx`
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Élevé (le zoom au survol et la galerie miniature fonctionnent bien).
- **Problèmes observés** :
  - La notation par étoiles utilise le jaune or vif par défaut.
  - Le formulaire d'avis clients ("Partager votre avis") à droite est présenté dans un bloc blanc classique avec des champs épais qui rompent avec la structure épurée du produit.
  - La notification de succès lors de l'ajout au panier utilise SweetAlert2 avec une configuration de couleurs jaune or (`#D4AF37`).
- **Priorité UX** : 🔴 Critique.

### 1.4. Panier & Commande (`/checkout`)
- **Rôle** : Réviseur de panier (quantités, suppression d'articles) et formulaire de saisie d'informations de livraison avec validation d'adresse pour passer commande.
- **Composants utilisés** :
  - `Breadcrumb.jsx`
  - `Input.jsx` (champs du formulaire de livraison)
  - `Button.jsx` (validation finale)
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Très fonctionnel.
- **Problèmes observés** :
  - Le composant de modification de quantité d'articles est trop condensé et brut.
  - Le formulaire d'expédition manque de structure premium (champs alignés sans délimiteurs élégants).
  - Les messages de succès ou d'avertissement SweetAlert2 ne sont pas harmonisés avec la palette rose gold / crème.
- **Priorité UX** : 🔴 Critique.

### 1.5. La Maison - À Propos (`/about`)
- **Rôle** : Récit du savoir-faire, histoire et jalons de la Maison Hafrose.
- **Composants utilisés** :
  - `Breadcrumb.jsx`
  - `Button.jsx`
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Esthétique soignée, mais la frise chronologique (Timeline) utilise une ligne jaune or rigide.
- **Problèmes observés** :
  - Structure de la timeline très classique avec des points or sur fond anthracite.
  - Les icônes des engagements de la Maison (`FiAward`, `FiHeart`, etc.) s'affichent en jaune or vif sans finesse.
- **Priorité UX** : 🟡 Moyenne.

### 1.6. Contact (`/contact`)
- **Rôle** : Formulaire de demande de renseignements, réservation de salon privé, coordonnées de la conciergerie.
- **Composants utilisés** :
  - `Breadcrumb.jsx`
  - `Input.jsx`
  - `Button.jsx`
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Correct, sécurisé par un champ honeypot anti-spam.
- **Problèmes observés** :
  - Le sélecteur de sujet (`select`) possède le style par défaut du navigateur sur certains OS, ce qui dégrade l'aspect premium.
  - La disposition en deux colonnes (formulaire à gauche, coordonnées à droite) est très carrée, sans asymétrie luxueuse.
- **Priorité UX** : 🟡 Moyenne.

### 1.7. Confirmation de Commande (`/order-confirmation`)
- **Rôle** : Page de succès après achat affichant le numéro de commande, le récapitulatif des articles et les détails de livraison.
- **Composants utilisés** :
  - `Button.jsx`
- **Layout utilisé** : `MainLayout.jsx`
- **Niveau de finition** : Basique.
- **Problèmes observés** :
  - Le cercle de validation vert/or est trop simpliste.
  - Présentation sous forme de grilles de données brutes, proche d'une facture comptable plutôt que d'un message de remerciement d'une Maison de Haute Maroquinerie.
- **Priorité UX** : 🟡 Moyenne.

---

## 2. Pages de l'Espace Administration (Back Office)

### 2.1. Connexion Admin (`/admin/login`)
- **Rôle** : Écran d'authentification sécurisé pour les gestionnaires et administrateurs.
- **Composants utilisés** :
  - `Input.jsx`
  - `Button.jsx`
  - `Loader.jsx`
- **Layout utilisé** : Aucun (Page autonome)
- **Niveau de finition** : Bon, gère les redirections automatiques.
- **Problèmes observés** :
  - Utilise un style sombre lourd avec des bordures or jaune et une boîte de dialogue flottante standard.
- **Priorité UX** : 🟠 Importante.

### 2.2. Tableau de Bord (`/admin/dashboard`)
- **Rôle** : Résumé des métriques clés (chiffre d'affaires, commandes en attente, nouveaux messages, avis à modérer) et graphique SVG de tendance des ventes.
- **Composants utilisés** :
  - `Loader.jsx`
- **Layout utilisé** : `AdminLayout.jsx`
- **Niveau de finition** : Très interactif grâce aux requêtes React Query et à la construction dynamique de courbes SVG.
- **Problèmes observés** :
  - La courbe SVG et les points interactifs sont dessinés en jaune or vif (`#D4AF37`).
  - Les badges de notification de couleur (vert, rouge, ambre, bleu) proviennent des classes par défaut de Tailwind sans cohérence avec un outil de gestion premium.
- **Priorité UX** : 🟠 Importante.

### 2.3. Gestion (Catégories, Produits, Commandes, Avis, Contacts, Media, Settings)
- **Rôle** : Tables de données interactives pour la création, modification, suppression et gestion générale du catalogue et de la relation client.
- **Layout utilisé** : `AdminLayout.jsx`
- **Niveau de finition** : Élevé (modals de confirmation, gestion des téléchargements de fichiers, intégration SweetAlert2).
- **Problèmes observés** :
  - Les modals de modification de produits et catégories manquent d'espace.
  - La gestion de la médiathèque (`Media.jsx`) est rudimentaire sous forme de grille d'images sans tri ni recherche avancée.
- **Priorité UX** : 🟡 Moyenne (outil interne).
