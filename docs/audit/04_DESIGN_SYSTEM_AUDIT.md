# 04 — Audit du Design System

Ce document détaille l'analyse du Design System de Hafrose défini dans `src/index.css` et appliqué à travers les classes utilitaires de Tailwind CSS v4. Il met en évidence les incohérences chromatiques, typographiques et de composants avant la refonte.

---

## 1. Analyse Chromatique (La Palette de Couleurs)

La palette actuelle est déclarée dans la directive `@theme` de Tailwind v4 dans `src/index.css` :

```css
--color-luxury-gold: #D4AF37;       /* Jaune Or vif */
--color-luxury-gold-hover: #C5A028; /* Jaune Or assombri */
--color-luxury-gold-dark: #AA7C11;  /* Jaune Or foncé */
--color-luxury-cream: #FDFBF7;      /* Crème chaud (fond global) */
--color-luxury-charcoal: #111111;   /* Anthracite profond (textes/boutons) */
--color-luxury-gray: #7F7F7F;       /* Gris intermédiaire (sous-titres) */
--color-luxury-light-gray: #F5F5F5; /* Gris clair (fonds secondaires/images) */
--color-luxury-bronze: #8C6239;     /* Bronze terreux */
```

### Incohérences et problèmes identifiés :
1. **La présence du jaune** : Le jaune or (`#D4AF37`) est trop saturé et agressif. Il s'éloigne de l'élégance douce et féminine dictée par le document de référence `FRONTEND_TRANSFORMATION_CONTEXT.md` (qui demande une palette **Rose poudré, Rose Gold, Blanc cassé, Beige, Or discret, Anthracite**).
2. **Couleurs inutilisées** : La variable `--color-luxury-gold-dark` n'est utilisée nulle part dans le code, sauf pour le survol de la barre de défilement (scrollbar) dans `index.css`. Elle doit être supprimée.
3. **Variables hors-thème** : Les composants d'état (badges `success` et `danger`, bordures d'erreurs d'inputs) font directement appel aux palettes Tailwind par défaut (`emerald`, `rose`, `red-400`, `rose-500`), qui n'appartiennent pas au Design System de la Maison.
4. **Bronze vs Beige** : La couleur `--color-luxury-bronze` est trop marron et chaude, manquant du raffinement d'un beige texturé.

---

## 2. Audit Typographique

### Configuration actuelle :
- **Serif (Titres, H1 à H6)** : `Playfair Display`, Georgia, serif (avec un ajustement de `letter-spacing: -0.02em` appliqué globalement).
- **Sans (Corps de texte, boutons, formulaires)** : `Plus Jakarta Sans`, ui-sans-serif, system-ui, sans-serif.

### Problèmes identifiés :
1. **Playfair Display** : C'est une police classique élégante, mais très courante sur le web. Pour une Maison de Haute Maroquinerie se comparant à Cartier ou Hermès, elle manque d'exclusivité. L'intégration de `Cormorant Garamond` ou un affinement de la graisse permettrait de rehausser la distinction visuelle.
2. **Hiérarchie et Tailles** : Il y a de grandes variations de tailles de textes déclarées de façon ad-hoc dans les pages (ex: `text-[9px]`, `text-[10px]`, `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`). Une échelle typographique stricte et harmonisée n'est pas encore appliquée.

---

## 3. Espacements et Grilles (Layout & Grid)

- Le site utilise principalement les espacements verticaux `py-24` pour séparer les sections de la page d'accueil.
- **Limites observées** :
  - L'utilisation répétée de `py-24` uniformise le rythme visuel et crée une sensation de monotonie. Les sites de luxe exploitent l'asymétrie (grands espaces vides contrastant avec des zones de texte très denses et centrées).
  - Les grilles de produits utilisent un espacement standard (`gap-8` ou `gap-6`) sans utiliser les bordures de séparation fines et aérées propres aux catalogues premium de joaillerie.

---

## 4. Rayon de Courbure (Border Radius) et Ombres (Shadows)

### Analyse :
1. **Storefront (Boutique client)** :
   - Les éléments d'interface principaux (`Button`, `Input`, `ProductCard`, `CategoryCard`, `Pagination`) utilisent tous la classe `rounded-none`. Cela donne des angles droits stricts (angles à 90°), très caractéristiques du design haut de gamme épuré et contemporain.
   - **Incohérence** : Le bouton de validation du panier coulissant (`Navbar.jsx`) n'a pas de classe `rounded-none` explicite mais hérite des styles globaux, tandis que le badge (`Badge.jsx`) n'a pas de rayon et s'affiche sous forme de rectangle strict. Les inputs d'administration et les boutons utilisent du `rounded` ou `rounded-lg`, introduisant une cassure esthétique entre le Storefront (angulaire, minimaliste) et le Back Office (arrondi, standard).
2. **Ombres (Shadows)** :
   - Le Storefront utilise très peu d'ombres, à l'exception du panneau décoratif de `MaisonPresentation.jsx` (`shadow-xl`) et des tiroirs coulissants (`shadow-2xl`). Cela préserve le minimalisme plat.

---

## 5. Composants Visuels Clés

### 5.1. Boutons
- Cinq variantes de boutons dans `Button.jsx`.
- La variante `text` utilise une bordure basse transparente qui s'anime au survol. Les variantes `primary` et `secondary` jouent sur l'inversion des fonds (remplissage noir ou transparent).
- La variante `gold` et `outline` seront à réviser entièrement pour remplacer l'or jaune par le rose gold et l'or discret.

### 5.2. Formulaires
- Les champs de saisie de `Input.jsx` sont rectangulaires (`rounded-none`) avec une fine bordure anthracite à 10% d'opacité.
- Au focus, la bordure s'illumine en or jaune (`focus:border-luxury-gold`), ce qui nuit à l'élégance sobre voulue pour le projet.

### 5.3. Icônes
- Utilisation homogène de **Feather Icons (`react-icons/fi`)**. C'est un excellent choix de design system car les tracés de Feather Icons sont fins (1px/1.5px), modernes et géométriques, s'adaptant parfaitement aux chartes graphiques de luxe.
