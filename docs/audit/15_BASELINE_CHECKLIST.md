# 15 — Checklist de la Baseline d'Audit

Ce document fait office de procès-verbal de validation de la phase 0 (Audit). Il récapitule l'ensemble des vérifications de code effectuées sans aucune modification de fichier afin d'établir un point de départ fiable pour la Maison Hafrose.

---

## 1. État de la Base de Code Frontend
- [x] Récupération et analyse de `package.json` (dépendances React 19, Tailwind v4 et Vite validées).
- [x] Inspection du point d'entrée `App.jsx` (configuration React Query et des contextes de session/panier validée).
- [x] Examen de la configuration du routeur `src/routes/index.jsx` (chargement paresseux des pages et structures imbriquées validés).

---

## 2. État du Design System Existant
- [x] Analyse de `src/index.css` (importations Google Fonts et directive `@theme` validées).
- [x] Cartographie de la palette chromatique (8 variables de thèmes repérées, or jaune dominant identifié).
- [x] Inventaire des règles typographiques (liaison serif/sans validée).

---

## 3. État des Composants Réutilisables
- [x] Analyse de `Button.jsx` (états de survol et de chargement validés, or jaune repéré en dur).
- [x] Analyse de `Input.jsx` (liaison de référence et de focus validée).
- [x] Analyse de `Badge.jsx` (liaison de classes d'états validée).
- [x] Analyse de `Loader.jsx` (lueur dorée et rotation CSS validées).
- [x] Analyse de `Pagination.jsx` (boutons et calculs d'ellipses validés).
- [x] Analyse de `Breadcrumb.jsx` (liens de fil d'Ariane validés).
- [x] Analyse de `ProductCard.jsx` (effet d'apparition au scroll et zoom image validés).
- [x] Analyse de `CategoryCard.jsx` (effet de survol et superposition de textes validés).

---

## 4. État des Structures Transverses
- [x] Analyse de `Navbar.jsx` (comportement d'opacité au défilement, menu mobile gauche et panier droit validés).
- [x] Analyse de `Footer.jsx` (formulaire de newsletter et liens de mentions légales validés).
- [x] Analyse de `AdminLayout.jsx` (barre de navigation de l'administrateur et contrôle de session validés).

---

## 5. État des Connecteurs API (Services)
- [x] Analyse de `src/services/api.js` (intercepteurs de requêtes/réponses et redirection 401/429 validés).
- [x] Examen des fichiers de services métier (`productService.js`, `categoryService.js`, `orderService.js`, etc.) (connexions de requêtes CRUD validées).

---

## 6. Analyse des Pages Métier
- [x] Analyse de `Home/index.jsx` (agencement des 7 sections vitrines validé).
- [x] Analyse de `Shop/index.jsx` (gestion des filtres par paramètres d'URL et absence de debounce de recherche identifiée).
- [x] Analyse de `Product/index.jsx` (panneau de galerie d'images, zoom et dépôt d'avis validés).
- [x] Analyse de `Cart/index.jsx` (validation de formulaire et envoi de commande validés).
- [x] Analyse de `Contact/index.jsx` (sécurité honeypot et validation de champs validées).
- [x] Analyse de `About/index.jsx` (timeline historique et valeurs de marque validées).
- [x] Analyse de `Admin/Dashboard.jsx` (tracé de courbes SVG et blocs de métriques validés).
