# HAFROSE — CONTRAT TECHNIQUE ET SPÉCIFICATION D'IMPLÉMENTATION (PHASE 1)

**Version** : 1.0  
**Statut** : Spécification d'exécution officielle  
**Phase** : Phase 1 — Fondations du Design System (UI Foundation)  
**Cible** : Développeur Frontend Senior / Tech Lead  
**Objectif** : Mettre en œuvre le socle visuel (tokens, typographie, thèmes, boutons, Navbar et Footer) sans perturber l'expérience utilisateur globale, les routes, ni la logique métier.

---

## 1. Périmètre de la Phase 1

Cette phase se concentre exclusivement sur le socle visuel de l'application et les composants transverses globaux. Elle prépare le terrain pour la refonte des pages métier lors des phases suivantes.

### ✔ Composants et fichiers modifiés
- **`src/index.css`** :
  - Déclaration et chargement des polices de caractères (`Cormorant Garamond` et `Playfair Display`).
  - Déclaration des variables de thème CSS dans le bloc `@theme` de Tailwind v4.
  - Implémentation des animations globales (`pulse-subtle` et `fade-in-up`).
  - Alignement des styles de la barre de défilement globale (scrollbar) aux teintes de la Maison.
- **`src/components/ui/Button.jsx`** : Alignement des boutons aux nouveaux jetons rose gold/warm gold, sans modifier l'interface d'appel (les props).
- **`src/components/common/Navbar.jsx`** : Alignement des couleurs d'accentuation, de la barre active et du panier d'achat coulissant droit.
- **`src/components/common/Footer.jsx`** : Alignement des teintes et remplacement de l'alerte d'inscription à la newsletter par un message HTML fluide sous le formulaire.

### ✖ Éléments NON modifiés (Strictement interdits à la modification)
- **Sections de la page d'accueil** : `Hero.jsx`, `MaisonPresentation.jsx`, `PopularCategories.jsx`, `FeaturedProducts.jsx`, `WhyChooseUs.jsx`, `Testimonials.jsx`, `Newsletter.jsx`.
- **Pages de l'application** : `Shop/index.jsx`, `Product/index.jsx`, `Cart/index.jsx`, `Contact/index.jsx`, `About/index.jsx`, `NotFound/index.jsx`, `OrderConfirmation/index.jsx`.
- **Espace Administration** : `AdminDashboard.jsx`, `AdminProducts.jsx`, `AdminCategories.jsx`, etc.
- **Contextes et Services** : `CartContext.jsx`, `AuthContext.jsx`, `api.js`, `productService.js`, etc. (Aucune modification de la logique métier, du panier ou de la session n'est autorisée).

---

## 2. Graphe des Dépendances d'Implémentation

L'ordre d'implémentation est dicté par la cascade CSS et l'architecture des composants. Les éléments de base doivent être intégrés en premier pour alimenter les composants complexes :

```
Étape 1 : Polices (Google Fonts)
      │
      ▼
Étape 2 & 3 : Design Tokens & Thème CSS (@theme)
      │
      ▼
Étape 4 : Animations & Keyframes CSS
      │
      ▼
Étape 5 : Primitive UI (Button.jsx)
      │
      ▼
Étape 6 : Navigation Commune (Navbar.jsx)
      │
      ▼
Étape 7 : Pied de Page Commun (Footer.jsx)
      │
      ▼
Étape 8 : Validation Technique Finale
```

### Pourquoi cet ordre est obligatoire :
1. **Les Polices (1)** définissent les familles typographiques exploitées par le thème.
2. **Les Tokens et le Thème CSS (2 & 3)** déclarent les variables de couleurs et de polices Tailwind v4 lues par tous les composants.
3. **Les Animations (4)** s'appuient sur ces variables pour s'exécuter.
4. **Le Composant Button (5)** utilise le thème et les typographies, et sert de composant enfant à la Navbar et au Footer.
5. **La Navbar (6)** et le **Footer (7)** intègrent des boutons et consomment les variables de couleur, et doivent donc être modifiés en dernier.

---

## 3. Fiches de Découpage des Étapes

---

### Étape 1 : Chargement et Configuration des Polices (Fonts)
- **Description** : Importer la nouvelle police premium `Cormorant Garamond` et la police historique `Playfair Display` depuis Google Fonts pour les rendre disponibles pour l'ensemble du projet.
- **Fichiers concernés** :
  - `src/index.css`
- **Dépendances** : Aucune.
- **Risques** : Problème de chargement réseau, ralentissement du rendu initial (FOUC - Flash of Unstyled Text) si les polices ne sont pas importées en mode asynchrone / display=swap.
- **Régressions possibles** : Affichage de polices par défaut du navigateur (Times New Roman / Arial) si l'importation échoue.
- **Tests manuels** : Ouvrir l'inspecteur du navigateur, onglet Réseau (Network) et vérifier le statut 200 de la requête vers `fonts.googleapis.com`.
- **Tests automatiques** : `npm run build` (validation du packaging Vite).
- **Validation** : Les règles CSS `font-family` lisent correctement les deux familles et le texte de l'application s'affiche sans cassure.

---

### Étape 2 : Migration des Design Tokens
- **Description** : Déclarer les nouveaux jetons de couleurs (rose, rose gold, blush, beige, warm) dans le thème global Tailwind v4.
- **Fichiers concernés** :
  - `src/index.css` (bloc `@theme`)
- **Dépendances** : Étape 1.
- **Risques** : Remplacement immédiat d'une ancienne couleur provoquant la disparition visuelle d'autres zones du site.
- **Régressions possibles** : Écran avec textes invisibles (noir sur noir) ou bordures absentes.
- **Tests manuels** : Vérifier que toutes les nuances s'appliquent correctement en associant temporairement les variables à des blocs de démonstration.
- **Validation** : Toutes les variables de couleur du Blueprint sont présentes dans le CSS de base.

---

### Étape 3 : Compatibilité et Variables CSS
- **Description** : Garantir la compatibilité ascendante en faisant pointer l'ancienne variable `--color-luxury-gold` vers la valeur Rose Gold (`#B5828C`). Cela permet d'obtenir un rendu rose gold instantané sans casser les pages non encore transformées.
- **Fichiers concernés** :
  - `src/index.css`
- **Dépendances** : Étape 2.
- **Risques** : Mauvaise affectation de variables créant un or jaune dégradé.
- **Régressions possibles** : Cassure graphique générale.
- **Tests manuels** : Naviguer sur la boutique et vérifier que le jaune or a été remplacé par le rose gold sur les prix, sans avoir édité `Shop/index.jsx`.
- **Validation** : Le jaune or `#D4AF37` est absent des déclarations et a été remplacé par la palette rose gold.

---

### Étape 4 : Animations Globales
- **Description** : Implémenter les animations globales et micro-interactions système (transitions d'opacités, pulsation du Hero, etc.) sous forme de règles CSS réutilisables.
- **Fichiers concernés** :
  - `src/index.css`
- **Dépendances** : Étape 3.
- **Risques** : Consommation CPU excessive due à des animations mal optimisées.
- **Régressions possibles** : Saccades lors du défilement ou du survol.
- **Tests manuels** : Vérifier le fonctionnement de la pulsation sur le Hero.
- **Validation** : L'animation `pulse-subtle` est déclarée et active.

---

### Étape 5 : Refonte du Composant Button
- **Description** : Mettre à jour `Button.jsx` pour intégrer les variantes de couleur Rose Gold, Blush et Warm Gold tout en conservant son interface (props `variant`, `size`, `onClick`, `isLoading`).
- **Fichiers concernés** :
  - `src/components/ui/Button.jsx`
- **Dépendances** : Étape 4.
- **Risques** : Signature de fonction modifiée brisant les boutons des pages de paiement ou d'admin.
- **Régressions possibles** : Boutons inactifs ou texte invisible à l'intérieur.
- **Tests manuels** : Cliquer sur tous les types de boutons et valider leur comportement au survol (hover) et clic (tap).
- **Validation** : Bouton conforme aux spécifications graphiques du Blueprint, sans modification fonctionnelle.

---

### Étape 6 : Alignement de la Navbar
- **Description** : Ajuster les couleurs, bordures et indicateurs du composant `Navbar.jsx` selon la palette Rose Gold / Blanc Cassé / Beige.
- **Fichiers concernés** :
  - `src/components/common/Navbar.jsx`
- **Dépendances** : Étape 5.
- **Risques** : Perte de navigabilité, menu mobile bloqué.
- **Régressions possibles** : Chevauchement de liens, pastille de quantité de panier invisible.
- **Tests manuels** : Ouvrir/fermer le panier coulissant, incrémenter/décrémenter un article, tester la réactivité au scroll.
- **Validation** : Navbar alignée à 100% sur la charte Rose Gold, sans modification de la logique de CartContext.

---

### Étape 7 : Alignement du Footer et Newsletter
- **Description** : Ajuster les couleurs du Footer et supprimer la fonction d'alerte native `alert()` de la newsletter pour la remplacer par un message textuel propre injecté sous l'input.
- **Fichiers concernés** :
  - `src/components/common/Footer.jsx`
- **Dépendances** : Étape 6.
- **Risques** : Message d'erreur non visible ou cassant la mise en page du bas de page.
- **Régressions possibles** : Formulaire d'inscription qui n'envoie plus la requête ou ne bloque pas la soumission.
- **Tests manuels** : Taper une adresse e-mail invalide, soumettre, et vérifier l'apparition du message sans pop-up système.
- **Validation** : Footer et newsletter conformes au Blueprint.

---

### Étape 8 : Validation Technique et Tests de Non-Régression
- **Description** : Exécution globale des contrôles de build, de linter et de tests unitaires/fonctionnels du backend pour valider la Phase 1.
- **Fichiers concernés** : Aucun.
- **Dépendances** : Étape 7.
- **Validation** : Réussite absolue du build et validation à 100% des tests unitaires backend.

---

## 4. Fichiers Concernés et Statut

| Fichier | Type de fichier | Action | Priorité | Risque associé | Rôle dans la Phase 1 |
|---|---|---|---|---|---|
| `frontend/src/index.css` | Styles CSS | `MODIFY` | 🔴 Critique | Faible | Déclaration des polices, thèmes, scrollbars et animations. |
| `frontend/src/components/ui/Button.jsx` | Composant React | `MODIFY` | 🔴 Critique | Faible | Alignement des primitives de boutons. |
| `frontend/src/components/common/Navbar.jsx` | Composant React | `MODIFY` | 🔴 Critique | Moyen | Alignement visuel de l'en-tête et du mini-panier. |
| `frontend/src/components/common/Footer.jsx` | Composant React | `MODIFY` | 🔴 Critique | Faible | Alignement du pied de page et refonte alerte newsletter. |

---

## 5. Fichiers Interdits de Modification (Strictly Forbidden)

Pour éviter toute régression ou modification hors-périmètre durant cette phase de fondation, il est **strictement interdit** de modifier les fichiers suivants :

1. **Toutes les Pages clients (`src/pages/*`)** : Ex: `Shop/index.jsx`, `Product/index.jsx`, `Cart/index.jsx`.
   - *Justification* : Modifier ces pages pendant la phase de fondation créerait des régressions fonctionnelles sur la recherche, les avis ou la création de commandes. Leur couleur sera mise à jour automatiquement par cascade CSS via l'alias Rose Gold configuré sur `--color-luxury-gold`.
2. **Tous les Contextes de données (`src/context/*`)** : `CartContext.jsx`, `AuthContext.jsx`.
   - *Justification* : Gèrent l'état critique de la session admin et du panier. Zéro modification graphique ne justifie d'éditer la logique de ces contextes.
3. **Tous les Services d'API (`src/services/*`)** : `api.js`, `productService.js`.
   - *Justification* : Gèrent les requêtes vers le backend Laravel. Y toucher risquerait de couper la communication client-serveur.
4. **La structure de l'Espace Administration (`src/pages/Admin/*`)** :
   - *Justification* : L'administration sera refondue visuellement lors d'une étape dédiée ultérieure pour ne pas mélanger les périmètres.

---

## 6. Plan de Validation et Quality Gates

Chaque étape doit valider des verrous de qualité stricts avant de permettre le passage à l'étape suivante.

### Critères de Qualité (Quality Gates) à chaque étape :
1. **Compilation** : Exécuter `npm run build` et vérifier qu'aucun warning d'importation ou de syntaxe CSS n'est émis.
2. **Linter** : Exécuter `npm run lint` pour s'assurer de l'absence d'erreurs de formatage ou de variables inutilisées.
3. **Tests Backend** : Exécuter `php artisan test` sur le backend pour garantir que nos actions sur le front n'ont pas altéré les attentes de l'API (49/49 tests passés).
4. **Responsive** : Redimensionner l'écran du navigateur pour s'assurer que le menu hamburger mobile et le panier s'ouvrent correctement et qu'aucune barre de défilement horizontal parasite n'apparaît.
5. **Ergonomie** : Vérifier que les états `:focus-visible`, `:hover` et `:disabled` sont bien gérés visuellement.

---

## 7. Plan de Rollback (Retour en arrière)

En cas d'échec critique lors d'une étape (erreur de compilation insoluble, bug de rendu global), appliquer la stratégie suivante :

- **Méthode** : Git Checkout.
- **Commande** :
  ```bash
  git checkout -- <chemin_du_fichier_en_erreur>
  ```
- **Restauration de secours** : Si l'ensemble de la Phase 1 présente une instabilité, restaurer l'état d'origine du dépôt local à partir du dernier commit stable :
  ```bash
  git reset --hard HEAD
  ```
- **Critère d'arrêt** : Si un bug bloque l'interactivité du panier pendant plus de 15 minutes sans solution évidente, effectuer immédiatement un rollback et analyser le problème dans un environnement isolé (scratch file).

---

## 8. Git Strategy (Séquence des Commits)

Pour garantir la traçabilité et la réversibilité de chaque action, l'implémentation suivra la séquence de commits atomiques suivante :

1. **Commit 1 (Fonts)** :
   `feat(design-system): import premium fonts in index.css`
2. **Commit 2 (Tokens)** :
   `feat(design-system): declare luxury rose-gold tokens in Tailwind theme`
3. **Commit 3 (CSS Clean & Alias)** :
   `style(design-system): replace gold variables with rose-gold alias in index.css`
4. **Commit 4 (Button)** :
   `feat(components): update Button styles with new theme colors`
5. **Commit 5 (Navbar)** :
   `feat(components): align Navbar active states and drawer with theme`
6. **Commit 6 (Footer)** :
   `feat(components): update Footer colors and clean newsletter alert`
7. **Commit 7 (Validation)** :
   `test(validation): final validation of Phase 1 build and test suite`
