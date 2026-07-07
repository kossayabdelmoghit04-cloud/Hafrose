# 11 — Dette Technique (Dette de code & Améliorations structurelles)

Ce document répertorie la dette technique accumulée dans la structure actuelle du code frontend, y compris le code inutilisé, les duplications, les couplages excessifs et les améliorations architecturales à mener lors des phases de transformation.

---

## 1. Code Dupliqué (Friction de Maintenance)

### 1.1. Sélecteurs de Quantité de Panier
- **Fichiers concernés** : `src/components/common/Navbar.jsx` (Cart Drawer) et `src/src/pages/Cart/index.jsx` (Checkout).
- **Description** : Les deux composants réimplémentent la structure HTML et les styles CSS pour les boutons d'incrémentation, de décrémentation et de suppression d'articles du panier :
  - Navbar (lignes 284 à 313).
  - Cart page (lignes 287 à 323).
- **Risque** : Tout changement esthétique sur les boutons de quantité (ex: passage à des cercles fins) doit être appliqué à deux endroits différents, augmentant les risques d'oubli ou d'incohérence.

### 1.2. Configuration et styles SweetAlert2 en dur
- **Fichiers concernés** : `Product/index.jsx` (lignes 86 à 96), `Contact/index.jsx` (lignes 57 à 62), `Cart/index.jsx` (lignes 105 à 112).
- **Description** : L'affichage des alertes de succès, d'avertissement et d'erreur utilise la bibliothèque `SweetAlert2` (`Swal.fire`). Les couleurs des boutons (`confirmButtonColor: '#111111'`) et les styles d'arrière-plan (`background: '#FDFBF7'`, `color: '#111111'`, `iconColor: '#D4AF37'`) sont injectés en dur dans chaque appel de fonction.
- **Risque** : Remplacer l'or jaune par le rose gold nécessite de modifier chaque occurrence de `Swal.fire` à travers 4 fichiers différents. Une centralisation sous forme d'utilitaire d'alertes configuré (`src/utils/alertHelper.js`) est recommandée.

---

## 2. Variables mortes et Variables Statiques à risque

### 2.1. Variable CSS inutilisée dans index.css
- La variable `--color-luxury-gold-dark: #AA7C11;` est déclarée dans le thème global mais n'est lue par aucun composant React ou règle CSS, excepté pour l'état de survol de la scrollbar.

### 2.2. Tableaux de filtres codés en dur dans Shop
- **Fichier concerné** : `src/pages/Shop/index.jsx`.
- **Description** : Les listes de filtres de couleurs (`COLORS` - ligne 14) et de matières (`MATERIALS` - ligne 26) sont écrites en dur au sommet du fichier de la boutique.
- **Risque** : Si un administrateur ajoute un produit avec une nouvelle couleur (ex: "Gris Perle") ou une nouvelle matière (ex: "Cuir d'Autruche Premium") via le back office, celle-ci n'apparaîtra pas dans la liste des filtres de la boutique, car la liste n'est pas alimentée dynamiquement par l'API.

---

## 3. Couplage excessif (Responsabilité Unique violée)

- Le fichier `Navbar.jsx` fait **350 lignes** car il intègre l'ensemble de la logique du menu mobile, des redirections de routes, ainsi que l'interface complète du panier d'achat coulissant (`CartDrawer`).
- **Conséquence** : Le fichier est difficile à lire et à maintenir. Il devrait être découpé en extrayant le volet du panier dans un sous-composant `CartDrawer.jsx` dédié.

---

## 4. Sécurité des sessions d'administration (XSS)

- Le token de session de l'administrateur (`admin_token`) est stocké dans le `localStorage` de l'application via `AuthContext.jsx`.
- **Impact** : Bien qu'il s'agisse d'un fonctionnement standard avec Laravel Sanctum sur des applications web découplées, ce stockage est exposé aux attaques de type XSS (Cross-Site Scripting). Si un script malveillant parvenait à s'exécuter sur le frontend, il pourrait s'emparer du jeton d'accès d'administration.
