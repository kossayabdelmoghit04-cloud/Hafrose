# AUDIT_CHECKLIST — Liste de Contrôle de Refonte Frontend

Ce document fournit la liste de contrôle (checklist) complète permettant de valider la conformité visuelle, ergonomique et technique du frontend de la Maison Hafrose lors des prochaines phases de transformation.

---

## 1. Architecture Générale et Compilation
- [ ] La compilation avec Vite s'effectue sans aucun avertissement ni erreur (`npm run build`).
- [ ] Zéro erreur de linter Oxlint lors de l'exécution de `npm run lint`.
- [ ] Les imports asynchrones via `lazy()` et `<Suspense>` fonctionnent sur toutes les routes clients et d'administration.
- [ ] Le hook `useDocumentTitle` actualise le titre de la page et la méta-description SEO à chaque navigation.
- [ ] Le reset de défilement horizontal (`ScrollToTop` dans `MainLayout`) s'active automatiquement lors des changements de page.

---

## 2. Design System & Styles Globaux
- [ ] L'importation de Google Fonts charge correctement `Cormorant Garamond` et `Plus Jakarta Sans`.
- [ ] La palette de couleurs dans `@theme` (dans `src/index.css`) ne contient plus de référence au jaune or (`#D4AF37`).
- [ ] Les nouvelles couleurs (rose poudré, rose gold, blush, beige, blanc cassé, or discret) sont appliquées de manière homogène.
- [ ] Les composants d'état (badges de stock, erreurs) exploitent des nuances harmonisées avec le thème de la Maison.
- [ ] La barre de défilement globale (scrollbar) utilise les nouvelles teintes douces de rose gold.

---

## 3. En-tête (Navbar)
- [ ] Le logo "HAFROSE" et la mention "Haute Maroquinerie" s'affichent correctement sans chevaucher les liens sur tablette.
- [ ] L'indicateur de page active sous forme de ligne utilise la couleur rose gold avec une transition fluide.
- [ ] L'icône de recherche (loupe) déclenche l'ouverture d'un volet ou d'une modale de recherche fonctionnelle.
- [ ] L'icône de favoris (cœur) redirige vers un espace favoris ou affiche un état d'absence de favoris soigné.
- [ ] Le tiroir de panier coulissant droit (`CartDrawer`) dispose d'une animation d'ouverture et de fermeture fluide.
- [ ] Les boutons d'ajustement des quantités dans le panier réutilisent un composant unique ou partagé.
- [ ] La pastille de notification du panier (`CartCount`) s'affiche en rose gold.

---

## 4. Pied de page (Footer)
- [ ] Les titres de colonnes et les liens de navigation rapide n'utilisent plus l'or jaune.
- [ ] L'inscription à la newsletter ne déclenche plus d'alerte `alert()` native mais affiche un message visuel soigné.
- [ ] Le champ d'adresse e-mail et le bouton s'alignent sans décalage responsive sur smartphone.

---

## 5. Page d'Accueil (Storefront Home)
- [ ] **Hero** : L'animation lente de souffle de l'image de fond (`animate-pulse-subtle`) fonctionne grâce aux keyframes CSS définis.
- [ ] **Hero** : Le texte d'accroche en italique dispose d'un excellent contraste de lisibilité sur l'image.
- [ ] **MaisonPresentation** : Les lignes dorées décoratives en absolu ne débordent pas de l'écran sur mobile.
- [ ] **PopularCategories** : Les textes de description blancs sur les images restent parfaitement lisibles (présence d'un dégradé de protection noir).
- [ ] **FeaturedProducts** : Les prix des créations s'affichent dans un ton sombre et discret.
- [ ] **WhyChooseUs** : Les icônes s'affichent en or discret et la bordure circulaire est allégée.
- [ ] **Testimonials** : Le guillemet géant décoratif ne perturbe pas la lecture sur smartphone.

---

## 6. Catalogue (La Boutique)
- [ ] L'input de recherche intègre un délai de temporisation (debounce de 300ms) pour éviter les rafales de requêtes API.
- [ ] Les pastilles de filtres de couleurs disposent d'une bordure de contour visible pour identifier le blanc cassé ou le beige.
- [ ] Les cibles de sélection de filtres de couleurs sur mobile respectent la taille minimale recommandée pour le toucher (44x44px).
- [ ] Le bouton "Réinitialiser les filtres" efface proprement tous les critères et réactualise la grille.

---

## 7. Fiche Produit
- [ ] Le zoom au survol de l'image principale s'active et se désactive avec une transition fluide, sans saut brutal de zoom.
- [ ] Les étoiles de notation moyenne du produit et du formulaire d'avis utilisent le rose gold.
- [ ] Le formulaire de rédaction d'avis client s'harmonise avec l'élégance minimaliste de la page.
- [ ] Les toasts d'ajout au panier SweetAlert2 utilisent les teintes rose gold et crème.

---

## 8. Espace d'Administration (Back Office)
- [ ] Le graphique SVG d'évolution des ventes sur le tableau de bord utilise la couleur rose gold pour sa courbe et ses points.
- [ ] Les tables de données (catégories, produits, messages) possèdent des marges intérieures confortables.
- [ ] Les modals de modification/création d'éléments possèdent une disposition multi-colonnes aérée.
- [ ] Les boutons d'administration s'harmonisent avec le Design System.
