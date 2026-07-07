# HAFROSE — BLUEPRINT DU DESIGN SYSTEM (UI FOUNDATION)

**Version** : 1.0  
**Statut** : Document de référence approuvé  
**Auteurs** : Senior UI/UX Designer & Frontend Tech Lead  
**Objectif** : Source unique de vérité et spécification fonctionnelle de la charte visuelle et comportementale de la Maison Hafrose.

---

## 1. Vision

La philosophie visuelle de la Maison Hafrose repose sur le concept de **"Lenteur Luxueuse"** et de **"Pureté Radicale"**. Il ne s'agit pas de concevoir une simple boutique e-commerce fonctionnelle, mais de façonner un écrin numérique haut de gamme.

- **Élégance** : La finesse des traits, la légèreté des polices et la douceur des teintes de la Maison s'associent pour créer un sentiment d'harmonie naturelle.
- **Minimalisme** : Épurer pour glorifier. Chaque bouton, chaque label ou image doit être utile et nécessaire. La pollution visuelle est éliminée. Le vide n'est pas une absence, c'est un choix de design destiné à donner de l'importance aux produits de maroquinerie.
- **Luxe** : La sensation de luxe s'exprime par le contraste subtil des tailles, l'alignement géométrique strict et le rejet des animations saccadées ou rapides.
- **Émotion & Storytelling** : Mettre en scène les créations (sacs, joaillerie, horlogerie) à travers leur genèse, leur matière noble, et le geste technique de l'artisan.
- **Cohérence absolue** : Aucune différence de style, de couleur ou de police n'est tolérée entre l'expérience client et la console d'administration. Le Design System est universel.

---

## 2. Brand Identity

- **Personnalité de la Maison** : Sophistiquée, intemporelle, exclusive et respectueuse de l'artisanat français d'excellence.
- **Ton Visuel** : Serein, épuré, éditorial (proche de la mise en page d'un magazine d'art ou de mode).
- **Perception recherchée** : Qualité sans concession, prestige historique et modernité créative.
- **Émotions à transmettre** : 
  - *Sérénité* (lors de la navigation)
  - *Désir* (lors de la découverte d'un modèle)
  - *Confiance absolue* (lors du paiement et de la relation avec la conciergerie).

---

## 3. Palette Officielle

Toutes les couleurs doivent être répertoriées dans le thème global du Design System. Le jaune or d'origine (`#D4AF37`) est supprimé et remplacé par les teintes douces ci-dessous.

| Catégorie | Nom officiel | Hexadécimal | Rôle / Utilisation |
|---|---|---|---|
| **Primary** | Rose Gold | `#B5828C` | Couleur phare d'accentuation, prix des fiches, liens actifs, états sélectionnés. |
| **Secondary** | Rose Poudré | `#E8C5CC` | Survol doux, lueur de loaders, fonds d'accentuation. |
| **Background** | Blush Rosé | `#F5E6E8` | Fonds de sections promotionnelles, aplats de citations. |
| **Surface** | Blanc Cassé | `#FDFBF7` | Fond de page principal (Storefront global). |
| **Accent** | Warm Gold (Or discret) | `#C4A882` | Lignes de séparation fines, ornements d'angle, indications secondaires. |
| **Accent Hover** | Warm Gold Dark | `#B09070` | Effets de survol sur ornements dorés et scrollbars. |
| **Text Primary** | Anthracite | `#111111` | Textes de paragraphe, titres H1/H2, boutons remplis, étiquettes actives. |
| **Text Secondary**| Gris Chaud | `#7F7F7F` | Textes secondaires, sous-titres, fil d'Ariane, labels d'inputs. |
| **Border** | Beige | `#F2EDE8` | Bordures de cartes produits, contours d'inputs, lignes de grille. |
| **Divider** | Beige Clair | `#FDFBF7` / `Beige` | Séparateurs horizontaux fins (1px) de tableaux et fiches techniques. |

### États systémiques (Sémantiques) :
- **Success** : Vert Céladon (`#E2ECE9` en fond, `#2E5A44` pour le texte).
- **Warning** : Ocre Pâle (`#F7EFE5` en fond, `#996A32` pour le texte).
- **Error** : Grenat Doux (`#FAF0F2` en fond, `#A33E53` pour le texte).
- **Info** : Bleu de Minuit (`#E9EFF5` en fond, `#2C4D75` pour le texte).

### États d'interactions :
- **Hover** : Transition de couleur douce (0.5s) vers le Rose Gold Foncé (`#9E6E78`) ou opacité réduite à 80%.
- **Focus** : Outline fine (1px) Rose Gold avec un décalage (offset) de 2px.
- **Disabled** : Opacité fixée à 40%, curseur non autorisé (`cursor-not-allowed`).
- **Active** : Accentuation Rose Gold saturée.

---

## 4. System Typographique

Pour refléter le prestige d'une Maison d'exception, l'échelle typographique doit être rigoureuse.
- **Titres Principaux (H1, H2)** : Cormorant Garamond (Sérif raffinée).
- **Sous-titres & Récits (H3, H4, Italic)** : Playfair Display (Sérif classique).
- **Corps de texte, boutons, formulaires** : Plus Jakarta Sans (Sans-sérif géométrique moderne).

| Niveau | Police | Taille | Graisse (Weight) | Line Height | Letter Spacing | Utilisation |
|---|---|---|---|---|---|---|
| **H1** | Cormorant Garamond | `40px` (mobile)<br>`64px` (desktop) | Extralight (200) | `1.1` | `0.15em` | Titres de pages, titres Hero, grands remerciements. |
| **H2** | Cormorant Garamond | `28px` (mobile)<br>`40px` (desktop) | Light (300) | `1.2` | `0.10em` | Titres de sections majeures. |
| **H3** | Playfair Display | `20px` (mobile)<br>`24px` (desktop) | Light (300) | `1.3` | `0.05em` | Titres de cartes catégories, titres d'avis client. |
| **H4** | Playfair Display | `16px` (mobile)<br>`18px` (desktop) | Light (300) | `1.4` | `0.02em` | Titres secondaires de formulaires. |
| **Body Large** | Plus Jakarta Sans | `15px` | Light (300) | `1.6` | `0.01em` | Textes d'introduction de récits, descriptions phares. |
| **Body** | Plus Jakarta Sans | `13px` | Light (300) | `1.6` | `0.01em` | Textes de paragraphes généraux, commentaires. |
| **Body Small** | Plus Jakarta Sans | `11px` | Light (300) | `1.5` | `0.02em` | Fiches techniques, spécifications produits. |
| **Caption** | Plus Jakarta Sans | `9px` | Medium (500) | `1.4` | `0.25em` (uppercase) | Supertitles de sections, étiquettes, tags matières. |
| **Button** | Plus Jakarta Sans | `10px` | Medium (500) | `1.0` | `0.30em` (uppercase) | Boutons d'action. |
| **Label** | Plus Jakarta Sans | `10px` | Medium (500) | `1.0` | `0.25em` (uppercase) | Libellés de champs de formulaires. |

---

## 5. Spacing System (La Grille d'Espacement)

Hafrose adopte une échelle géométrique stricte basée sur un pas de **4px** et **8px**. Le vide est notre outil de design principal pour isoler et valoriser les modèles.

| Token | Valeur | Usage officiel |
|---|---|---|
| **sp-1** | `4px` | Écarts minimes (badge à côté d'un texte, sous-titre de bouton). |
| **sp-2** | `8px` | Espacement interne très serré (étiquette matière sous l'image). |
| **sp-3** | `12px` | Espacement entre label et input, écart de fil d'Ariane. |
| **sp-4** | `16px` | Espacement interne standard de cartes, écarts de formulaire. |
| **sp-6** | `24px` | Marges intérieures de modals, espacement de grille compacte. |
| **sp-8** | `32px` | Paddings extérieurs de blocs secondaires, marges de cartes. |
| **sp-10**| `40px` | Espacement entre titre de section et début de grille. |
| **sp-12**| `48px` | Paddings verticaux de sections secondaires, marges de bas de page. |
| **sp-16**| `64px` | Séparation de formulaires majeurs. |
| **sp-20**| `80px` | Marges de sections sur tablettes. |
| **sp-24**| `96px` | Marges de sections par défaut sur ordinateur de bureau (breathing room). |
| **sp-32**| `128px`| Grands espaces vides pour les sections à fort storytelling éditorial. |

---

## 6. Border Radius (Rayons de courbure)

Pour préserver l'élégance minimaliste, géométrique et contemporaine de la joaillerie et maroquinerie, le Storefront applique des angles droits nets.

- **Storefront (Boutique client)** :
  - **Boutons** : `rounded-none` (0px - Angles droits stricts).
  - **Cartes produits** : `rounded-none` (0px).
  - **Cartes catégories** : `rounded-none` (0px).
  - **Champs de formulaire (Inputs)** : `rounded-none` (0px).
  - **Images de galeries** : `rounded-none` (0px).
  - **Badges** : `rounded-none` (0px).
  - **Tiroirs coulissants (Drawers)** : `rounded-none` (0px).
  - **Indicateur de quantité** : `rounded-none` (0px).
- **Console d'Administration (Back Office)** :
  - **Conteneurs de métriques** : `rounded-none` (0px - harmonisé avec le storefront).
  - **Modals d'administration** : `rounded-none` (0px).
  - **Champs & boutons admin** : `rounded-none` (0px).

---

## 7. Shadows (Les Ombres)

Les ombres doivent être extrêmement subtiles ou absentes pour éviter tout effet de relief lourd typique du web bas de gamme.

- **Small (Boutons / Petites cartes)** : Sans ombre (`none`). La démarcation se fait par des bordures fines d'une opacité de 5% à 10%.
- **Medium (Survol des cartes)** : Ombre diffuse ultra-légère (`shadow-sm` ou `shadow-luxury` personnalisée : `0 4px 20px -2px rgba(17, 17, 17, 0.03)`).
- **Large (Modals & Drawers coulissants)** : Ombre directionnelle adoucie (`0 20px 40px -10px rgba(17, 17, 17, 0.08)`).
- **Dropdowns (Sélecteurs de tri / Langues)** : Bordure fine Beige associée à une ombre diffuse légère.

---

## 8. Layout Rules (Règles de mise en page)

- **Container standard** : Largeur maximale de `1280px` (`max-w-7xl`) avec des marges intérieures latérales de `24px` (`px-6`) sur mobile et `48px` (`px-12`) sur ordinateur.
- **Large Container (Bandeaux d'images / Vidéos)** : Pleine largeur (`w-full` ou `max-w-none`).
- **Structure de grilles** :
  - Catalogue : 4 colonnes sur ordinateur (`lg:grid-cols-4`), 2 colonnes sur tablette (`sm:grid-cols-2`), 1 colonne sur mobile.
  - Écarts de grilles : `gap-x-6` horizontalement pour aérer, `gap-y-10` verticalement pour laisser respirer le prix et le titre sous l'image.
- **Séparations de sections** : Utilisation systématique de marges verticales généreuses (`py-24` ou `py-32`) pour créer du vide éditorial.

---

## 9. Component Standards (Spécifications des Composants)

### 9.1. Navbar
- **Rôle** : Navigation, panier d'achat et accès à la recherche.
- **Comportement** : Fixée en haut de page (`fixed top-0`). Transparente au chargement, elle devient Blanc Cassé opaque à 90% avec un flou d'arrière-plan (`backdrop-blur-md`) après un défilement de 20px.
- **Variantes** : Desktop (liens visibles alignés) et Mobile (hamburger ouvrant un volet gauche).
- **Mini-Panier (`CartDrawer`)** : Coulisse depuis la droite. Le bouton "Commander" doit être rectangulaire, rempli d'Anthracite.

### 9.2. Footer
- **Rôle** : Liens d'information, mentions légales, et inscription newsletter.
- **Comportement** : Statique en bas de page.
- **Newsletter** : Le bouton de validation doit déclencher un message de validation élégant injecté en dessous et non une alerte système.

### 9.3. Hero
- **Rôle** : Accueil de l'utilisateur avec une image d'art et la philosophie.
- **Animations** : L'image de fond doit osciller très lentement avec un effet de souffle (`pulse-subtle` sur 8 à 12 secondes).
- **Bouton** : Un seul bouton central d'appel à l'action.

### 9.4. Button
- **Variantes** :
  - `primary` : Remplissage Anthracite, texte Blanc Cassé, bordure Anthracite. Au survol : fond transparent, texte Anthracite.
  - `secondary` : Fond transparent, texte Anthracite, bordure Anthracite. Au survol : fond Anthracite, texte Blanc Cassé.
  - `rose` : Remplissage Rose Gold, texte Blanc Cassé, bordure Rose Gold. Au survol : fond Rose Gold Foncé.
  - `warm` : Fond transparent, texte Rose Gold, bordure Rose Gold. Au survol : fond Rose Gold, texte Blanc Cassé.
  - `text` : Pas de fond, pas de bordure latérale. Fine ligne horizontale inférieure qui s'étire au survol.

### 9.5. Input
- **Apparence** : Fond blanc, bordure Beige fine (`border-luxury-charcoal/10`).
- **Focus** : Pas d'arrondi. La bordure passe à la nuance Rose Gold (`border-luxury-rose-gold`) avec une transition fluide de 0.3s.

### 9.6. Product Card
- **Comportement** : Au survol de la souris, l'image s'agrandit légèrement (`scale-103` sur 1.5s) et un bandeau d'appel "Aperçu rapide" apparaît en fondu doux depuis le bas.
- **Mobile** : Pas d'aperçu rapide au clic simulé. Le premier clic ouvre directement la fiche produit.

### 9.7. Badge
- **Apparence** : Rectangulaire, texte en majuscules minuscule (9px) avec un grand espacement de lettres.
- **Couleurs** : Outline discrète pour le stock classique, vert céladon doux pour "Disponible", rouge bordeaux doux pour "Indisponible".

### 9.8. Loader
- **Apparence** : Bague fine rotative Rose Gold avec un point central scintillant. En plein écran, fond transparent avec un flou de verre (`backdrop-blur-md`).

---

## 10. Iconography (Iconographie)

- **Famille d'icônes** : Feather Icons (`react-icons/fi`).
- **Style** : Traits fins (épaisseur par défaut fixée à `1.5px` ou `1px` pour les icônes de grande taille).
- **Couleurs** : Anthracite pour les actions, Rose Gold pour les éléments actifs ou validés, Gris Chaud pour les icônes de décoration (ex: fil d'Ariane, indications secondaires).
- **Dimensions** : `14px` pour les micro-icônes, `18px` pour les icônes de navigation de la Navbar, `24px` maximum pour les indicateurs majeurs.

---

## 11. Imagery (Charte Photographique)

Les images de Hafrose doivent susciter l'émotion et légitimer le positionnement luxe.

- **Style photo** : Éditorial, artistique, haut de gamme. Éviter absolument les photos de type catalogue standard sur fond blanc pur éclatant.
- **Angles** : Prises de vue épurées avec des angles asymétriques mettant en valeur le grain du cuir ou la brillance des métaux.
- **Lumière** : Douce, naturelle, avec des ombres portées douces (style lumière du jour à travers une fenêtre parisienne).
- **Fonds** : Texturés neutres (béton ciré clair, marbre mat, lin, drapés crème).
- **Qualité** : Fichiers compressés sans perte (format WebP ou AVIF requis).

---

## 12. Animation System

Le mouvement doit exprimer le luxe par sa lenteur et sa régularité.

- **Durées de référence** :
  - Micro-interactions (hover liens, focus inputs) : `0.3s` (300ms) à `0.4s` (400ms).
  - Transitions de volets / Modals : `0.5s` (500ms) avec courbe spring.
  - Zoom d'image au survol : `1.5s` (1500ms) à `2.0s` (2000ms) (zoom très lent).
  - Pulsation d'arrière-plan (Hero) : `10s` (10000ms).
- **Courbes d'accélération (Easing)** :
  - Transition standard : `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo).
  - Transition de positionnement : `cubic-bezier(0.25, 1, 0.5, 1)` (easeOutQuart).
- **Animations interdites** :
  - Aucun effet de rebond élastique sur les éléments d'interface.
  - Aucune rotation d'icônes lors du survol.
  - Aucune animation de secousse (shake) automatique pour attirer l'attention.

---

## 13. Motion Principles (Principes de Mouvement)

1. **Intentionnalité** : L'animation doit guider l'utilisateur (ex: le panier qui glisse depuis la droite montre d'où provient le volet et où il se range).
2. **Discrétion** : Les animations de texte doivent être à peine perceptibles (léger glissement de 15px vers le haut associé à un fondu d'opacité).
3. **Optimisation** : Toutes les animations de survol d'images doivent s'effectuer sur les propriétés CSS `transform` et `opacity` afin d'être exécutées par la carte graphique (GPU) sans recalculer la mise en page (reflow).

---

## 14. Accessibilité (Normes WCAG 2.2 AA)

- **Rapports de Contraste** :
  - Tout texte de paragraphe ou titre doit afficher un contraste de **4.5:1** au minimum par rapport à son arrière-plan.
  - Les éléments décoratifs ou icônes de contrôle actives doivent afficher un contraste de **3:1** minimum.
  - Le Rose Gold (`#B5828C`) utilisé sur fond Crème (`#FDFBF7`) est réservé aux titres de grande taille ou aux boutons à fond rempli. Pour les textes de prix ou d'indicateurs de petite taille, une nuance plus foncée (`#9E6E78`) ou de l'Anthracite doit être employée pour atteindre les exigences de contraste.
- **Trap Focus (Piège de focus)** : L'ouverture de toute modal ou drawer doit bloquer le focus de la touche `TAB` à l'intérieur de sa structure et le restituer au bouton d'origine lors de sa fermeture.
- **Attributs ALT** : Chaque image produit doit posséder son descriptif d'identification (`alt={product.name}`).
- **Zonage tactile** : Chaque bouton cliquable ou lien sur mobile doit offrir une surface de contact physique d'au moins **44px sur 44px**.

---

## 15. Responsive Rules (Règles Adaptatives)

| Format | Largeur minimale | Marges extérieures (Padding) | Comportement |
|---|---|---|---|
| **Mobile** | `320px` | `16px` (`px-4`) | Navigation via Hamburger Menu. Grilles de produits sur 1 colonne ou carrousels horizontaux. Le récapitulatif du panier d'achat est épinglé en bas de l'écran lors du checkout. |
| **Tablette** | `768px` | `24px` (`px-6`) | Grille de produits sur 2 colonnes. Galerie d'images et fiche produit disposées en une seule colonne. |
| **Laptop** | `1024px` | `40px` (`px-10`) | Navigation de bureau complète. Grille sur 3 colonnes. Galerie d'images et détails affichés côte à côte. |
| **Desktop** | `1280px` | `48px` (`px-12`) | Largeur maximale du conteneur bloquée à `1280px`. Grille sur 4 colonnes. |
| **Large Desktop**| `1536px` | Centrage automatique | Alignement centré avec de grandes marges extérieures blanches pour conserver l'aspect éditorial. |

---

## 16. UX Principles (Principes d'Ergonomie)

- **Navigation épurée** : L'accès aux grandes catégories doit être disponible en un clic depuis n'importe quel écran.
- **Validation en douceur** : Toute interaction de validation (ex: ajout au panier, inscription newsletter, envoi de contact) doit être accompagnée d'un retour visuel instantané et gratifiant.
- **Tunnel de commande sans friction** : Le formulaire de commande doit être le plus court possible (nom, téléphone, adresse, ville).
- **Ressaisie interdite** : Les données de livraison saisies par l'utilisateur doivent être mémorisées localement en cas d'erreur de soumission pour lui éviter de devoir tout ressaisir.
- **Recherche prédictive** : La recherche doit être fluide et ne déclencher de requêtes API qu'avec un debounce approprié (300ms).

---

## 17. Luxury Principles (Principes du Luxe Digital)

Pour élever le niveau d'Hafrose au rang de Dior ou Cartier, les développeurs frontend appliqueront ces 6 commandements esthétiques :
1. **Le culte de l'espace blanc** : Plus un produit a de la valeur, plus l'espace vide autour de lui doit être grand. Le vide est signe de prestige.
2. **La sobriété colorimétrique** : L'utilisation de plus de 3 couleurs distinctes sur une même section est proscrite.
3. **Le minimalisme textuel** : Les fiches produits doivent masquer les longs détails techniques derrière des onglets ou des accordéons discrets pour laisser place au visuel.
4. **La discrétion tarifaire** : Le prix ne doit jamais être affiché en grand ou en couleur vive (pas de rouge promotionnel). Il doit être écrit dans la même taille ou plus petit que le nom du produit.
5. **L'alignement rectangulaire** : Le rejet des arrondis complexes transmet une rigueur architecturale haut de gamme.
6. **L'art du storytelling** : Chaque pièce doit s'accompagner d'une courte phrase décrivant sa matière noble ou son inspiration artistique.

---

## 18. Component Library Roadmap

Voici la liste ordonnée des composants qui composeront la bibliothèque d'Hafrose à l'issue de la transformation :

### 1. Foundation (Socle de base)
- [ ] `Theme/index.css` (Spécification des variables Tailwind v4)
- [ ] `Typography` (Classes et balises typographiques harmonisées)
- [ ] `Icons` (Bibliothèque d'icônes Feather encapsulées)

### 2. Navigation
- [ ] `Navbar` (En-tête dynamique et adaptatif)
- [ ] `Footer` (Pied de page global avec newsletter)
- [ ] `Breadcrumb` (Fil d'Ariane)
- [ ] `Pagination` (Contrôle de pages)

### 3. Forms (Formulaires)
- [ ] `Input` (Champ de texte et gestion d'erreurs)
- [ ] `Select` (Sélecteur stylisé sans styles natifs)
- [ ] `Textarea` (Zone de texte multi-lignes)
- [ ] `QuantitySelector` (Contrôleur de quantité réutilisable)

### 4. Commerce
- [ ] `ProductCard` (Carte produit avec zoom progressif)
- [ ] `CategoryCard` (Carte catégorie avec descriptif au survol)
- [ ] `CartDrawer` (Panier d'achat coulissant droit)
- [ ] `OrderSummary` (Récapitulatif financier et fiscal de commande)

### 5. Feedback & Loaders
- [ ] `Loader` (Spinner de chargement)
- [ ] `Badge` (Étiquettes de stock et statuts)
- [ ] `ToastAlert` (Notifications de succès/erreur unifiées)

### 6. Admin
- [ ] `SalesChart` (Graphique d'évolution des ventes mis aux teintes de la Maison)
- [ ] `AdminTable` (Tableaux de gestion aérés)
- [ ] `MediaPicker` (Médiathèque de sélection)

---

## 19. Transformation Rules (Règles de Code)

1. **Aucune régression** : Les tests du backend (49/49 admin et tests globaux) doivent être exécutés et validés à chaque commit.
2. **Réutilisation stricte** : Il est interdit de réécrire un sélecteur de quantité ou un champ de saisie si celui-ci existe déjà dans les primitives UI.
3. **Saisie contrôlée** : Tout champ de recherche textuelle relié à des requêtes d'API distantes doit intégrer un debounce.
4. **Style unifié** : Aucune classe utilitaire de couleur jaune or (`text-luxury-gold`, `bg-luxury-gold`, etc.) ne doit subsister à la fin de la refonte.
5. **Indépendance visuelle de l'admin** : L'espace d'administration (`AdminLayout`) doit rester élégant et lisible sans dégrader l'expérience utilisateur des gestionnaires, mais doit s'aligner sur la rigueur géométrique (angles stricts) et la charte chromatique de la marque.

---

## 20. Acceptance Criteria (Critères d'Acceptation)

La transformation esthétique du Design System d'Hafrose sera validée uniquement si les 7 conditions suivantes sont remplies :
- [ ] **Critère 1** : L'ensemble des occurrences de couleur jaune or a disparu du code source.
- [ ] **Critère 2** : La police `Cormorant Garamond` est active sur tous les titres principaux (H1/H2).
- [ ] **Critère 3** : Le compilateur de Vite génère la version finale de production sans aucune alerte CSS ou JS.
- [ ] **Critère 4** : Tous les boutons, inputs et cartes produits possèdent des angles droits stricts (`rounded-none`).
- [ ] **Critère 5** : L'ouverture des volets mobiles et paniers d'achats coulissants intègre un focus trap fonctionnel validé au clavier.
- [ ] **Critère 6** : La saisie dans le champ de recherche de la boutique n'envoie pas plus d'une requête API par tranche de 300ms.
- [ ] **Critère 7** : Le site s'affiche sans défilement horizontal parasite sur mobile (largeur d'écran de 320px).
