# 08 — Audit d'Accessibilité (WCAG & Ergonomie inclusive)

Ce document analyse la conformité du frontend de Hafrose avec les règles d'accessibilité (WCAG 2.2). Il met l'accent sur les contrastes de couleurs, la navigation au clavier, la structure sémantique et la compatibilité avec les lecteurs d'écran.

---

## 1. Contrastes des Couleurs (Friction d'Accessibilité Majeure)

Le luxe utilise fréquemment des tons clairs (crème, beige, blanc) associés à des détails dorés. Cependant, sur le plan numérique, les contrastes actuels violent plusieurs règles critiques du niveau AA du W3C.

### 1.1. Contraste Or Jaune sur Blanc/Crème
- **Couleur d'accentuation** : Le jaune or (`#D4AF37`) sur fond crème (`#FDFBF7`) possède un rapport de contraste de seulement **2.2:1**.
- **Impact** : Toutes les écritures de prix (ex: `ProductCard.jsx`, `Shop/index.jsx`), les badges d'états d'articles, les catégories actives de la boutique et les boutons d'évaluation par étoiles sont quasiment invisibles pour les personnes souffrant de déficience visuelle (presbytie, daltonisme, cataracte).
- **Règle WCAG** : Non-conforme à la règle 1.4.3 (contraste minimum de 4.5:1 pour le texte normal).

### 1.2. Contraste Gris sur Crème
- **Texte secondaire** : Les sous-titres et informations annexes (matières des produits dans les cartes, dates) utilisent la couleur `--color-luxury-gray` (`#7F7F7F`) sur fond crème (`#FDFBF7`). Le rapport de contraste obtenu est de **4.0:1**.
- **Impact** : Bien qu'acceptable pour les grands titres, cette couleur est utilisée sur des petits textes (`text-[9px]`), ce qui rend la lecture pénible.
- **Règle WCAG** : Non-conforme pour les petites polices (inférieures à 18px ou 14px en gras).

---

## 2. Navigation au Clavier et Focus

### 2.1. Absence de piège de focus (Focus Trap) dans les tiroirs (Drawers) et Modals
- **Composants concernés** : `Navbar.jsx` (Cart Drawer et Mobile Menu) et `MediaPickerModal.jsx` (médiathèque administration).
- **Problème** : Lors de l'ouverture du panier d'achat coulissant, si un utilisateur navigue à l'aide de la touche `TAB`, le focus de tabulation continue de parcourir les éléments en arrière-plan (les liens invisibles de la page d'accueil ou de la boutique). Le focus n'est pas confiné à l'intérieur du panier ouvert.
- **Règle WCAG** : Non-conforme à la règle 2.1.2 (pas de piège au clavier).

### 2.2. Indicateur de focus visible (`:focus-visible`)
- La plupart des boutons interactifs de type icônes dans la Navbar (`FiSearch`, `FiHeart`, `FiShoppingBag`) masquent les contours de focus par défaut du navigateur sans proposer de contour personnalisé élégant. Un utilisateur naviguant exclusivement au clavier ne sait pas sur quel élément il se situe.

---

## 3. Structure Sémantique et Lecteurs d'Écran (ARIA)

### 3.1. Absence de liaison Label-Input dans la page Contact
- **Composant concerné** : Le sélecteur de sujet (`select`) dans `Contact/index.jsx` (lignes 111 à 128) :
  ```html
  <label className="...">Sujet</label>
  <select name="subject" ...>
  ```
- **Problème** : Le `<label>` ne possède pas d'attribut `htmlFor`, et l'élément `<select>` ne possède pas d'attribut `id`. Il n'y a donc aucun lien logique entre les deux. Un lecteur d'écran énoncera simplement "boîte de sélection" sans lire l'étiquette "Sujet".
- **Règle WCAG** : Non-conforme à la règle 1.3.1 (informations et relations).

### 3.2. Balises d'images descriptives (`alt`) dans le Panier
- Les images des articles affichées dans la liste du panier coulissant (`Navbar.jsx`) possèdent une étiquette alternative vide (`alt=""`). Elles devraient reprendre le nom du produit (ex: `alt={item.product.name}`) pour permettre aux synthèses vocales d'informer le client des produits présents dans son panier.

### 3.3. Rôles ARIA des boîtes de dialogue
- Le composant `MediaPickerModal.jsx` n'intègre pas les attributs sémantiques `role="dialog"` et `aria-modal="true"`, indispensables pour informer les navigateurs qu'une fenêtre contextuelle est active au-dessus du flux de page principal.
