# HAFROSE — Design System Officiel
## Charte Graphique & Tokens Visuels Premium (Phase 2)

> **Statut :** Officiel & Definitif — Document de reference pour tous les futurs composants et pages.
> **Identite :** Maison de Mode Feminine de Luxe.
> **Valeurs Visuelles :** Elegance, Feminite, Luxe, Douceur, Raffinement, Simplicite, Modernite.
> **Stack :** React 19 · TypeScript · Tailwind CSS · Lucide Icons

---

## 1. Palette Officielle HAFROSE

La palette de couleurs HAFROSE a ete concue pour offrir un contraste visuel harmonieux, chaleureux et haut de gamme.

### 1.1 Couleurs Principales de Marque

#### Rose Principal (Couleur de Marque & Accent Feminine)
* **HEX Principal :** `#D9778F` (Rose 500)
* **Usage :** Accents feminins, badges de collection, etats actifs secondaires, touches de douceur.
* **Nuancier 50 → 900 :**
  * `rose-50` (`#FDF7F8`) : Survol tres leger, fonds de popovers
  * `rose-100` (`#FBF0F2`) : Arriere-plan de badges feminins
  * `rose-200` (`#F6DFE4`) : Bordures d'elements secondaires
  * `rose-300` (`#EEBFCA`) : Focus rings doux
  * `rose-400` (`#E297A9`) : Hover sur elements roses
  * `rose-500` (`#D9778F`) : **Rose Accent Principal**
  * `rose-600` (`#C45772`) : Couleur de texte d'accent sur fond clair
  * `rose-700` (`#A53E58`) : Hover sur texte rose
  * `rose-800` (`#89344A`) : Contraste eleve
  * `rose-900` (`#732F41`) : Ombrages teintes

#### Bordeaux (Signature Luxe & Boutons Primaires)
* **HEX Principal :** `#8A1538` (Burgundy 500)
* **Usage :** Couleur emblématique de la Maison HAFROSE. Boutons primaires, logos, titres majeurs, etats selectionnes.
* **Nuancier 50 → 950 :**
  * `burgundy-50` (`#F8F1F3`) : Arriere-plan d'alerte ou de notification noble
  * `burgundy-100` (`#F0E0E5`) : Conteneurs secondaires avec teinte bordeaux
  * `burgundy-200` (`#DFC2CB`) : Bordures d'elements actifs
  * `burgundy-300` (`#C79BA9`) : Separateurs d'accent
  * `burgundy-400` (`#AC6D81`) : Hover d'elements contour bordeaux
  * `burgundy-500` (`#8A1538`) : **Bordeaux Signature HAFROSE**
  * `burgundy-600` (`#7B1231`) : Hover bouton primaire
  * `burgundy-700` (`#670E28`) : Active bouton primaire
  * `burgundy-800` (`#560E23`) : **Bordeaux Profond (Luxury Deep)**
  * `burgundy-900` (`#480F20`) : Textes sombres d'accent
  * `burgundy-950` (`#2D0512`) : Arriere-plans d'exception sombres

#### Creme & Blanc Casse (Fonds & Surfaçage Premium)
* **HEX Principal :** `#FAF6F0` (Cream 100) / `#FFFFFF` (Pure White)
* **Usage :** Arriere-plan principal du site (Cream 100) pour remplacer le blanc agressif des e-commerces ordinaires. Blanc pure pour les cartes et conteneurs.
* **Nuancier :**
  * `cream-50` (`#FFFFFF`) : Blanc Pur — Cartes, Modals, Inputs
  * `cream-100` (`#FAF6F0`) : **Creme Fond de Page Officiel HAFROSE**
  * `cream-200` (`#F5EFEB`) : Ivoire Doux — Surfaçage de cartes secondaires
  * `cream-300` (`#F0E8E1`) : Sable Chaud — Arriere-plan de sections alternees
  * `cream-400` (`#E4D9CE`) : Bordures de cartes creme

#### Or Champagne (Metaux Precious & Accents Prestige)
* **HEX Principal :** `#D4AF37` (Gold 500)
* **Usage :** Badges "Edition Limitee", etoiles d'avis client, iconographie luxury, bordures de cartes VIP.
* **Nuancier :**
  * `gold-50` (`#FCFBF5`) : Arriere-plan de cartes VIP
  * `gold-100` (`#FAF6E6`) : Badges d'exception
  * `gold-500` (`#D4AF37`) : **Or Champagne Metallic**
  * `gold-700` (`#93701E`) : Texte or sur fond clair

#### Neutres (Gris Clair, Gris Fonce & Noir Luxury)
* **Usage :** Typographie, bordures de formulaires, dividers, footer et sidebar admin.
* **Nuancier :**
  * `neutral-50` (`#FAFAFA`) : Surface tres claire
  * `neutral-100` (`#F4F4F5`) : Bordures d'elements passifs
  * `neutral-200` (`#E4E4E7`) : Dividers de cartes
  * `neutral-300` (`#D4D4D8`) : Bordure d'input de formulaire
  * `neutral-400` (`#A1A1AA`) : Texte placeholder
  * `neutral-500` (`#71717A`) : Texte secondaire / sous-titres
  * `neutral-600` (`#52525B`) : Texte de corps secondaire
  * `neutral-700` (`#3F3F46`) : Titres secondaires
  * `neutral-800` (`#27272A`) : Titres principaux
  * `neutral-900` (`#18181B`) : **Charcoal Deep**
  * `neutral-950` (`#09090B`) : **Noir Intense Luxury**

### 1.2 Couleurs de Statut & Feedback

* **Success :** `#16A34A` (fond `success-50` `#F0FDF4`) — Confirmation de commande, panier mis a jour.
* **Warning :** `#D97706` (fond `warning-50` `#FFFBEB`) — Alerte stock faible, code promo expirant.
* **Error :** `#DC2626` (fond `error-50` `#FEF2F2`) — Erreur de formulaire, paiement echoue.
* **Info :** `#2563EB` (fond `info-50` `#EFF6FF`) — Information de livraison, conseils d'entretien.

---

## 2. Typographies & Hierarchie Visuelle

### 2.1 Choix des Polices

| Usage | Police | Famille Tailwind | Esprit & Rôle |
|-------|--------|------------------|---------------|
| **Titres & Grand Luxe** | `Playfair Display` / `Cormorant Garamond` | `font-serif` | Elegance editoriale, caracteres romans raffinés, signature haute couture. |
| **Corps & UI** | `Montserrat` / `Inter` | `font-sans` | Lisibilite parfaite, modernite, nettete sur tous les ecrans. |
| **Chiffres & Prix** | `Montserrat` / `Playfair Display` | `font-sans` / `font-serif` | Prix nets et lisibles avec espacement de chiffres uniforme. |

### 2.2 Hierarchie Typographique Officielle

| Niveau | Taille CSS / Rem | Taille px | Line Height | Letter Spacing | Usage |
|--------|------------------|-----------|-------------|----------------|-------|
| **Display 2XL** | `4.5rem` | 72px | `1.05` | `-0.03em` | Super Hero, campagnes d'exception |
| **Display XL** | `3.75rem` | 60px | `1.1` | `-0.02em` | Titres de collections phares |
| **H1** | `2.25rem` / `3rem` (Desktop) | 36px / 48px | `1.15` | `-0.01em` | Titre principal de page |
| **H2** | `1.875rem` / `2.25rem` | 30px / 36px | `1.2` | `-0.01em` | Titres de sections majeures |
| **H3** | `1.5rem` / `1.875rem` | 24px / 30px | `1.25` | `0em` | Titres de cartes, sous-sections |
| **H4** | `1.25rem` | 20px | `1.3` | `0em` | Titres de blocs d'information |
| **H5** | `1.125rem` | 18px | `1.35` | `0em` | Intitule de filtres, modales |
| **H6** | `1rem` | 16px | `1.4` | `0em` | Titre de petits modules |
| **Body Large** | `1.125rem` | 18px | `1.6` | `0.01em` | Chapeau d'article, descriptions produits hero |
| **Body Base** | `1rem` | 16px | `1.6` | `0.01em` | Texte courant du site |
| **Body Small** | `0.875rem` | 14px | `1.5` | `0.01em` | Textes secondaires, aides au formulaire |
| **Caption** | `0.75rem` | 12px | `1.4` | `0.05em` | Mentions legales, dates, notes |
| **Badge / Button Upper** | `0.6875rem` | 11px | `1.0` | `0.15em` / `0.25em` | Boutons majuscules, badges |

---

## 3. Echelle d'Espacements & Grille

Le Design System HAFROSE repose sur une grille rythmique de 8px (et 4px pour les micro-espacements).

| Token Tailwind | Valeur rem | Valeur px | Usage Majeur |
|----------------|------------|-----------|--------------|
| `0.5` | `0.125rem` | 2px | Micro-ajustements d'alignement |
| `1` | `0.25rem` | 4px | Padding interne des badges et petites puces |
| `2` | `0.5rem` | 8px | Ecart entre icone et texte dans un bouton |
| `3` | `0.75rem` | 12px | Padding interne d'input compact |
| `4` | `1rem` | 16px | Gaps de grilles mobiles, padding de cartes |
| `6` | `1.5rem` | 24px | Gaps de cartes produit, padding de conteneurs |
| `8` | `2rem` | 32px | Espacement entre paragraphes et titres |
| `12` | `3rem` | 48px | Marges verticales de sections mobiles |
| `16` | `4rem` | 64px | Marges verticales de sections desktop |
| `24` | `6rem` | 96px | Espacement entre grands chapitres du site |
| `32` | `8rem` | 128px | Espacement Hero principal |

---

## 4. Border Radius (Rayons de Courbure)

HAFROSE privilege des coins delicats, subtils et architecturaux. Les arrondis excessifs de style "cartoon" sont strictement proscrits.

* **Small (`rounded-xs` / `2px`) :** Badges, puces, balises de filtre.
* **Medium (`rounded-sm` / `4px`) :** Boutons principaux, champs de saisie input/select.
* **Large (`rounded-md` / `6px`) :** Cartes produits, cartes de categories, blocs d'informations.
* **XL (`rounded-lg` / `8px`) :** Modales, tiroirs de navigation (drawers), conteneurs d'e-mail.
* **2XL (`rounded-xl` / `12px`) :** Popups promotionnelles et notifications d'exception.
* **Full (`rounded-full`) :** Avatars, boutons icônes circulaires, pastilles d'etat.

---

## 5. Ombres & Effets de Profondeur (Shadows)

Les ombres HAFROSE sont tres douces, utilisant la teinte du texte (`#1A1A1A`) avec une faible opacite pour conserver un effet aerien et elegant.

| Token Shadow | Definition CSS | Utilisation Officielle |
|--------------|----------------|------------------------|
| `shadow-hafrose-xs` | `0 1px 2px 0 rgba(26, 26, 26, 0.03)` | Elements plats subtils |
| `shadow-hafrose-sm` | `0 2px 8px 0 rgba(26, 26, 26, 0.04)` | Boutons outline au survol, cartes passives |
| `shadow-hafrose-md` | `0 4px 16px -2px rgba(26, 26, 26, 0.06)` | Cartes au survol, dropdowns d'options |
| `shadow-hafrose-lg` | `0 12px 32px -4px rgba(26, 26, 26, 0.08)` | Menus de navigation volants, cart drawer |
| `shadow-hafrose-xl` | `0 24px 48px -12px rgba(26, 26, 26, 0.12)` | Popovers de previsualisation rapide |
| `shadow-hafrose-hover` | `0 12px 28px -6px rgba(138, 21, 56, 0.12)` | Survol des boutons primaires Bordeaux |
| `shadow-hafrose-card` | `0 1px 3px 0 rgba(26, 26, 26, 0.04), 0 10px 24px -5px rgba(26, 26, 26, 0.05)` | Ombre par defaut des cartes produits |
| `shadow-hafrose-modal` | `0 20px 60px -10px rgba(0, 0, 0, 0.25)` | Modales centrees avec backdrop floute |
| `shadow-hafrose-glow` | `0 0 20px 2px rgba(212, 175, 55, 0.25)` | Halo d'accent pour les elements Or VIP |

---

## 6. Boutons — Variantes Officiel HAFROSE

Tous les boutons utilisent la police `Montserrat` (`font-sans`), des lettres majuscules avec un letter-spacing `tracking-luxury` (`0.15em`), une transition fluide `duration-250 ease-luxury`, et une hauteur d'interaction minimale de 44px (accessibilite tactile).

### 6.1 Variantes

1. **Primary Button (`.btn-primary`)**
   * **Couleur :** Fond Bordeaux (`burgundy-500` `#8A1538`), Texte Blanc (`#FFFFFF`).
   * **Hover :** Fond Bordeaux Sombre (`burgundy-600` `#7B1231`), Ombre `shadow-hafrose-hover`.
   * **Active :** `burgundy-800` (`#560E23`).
   * **Usage :** Action principale unique par ecran (ex: "Ajouter au Panier", "Valider la Commande").

2. **Secondary Button (`.btn-secondary`)**
   * **Couleur :** Fond Rose Poudre (`rose-powder` `#F8D7DA`), Texte Bordeaux Sombre (`burgundy-800` `#560E23`).
   * **Hover :** Fond Rose Soft (`rose-soft` `#EAA2B1`).
   * **Usage :** Actions secondaires (ex: "Voir le Guide des Tailles", "Previsualiser").

3. **Outline Button (`.btn-outline`)**
   * **Couleur :** Fond Transparent, Bordure 1px Bordeaux (`burgundy-500`), Texte Bordeaux.
   * **Hover :** Remplissage Bordeaux complet (`burgundy-500`), Texte Blanc.
   * **Usage :** Actions alternatives d'egal niveau (ex: "Découvrir la Collection", "Filtrer").

4. **Ghost Button (`.btn-ghost`)**
   * **Couleur :** Fond Transparent, Texte Charcoal (`neutral-800`).
   * **Hover :** Fond Rose Blush (`rose-blush` `#FDF2F4`), Texte Bordeaux.
   * **Usage :** Liens secondaires dans les barres d'outils ou pieds de cartes.

5. **Icon Button (`.btn-icon`)**
   * **Couleur :** Cercle transparent, icône Charcoal.
   * **Hover :** Cercle Rose Blush (`rose-blush`), Icône Bordeaux.
   * **Usage :** Boutons wishlist (coeur), fermeture (croix), panier (sac).

6. **Danger Button (`.btn-danger`)**
   * **Couleur :** Fond Rouge Error (`error-600` `#B91C1C`), Texte Blanc.
   * **Hover :** `error-700` (`#991B1B`).
   * **Usage :** Supprimer une adresse, annuler une commande.

### 6.2 Etats du Bouton

* **Focus :** Ring de 2px Bordeaux (`ring-2 ring-burgundy-500 ring-offset-2`).
* **Disabled :** Opacite 50%, curseur `not-allowed`, pas d'evenement hover (`pointer-events-none`).
* **Loading :** Remplacement ou ajout d'un spinner de chargement discret (`animate-spin`), clics desactives.

---

## 7. Cartes (Cards)

Toutes les cartes utilisent une bordure ultra-fine `border border-neutral-200/60`, un rayon de courbure `rounded-md` (6px), un fond Blanc Pur (`#FFFFFF`) et une ombre delicate `shadow-hafrose-card`.

### Types de Cartes Officiels

1. **Product Card (Carte Produit)**
   * **Aspect :** Image verticale 3:4 (ratio couture), badge d'etat (ex: "Nouveau", "Edition Limitee") en haut a gauche, bouton coeur wishlist flottant en haut a droite.
   * **Hover :** Zoom doux de l'image (`scale-105 duration-500 ease-luxury`), apparition progressive du bouton d'ajout rapide au panier.
   * **Padding contenu :** 16px (`p-4`).

2. **Category Card (Carte Categorie)**
   * **Aspect :** Grand visuel immersif avec masque degrade sombre en bas.
   * **Typographie :** Titre de categorie en `Playfair Display` Blanc Pur centré ou aligne en bas.
   * **Hover :** Eclaircissement du masque et legere translation de l'intitule vers le haut (`-translate-y-1`).

3. **Banner Card (Carte Banniere Promo / Story)**
   * **Aspect :** Fond Crème (`cream-200`), bordure Or fine, typographie serif elegante.

4. **Feature Card (Carte Avantage / Reassurance)**
   * **Aspect :** Icone fine 24px Or ou Bordeaux, titre H5, texte court 14px. Alignement centre.

5. **Testimonial Card (Carte Avis Client)**
   * **Aspect :** Etoiles en Or Champagne (`#D4AF37`), citation entre guillemets serifs, nom du client et badge "Achat Verifie".

---

## 8. Champs de Formulaire (Form Controls)

Tous les champs de formulaire partagent un style homogene, garantissant lisibilite et confort de saisie.

### Styles de Base (`.input-luxury`)
* **Hauteur :** 48px (`py-3 px-4`).
* **Bordure :** 1px Gris Neutre (`border-neutral-300`).
* **Fond :** Blanc Pur (`#FFFFFF`).
* **Rayon :** 4px (`rounded-sm`).
* **Typographie :** 16px (`text-body-base`), texte `#18181B`.
* **Placeholder :** `text-neutral-400`, style neutre et propre.

### Etats d'Interaction
* **Hover :** Bordure Neutre Foncee (`border-neutral-400`).
* **Focus :** Bordure Bordeaux (`border-burgundy-500`), Ring 1px Bordeaux (`ring-1 ring-burgundy-500`), ombre interne discrete.
* **Error (`.input-error`) :** Bordure Rouge Error (`border-error-500`), texte d'aide rouge sous le champ, icône d'avertissement.
* **Success :** Bordure Verte Success (`border-success-500`).
* **Disabled :** Fond Gris Neutre (`bg-neutral-100`), texte ambré, curseur non autorise.

---

## 9. Systematique des Icônes

* **Bibliotheque Officielle :** `lucide-react`.
* **Style & Epaisseur :** Lignes fines et elegantes (`strokeWidth={1.5}` ou `strokeWidth={1.25}`).
* **Tailles Standardisees :**
  * `sm` (16px) : Puces, sous-menus, aides contextuelles.
  * `md` (20px) : Icones de boutons, champs d'input.
  * `lg` (24px) : Icones de navigation principale (panier, recherche, compte, coeur).
  * `xl` (32px) : En-têtes de modules de reassurance, etats vides (empty states).
* **Couleur :** Par defaut `text-neutral-700`, au survol `text-burgundy-500` ou `text-gold-500`.

---

## 10. Animations & Transitions

Les animations HAFROSE doivent toujours transmettre la sensation de **legerete, de soie et de mouvement fluide**. Les animations rapides ou saccades sont proscrites.

| Animation | Timing / Durée | Easing (Courbe) | Usage |
|-----------|----------------|-----------------|-------|
| **Hover Element** | 250ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Survol boutons, liens, cartes |
| **Fade In** | 250ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Apparition de modales, popovers |
| **Slide Up** | 350ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Arrivee du contenu de page, toasts |
| **Slide Drawer** | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Ouverture du panier et du menu mobile |
| **Scale Image** | 500ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Zoom doux des photos produits |
| **Skeleton Shimmer** | 1.8s (Infinie) | Linear | Chargement des cartes et textes |

---

## 11. Grille Responsive & Breakpoints

| Breakpoint | Largeur Min | Nom Code | Container Max Width | Colonnes Grille Catalog | Marges Latérales |
|------------|-------------|----------|----------------------|-------------------------|------------------|
| **Mobile** | `0px` | `< sm` | 100% | 1 ou 2 colonnes | 16px (`px-4`) |
| **Tablet** | `640px` | `sm` | 640px | 2 colonnes | 24px (`px-6`) |
| **Laptop** | `768px` | `md` | 768px | 3 colonnes | 24px (`px-6`) |
| **Desktop** | `1024px` | `lg` | 1024px | 3 ou 4 colonnes | 32px (`px-8`) |
| **Large Desktop** | `1280px` | `xl` | 1280px | 4 colonnes | 32px (`px-8`) |
| **Ultra Wide** | `1536px` | `2xl` | 1440px (Max Centré) | 4 colonnes | Auto centré |

---

## 12. Règles d'Utilisation du Design System

### Directives Obligatoires pour les Développeurs Frontend

1. **Aucune valeur arbitraire dans les classes Tailwind :**
   * ❌ Interdit : `bg-[#8A1538]`, `p-[17px]`, `text-[13px]`, `shadow-[0_4px_20px_rgba(0,0,0,0.1)]`.
   * ✅ Obligatoire : `bg-burgundy-500`, `p-4`, `text-body-sm`, `shadow-hafrose-md`.

2. **Hierarchie des Boutons :**
   * Un seul bouton **Primary** par zone d'action principale.
   * Utiliser le bouton **Outline** ou **Secondary** pour les choix alternatifs.
   * Ne jamais juxtaposer deux boutons Primary côte à côte.

3. **Traitement des Images Produit :**
   * Toutes les photos de mannequins ou vetements doivent conserver le ratio vertical 3:4 (`aspect-[3/4]`) avec `object-cover`.
   * Toujours inclure un composant `LazyImage` avec fond de squelette creme pendant le chargement.

4. **Fond de Page Unique :**
   * Le fond de page par defaut est toujours `bg-cream-100` (`#FAF6F0`). Le blanc pur `#FFFFFF` est reserve aux cartes et conteneurs d'interaction.

---

*Charte Graphique & Design System Officiel HAFROSE — Valide pour toutes les phases de developpement frontend.*
