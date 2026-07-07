# 07 — Audit Responsive (Adaptabilité multi-écrans)

Ce document analyse le comportement de l'interface de Hafrose sur différents formats d'écrans (Desktop, Laptop, Tablette, Mobile) et identifie les problèmes d'affichage, d'espacement et les risques d'overflow.

---

## 1. Dispositifs Desktop & Laptop (Écrans > 1024px)

### 1.1. Navbar
- **Comportement** : Alignement correct en Flexbox. Le logo HAFROSE est centré tandis que la navigation s'organise à gauche et les icônes à droite.
- **Problème observé** : Sur les ordinateurs portables de taille moyenne (Laptops de 13/14 pouces ou résolutions de 1024px à 1280px), l'espace disponible pour les liens est restreint. Si la Maison Hafrose décidait d'ajouter une cinquième catégorie à la Navbar, elle entrerait en collision avec le logo centré en absolute.

### 1.2. Grilles de produits
- Les grilles de 4 colonnes (`lg:grid-cols-4`) s'adaptent bien sur grand écran. Les marges extérieures (`max-w-7xl px-12`) garantissent une bonne aération de la page.

---

## 2. Dispositifs Tablettes (Écrans 768px à 1024px)

### 2.1. Grilles de produits et de catégories
- Les cartes de produits basculent sur 2 colonnes (`sm:grid-cols-2`). Sur ce format, les cartes apparaissent très larges verticalement en raison du ratio d'image `aspect-[3/4]`, ce qui peut contraindre l'utilisateur à faire défiler longuement la page pour voir les 4 produits d'une rangée.
- La grille des catégories populaires (`PopularCategories.jsx`) passe de 3 à 2 colonnes, ce qui laisse un élément seul sur la deuxième ligne.

### 2.2. Page Produit (`/product/:slug`)
- La galerie d'images et la zone d'informations passent d'une présentation côte à côte à une colonne unique.
- **Problème d'espacement** : La colonne de droite contenant les spécifications et le bouton d'achat colle directement au bas de l'image du produit, sans marge de respiration suffisante sur écran de 768px.

---

## 3. Dispositifs Mobile (Écrans < 768px)

### 3.1. Problèmes d'espacement et d'alignement (MaisonPresentation.jsx)
- **Débordement d'éléments décoratifs** : Les bordures dorées de décoration positionnées en absolute (`-top-3 -right-3` et `-bottom-3 -left-3`) sortent du cadre de la boîte de citation sur les écrans étroits (inférieurs à 360px), provoquant un défilement horizontal parasite sur la page d'accueil ou rognant les bordures.
- **Storytelling** : Sur mobile, la colonne de citation en blanc cassé sur fond noir s'affiche sous le bloc textuel principal, occupant toute la largeur de l'écran avec une hauteur excessive due au padding important (`p-12`).

### 3.2. Filtres de la Boutique (`/shop`)
- La barre des filtres devient très dense sur mobile : le champ de recherche, le défilement des boutons de catégories et le bouton d'ouverture des filtres avancés s'empilent verticalement.
- Le panneau de filtres avancés coulissant (`AnimatePresence`) utilise une grille de 3 colonnes sur desktop qui passe en colonne unique sur mobile. L'utilisateur doit faire défiler un long panneau pour accéder à la sélection des matières.

### 3.3. Tunnel d'Achat & Commande (`/checkout`)
- La structure à 2 colonnes (`lg:grid-cols-12` : 7 colonnes pour le formulaire, 5 pour le panier) bascule sur une seule colonne.
- **Problème UX de l'ordre d'affichage** : Le récapitulatif des articles achetés et le montant total s'affichent sous le formulaire de livraison. L'utilisateur mobile doit d'abord remplir toutes ses coordonnées personnelles avant de pouvoir vérifier le récapitulatif de sa commande et son total financier, ce qui est contraire aux bonnes pratiques e-commerce (le récapitulatif financier devrait être rappelé en haut ou épinglé en bas).

### 3.4. Menu d'administration mobile
- Le menu d'administration possède un bouton hamburger d'ouverture fonctionnel.
- Cependant, les tables de données (ex: liste des commandes ou des produits) n'ont pas de défilement horizontal sécurisé sur mobile, ce qui compresse les données ou provoque des sorties de table illisibles sur smartphone.
