# 05 — Audit UI (Interface Utilisateur)

Ce document répertorie page par page et section par section les imperfections d'interface, de hiérarchie visuelle, d'alignement, d'espacement et de lisibilité constatées sur le Storefront et l'espace Admin de Hafrose.

---

## 1. Storefront (Espace Client)

### 1.1. En-tête / Navbar globale
- **Problème d'alignement & encombrement (écrans intermédiaires)** : Le logo "HAFROSE" est placé en absolute centré (`absolute left-1/2 -translate-x-1/2`). Sur les écrans de taille moyenne (tablettes de 768px à 1024px), les liens de navigation de gauche et les icônes d'actions de droite risquent de chevaucher le logo central. Une disposition flex répartie serait plus robuste et élégante.
- **Micro-texte sous logo** : La mention "Haute Maroquinerie" sous le logo utilise un texte minuscule de 7px (`text-[7px]`) avec un fort espacement de lettre (`tracking-[0.6em]`). Cette taille est à la limite de la lisibilité, notamment sur les dalles d'écran non-Retina ou pour les utilisateurs malvoyants.
- **Couleur de la ligne active** : La barre active d'indication de page (`layoutId="activeNavBorder"`) s'affiche en or jaune vif, créant un contraste trop fort avec le fond crème.

### 1.2. Section Hero (Page d'accueil)
- **Contrastes de texte** : L'image de fond `/images/hero.png` comporte des zones claires. L'overlay sombre (`bg-black/40`) n'est pas suffisant à certains endroits pour garantir un contraste optimal de lisibilité pour le sous-titre italique en gris-crème clair (`text-luxury-cream/80`).
- **Trait décoratif bas** : La ligne verticale décorative en bas (`bg-gradient-to-t from-luxury-gold to-transparent`) utilise l'or jaune qui doit disparaître du projet.

### 1.3. Section MaisonPresentation
- **Asymétrie et Espacements** : Le panneau décoratif noir à droite contenant la lettre géante "H" en transparence et la citation utilise une police blanche très délavée. Les deux bordures d'angle dorées (`border-luxury-gold/45`) sont trop décalées sur mobile et peuvent déborder de l'écran ou de leur conteneur sur les petits viewports.
- **Taille de la citation** : La citation est affichée en taille standard, ce qui réduit son importance éditoriale. Le texte devrait être plus grand pour accrocher l'œil.

### 1.4. Section PopularCategories
- **Contrastes dans les cartes** : Le texte descriptif blanc de chaque catégorie n'apparaît qu'au survol avec un fondu d'opacité. L'image de fond étant assombrie par un filtre de luminosité fixe, la lisibilité du texte blanc est correcte mais dépend entièrement de la clarté de l'image Unsplash utilisée. Si l'image est claire, le texte descriptif devient illisible (manque d'un dégradé de protection noir sous le texte).

### 1.5. Section FeaturedProducts (Créations Vedettes)
- **Hiérarchie de prix** : Le prix des articles dans les cartes produits (`ProductCard.jsx`) est écrit en petit (`text-xs`) et coloré en jaune or. Dans le luxe, le prix doit être discret mais lisible, et affiché dans une couleur neutre (anthracite ou gris très sombre) pour ne pas donner l'impression d'une promotion commerciale.

### 1.6. Section WhyChooseUs
- **Bordures d'icônes** : Les icônes Feather sont logées dans un cercle avec une bordure fine jaune or à 20% d'opacité (`border-luxury-gold/20`). Ce cercle accentue inutilement l'icône, cassant le minimalisme du fond noir charbon.

### 1.7. Section Testimonials
- **Taille des guillemets décoratifs** : Le caractère de guillemet géant de décoration en arrière-plan (`”`) utilise la taille `text-7xl` avec une opacité de 5% de jaune or. Sur mobile, ce caractère imposant se décale et gêne la lecture du texte de témoignage principal.

### 5.8. Section Newsletter
- **Bouton d'action** : Le bouton "S'inscrire" utilise un effet de grossissement au clic/survol Framer Motion (`whileHover={{ scale: 1.05 }}`) qui fait déborder le bouton sur l'input adjacent à cause d'une marge flexible (`mt-8`).

### 1.9. Page Boutique (`/shop`)
- **Pastilles de couleurs des filtres** : Les pastilles de couleurs des filtres avancés n'ont pas de contour de protection. La couleur "Blanc cassé" ou "Crème" se fondrait complètement dans le fond de page crème sans délimitation.
- **Champs de budget** : Les champs d'entrée pour les prix min et max utilisent le composant `Input.jsx` sans possibilité d'afficher d'unité (€) directement dans le champ, obligeant à l'écrire dans le placeholder.

### 1.10. Page Produit (`/product/:slug`)
- **Étoiles d'évaluation** : Les étoiles d'avis client (`★`) utilisent la couleur or jaune vif qui détonne avec l'ambiance sobre. Le bouton d'augmentation/diminution de quantité est entouré d'une bordure grise trop épaisse qui ressemble à un composant de tableau de bord plutôt qu'à un outil de boutique de joaillerie.

---

## 2. Espace Administration (Back Office)

### 2.1. Pages de formulaires et de listes
- **Grilles et Espacements serrés** : Les tableaux et listes du back office manquent cruellement d'espacement intérieur (`padding`). Les lignes des tableaux (`table tr`) collent les unes aux autres.
- **Champs de saisie des formulaires en modal** : Lorsque l'administrateur ouvre la modal d'ajout de produit ou de catégorie, les champs sont entassés sur une seule colonne avec un espacement minimal (`space-y-4`), ce qui rend la saisie désagréable.
- **Boutons de pagination d'administration** : Les boutons "Précédent" et "Suivant" dans `MediaPickerModal.jsx` ou dans les tables utilisent un rayon de courbure par défaut (`rounded`) de Tailwind, ce qui est en désaccord visuel avec le reste des boutons rectangulaires stricts de l'application.
- **Combinaisons de couleurs en Admin** : La page d'administration utilise un mélange de jaune or, de bleu, de vert et de rouge, dégradant la sensation d'élégance de la console d'administration.
