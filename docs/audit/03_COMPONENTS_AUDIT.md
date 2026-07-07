# 03 — Cartographie et Audit des Composants

Ce document détaille chaque composant React de la base de code frontend de la Maison Hafrose, en évaluant ses dépendances, ses responsabilités, son degré de réutilisation et la présence éventuelle de duplication de code.

---

## 1. Composants Génériques (UI Primitives)

### 1.1. Button (`src/components/ui/Button.jsx`)
- **Responsabilité** : Composant bouton générique avec animations fluides au survol et au clic via Framer Motion. Gère également un état de chargement (`isLoading`) sous forme de spinner SVG.
- **Emplacement** : Partagé globalement dans tout le projet (Storefront et Back Office).
- **Dépendances** : `framer-motion`
- **Réutilisation & Rapprochement** : Très réutilisable avec 5 variantes (`primary`, `secondary`, `gold`, `outline`, `text`) et 3 tailles (`sm`, `md`, `lg`).
- **Incohérences / Limites** :
  - Les variantes `gold` et `outline` ont des styles en dur pointant vers la palette jaune or (`#D4AF37`).
  - Le spinner d'état `isLoading` est écrit en dur directement dans le composant au lieu d'utiliser le composant générique `Loader.jsx`.
- **Note de duplication** : Aucune duplication structurelle.

### 1.2. Badge (`src/components/ui/Badge.jsx`)
- **Responsabilité** : Badge compact destiné à afficher des états (en stock, quantité en attente) ou des micro-informations de matières ou collections.
- **Emplacement** : Pages produits, page commande, et plusieurs tables du back office.
- **Dépendances** : Aucune
- **Réutilisation** : Reçoit un attribut `variant` (`primary`, `secondary`, `gold`, `outline`, `success`, `danger`) et des classes supplémentaires via `className`.
- **Incohérences** :
  - La variante `gold` utilise le jaune or vif en dur.
  - Les variantes `success` et `danger` utilisent des couleurs vives (`emerald` et `rose`) issues de Tailwind v4 sans alignement avec la palette feutrée de la Maison.
- **Note de duplication** : Aucune.

### 1.3. Input (`src/components/ui/Input.jsx`)
- **Responsabilité** : Composant de champ de saisie de texte enveloppant le label et la gestion des messages d'erreur. Utilise `forwardRef` pour être compatible avec des bibliothèques tierces ou des focus gérés manuellement.
- **Emplacement** : Boutique, formulaires de contact, avis clients, tunnel de commande, et tous les formulaires d'administration.
- **Dépendances** : React (`forwardRef`).
- **Réutilisation** : Entièrement générique.
- **Incohérences** :
  - Le contour au focus (`focus:border-luxury-gold`) pointe directement vers le jaune or.
  - Le rayon de bordure est à zéro (`rounded-none`), ce qui est cohérent avec le style rectangulaire de luxe, mais les inputs de la page Admin Login utilisent un rayon de bordure (`rounded`), ce qui crée une légère incohérence de design.
- **Note de duplication** : Aucune.

### 1.4. Loader (`src/components/ui/Loader.jsx`)
- **Responsabilité** : Composant de chargement avec bague de rotation élégante animée et lueur centrale dorée, offrant également une option plein écran avec effet de flou de fond (glassmorphism).
- **Emplacement** : Transitions de pages (Layouts) et requêtes asynchrones en cours.
- **Dépendances** : `framer-motion`.
- **Réutilisation** : 3 tailles prédéfinies (`sm`, `md`, `lg`) et affichage plein écran optionnel (`fullPage`).
- **Incohérences** :
  - Le point central doré (`bg-luxury-gold`) et la bague (`border-t-luxury-gold`) sont colorés avec le jaune or d'origine.
- **Note de duplication** : Aucune.

### 1.5. Pagination (`src/components/ui/Pagination.jsx`)
- **Responsabilité** : Système de navigation par page minimaliste gérant l'apparition des points de suspension (`...`) lorsque la liste des pages est importante.
- **Emplacement** : Catalogue boutique (`Shop/index.jsx`) et listes d'administration (Produits, Commandes, etc.).
- **Dépendances** : `react-icons/fi`.
- **Réutilisation** : Très réutilisable.
- **Incohérences** :
  - Utilise l'accentuation de survol en jaune or (`hover:border-luxury-gold/40 hover:text-luxury-gold`).
- **Note de duplication** : Aucune.

### 1.6. Breadcrumb (`src/components/ui/Breadcrumb.jsx`)
- **Responsabilité** : Fil d'Ariane pour la navigation contextuelle de l'utilisateur.
- **Emplacement** : Pages Shop, Product, About, Contact, Cart.
- **Dépendances** : `react-router-dom`.
- **Réutilisation** : Entièrement réutilisable à l'aide d'un tableau d'objets passés en argument.
- **Incohérences** :
  - Couleur d'accentuation finale fixée sur le jaune or.
- **Note de duplication** : Aucune.

---

## 2. Composants Métier (Business Cards)

### 2.1. ProductCard (`src/components/cards/ProductCard.jsx`)
- **Responsabilité** : Affiche la fiche produit dans les grilles : image avec effet de zoom au survol, étiquette matière, titre, prix formaté, et bouton "Aperçu rapide" apparaissant en fondu. Le composant est enveloppé dans `React.memo` pour éviter les rendus inutiles.
- **Emplacement** : Grille du catalogue boutique, produits vedettes de la page d'accueil, suggestions de produits similaires.
- **Dépendances** : `react-router-dom`, `framer-motion`, `imageHelper.js`, `format.js`.
- **Incohérences** :
  - Utilise la couleur jaune or pour l'affichage du prix et le survol du titre du produit.
  - La hauteur des images est fixée par un rapport d'aspect strict (`aspect-[3/4]`), ce qui est optimal pour la maroquinerie, mais demande une parfaite uniformité des images téléversées en base de données.
- **Note de duplication** : Aucune.

### 2.2. CategoryCard (`src/components/cards/CategoryCard.jsx`)
- **Responsabilité** : Affiche une catégorie de produits sous forme de bannière avec un dégradé sombre, un texte descriptif dévoilé au survol et un indicateur sous forme de ligne dorée s'étirant au survol. Enveloppé dans `React.memo`.
- **Emplacement** : Grille de catégories populaires.
- **Dépendances** : `react-router-dom`, `framer-motion`.
- **Incohérences** :
  - L'indicateur de ligne et le label "Collection" sont de couleur jaune or.
- **Note de duplication** : Ce composant n'est utilisé que dans la page d'accueil. Il pourrait être fusionné avec la grille interne de `PopularCategories.jsx` ou généralisé pour servir également dans d'autres espaces.

---

## 3. Composants de Structure et Layout (Shell Components)

### 3.1. Navbar (`src/components/common/Navbar.jsx`)
- **Responsabilité** : En-tête de page, gestion de l'affichage adaptatif au défilement (scrolled state), menu mobile coulissant gauche, et panier d'achat coulissant droit (`CartDrawer`) contenant les contrôles de quantités et de suppression d'articles.
- **Emplacement** : `MainLayout.jsx`
- **Dépendances** : `react-router-dom`, `framer-motion`, `react-icons/fi`, `CartContext`, `imageHelper.js`, `format.js`, `Button.jsx`.
- **Incohérences / Complexité** :
  - Fichier volumineux (350 lignes) qui cumule la responsabilité de la navigation globale, du menu mobile ET de l'affichage complet du mini-panier.
  - Les boutons de modification de quantité du panier sont dupliqués dans ce composant et dans le fichier `Cart/index.jsx`.
  - La pastille de notification du panier (`CartCount`) utilise le fond jaune or.
- **Note de duplication** : La logique graphique et comportementale du mini-panier dans la Navbar devrait idéalement être extraite dans un sous-composant distinct (`CartDrawer.jsx`) pour respecter le principe SOLID de responsabilité unique.

### 3.2. Footer (`src/components/common/Footer.jsx`)
- **Responsabilité** : Pied de page global contenant la description de la Maison, les liens de navigation rapides et un formulaire d'inscription rapide à la newsletter.
- **Emplacement** : `MainLayout.jsx`
- **Dépendances** : `react-router-dom`, `react-icons/fi`.
- **Incohérences** :
  - L'inscription à la newsletter déclenche une fonction `alert()` native du navigateur en dur (ligne 10), brisant l'esthétique luxe du site.
  - Utilise les bordures et textes jaune or pour les titres de colonnes et champs de saisie.
- **Note de duplication** : Aucune.

### 3.3. MediaPickerModal (`src/components/common/MediaPickerModal.jsx`)
- **Responsabilité** : Fenêtre modale permettant aux administrateurs de choisir une image de la médiathèque ou d'en téléverser une nouvelle directement pour l'associer à un produit ou une catégorie.
- **Emplacement** : Pages de formulaires d'administration (`Admin/Categories.jsx`, `Admin/Products.jsx`).
- **Dépendances** : `@tanstack/react-query`, `api.js`, `Loader.jsx`, `sweetalert2`, `react-icons/fi`.
- **Incohérences** :
  - Les boutons de pagination et la zone de téléversement en pointillés font référence à la couleur jaune or.
- **Note de duplication** : Aucune.
