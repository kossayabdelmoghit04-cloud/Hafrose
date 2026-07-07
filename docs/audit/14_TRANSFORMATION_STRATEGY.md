# 14 — Stratégie de Transformation Globale

Ce document présente la feuille de route stratégique pour réaliser la refonte luxe (Phase 7) du frontend de la Maison Hafrose de manière incrémentale, sans interruption de service ni régression fonctionnelle.

---

## 1. Principes Directeurs de la Refonte
Conformément au document `FRONTEND_TRANSFORMATION_CONTEXT.md` :
1. **Zéro Régression** : Toutes les fonctionnalités (panier, validation des commandes, authentification admin, gestion de catalogue, modération des avis) doivent continuer de fonctionner à 100% à chaque fin d'étape.
2. **Cohérence Esthétique** : Suppression totale de la couleur jaune or (`#D4AF37`) et harmonisation typographique sur toutes les pages.
3. **Approche Progressive** : La transformation s'effectue étape par étape, validée par des contrôles de non-régression.

---

## 2. Feuille de Route et Séquencement des Étapes

```
Étape 1 : Refonte du Design System (index.css)
      │
      ▼
Étape 2 : Alignement des Composants UI Primitives (Button, Input, Loader, Badge, etc.)
      │
      ▼
Étape 3 : Transformation de la Structure Commune (Navbar, Footer, Layouts)
      │
      ▼
Étape 4 : Métamorphose de la Page d'Accueil (Vitrine de Marque)
      │
      ▼
Étape 5 : Amélioration de la Boutique et Fiche Produit (Expérience Client)
      │
      ▼
Étape 6 : Refonte Visuelle du Back Office Administrateur (Svg, Modals, Tables)
```

---

## 3. Détail des Étapes de Travail

### Étape 1 : Le Socle du Design System (`index.css`)
- **Action** : Déclarer les nouveaux tokens de couleur dans `@theme` (rose, rose gold, blush, beige, blanc cassé, or discret).
- **Sécurité** : Pour éviter les erreurs de compilation ou les trous de style, faire correspondre temporairement l'ancienne variable `--color-luxury-gold` à la nouvelle valeur de rose gold (`#B5828C`).
- **Typographie** : Importer la police de caractères de haute joaillerie `Cormorant Garamond` via Google Fonts.
- **Bugs** : Implémenter la clé `@keyframes pulse-subtle` manquante dans `index.css`.

### Étape 2 : Les Composants Primitifs
- **Action** : Mettre à jour les variantes de style de `Button.jsx`, `Input.jsx`, `Badge.jsx` et `Loader.jsx` pour exploiter les nouveaux jetons de couleurs et de contours. Remplacer les boutons jaune or par des boutons rose gold.
- **Micro-interactions** : Affiner les transitions d'opacité et de contours de focus.

### Étape 3 : Les Structures Transverses
- **Action** : Repenser le style de la `Navbar` et du `Footer`.
- **Simplification** : Remplacer l'alerte JS brute de la newsletter du Footer par un message visuel discret. Ajuster les tiroirs de navigation mobile et panier coulissant pour intégrer des transitions harmonieuses.

### Étape 4 : La Page d'Accueil Vitrine
- **Action** : Parcourir chaque section de la page d'accueil (`Hero`, `MaisonPresentation`, `PopularCategories`, `FeaturedProducts`, `WhyChooseUs`, `Testimonials`, `Newsletter`) et ajuster le design pour lui insuffler de la respiration (grands paddings asymétriques) et une typographie raffinée.
- **Lisibilité** : Augmenter le contraste textuel sur le Hero.

### Étape 5 : Le Catalogue et la Fiche Produit
- **Action 1** : Mettre en place un délai de temporisation (debounce de 300ms) sur le champ de recherche de `Shop/index.jsx` pour protéger l'API.
- **Action 2** : Améliorer les boutons de filtres sur mobile (pastilles de couleurs plus grandes et espacées).
- **Action 3** : Revoir la mise en forme du formulaire de dépôt d'avis sur la fiche produit pour l'intégrer avec élégance.

### Étape 6 : L'Espace Administration (Back Office)
- **Action** : Ajuster les couleurs du graphique SVG du tableau de bord d'administration pour utiliser le rose gold. Espacer les lignes des tableaux de gestion et harmoniser les champs dans les modals de modification de produits.
