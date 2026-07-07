# 13 — Analyse des Risques et Impact Technique

Ce document énumère les zones sensibles du code frontend de Hafrose, évalue les risques associés à la transformation esthétique (Phase 7) et propose des mesures de prévention pour éviter les régressions fonctionnelles.

---

## 1. Cartographie des Fichiers et Composants Critiques

| Composant / Fichier | Niveau de Sensibilité | Impact en cas de dysfonctionnement |
|---|---|---|
| `src/context/CartContext.jsx` | 🔴 TRÈS ÉLEVÉ | Impossible d'ajouter/supprimer des créations au panier, de persister les achats locaux, ou d'accéder au checkout. Blocage complet des ventes. |
| `src/context/AuthContext.jsx` | 🔴 TRÈS ÉLEVÉ | Perte des sessions d'administration. Impossible d'accéder à la console d'administration (`/admin/*`) ou de se déconnecter. |
| `src/services/api.js` | 🔴 TRÈS ÉLEVÉ | Rupture complète de la liaison HTTP avec le serveur Laravel. Toutes les requêtes (produits, catégories, avis, commandes) échouent. |
| `src/components/common/Navbar.jsx`| 🟠 ÉLEVÉ | Perte de la navigation sur mobile et ordinateur, dysfonctionnement visuel ou fonctionnel du mini-panier. |
| `src/index.css` | 🟠 ÉLEVÉ | Rupture générale du style graphique du site (couleurs, polices, espacements). Erreur potentielle de compilation de Vite avec Tailwind v4. |
| `src/routes/index.jsx` | 🟠 ÉLEVÉ | Dysfonctionnement complet de la navigation inter-pages (Erreurs 404 ou écrans blancs). |

---

## 2. Analyse des Risques Spécifiques à la Phase 7 (Luxury Transformation)

### 2.1. Risque 1 : Erreur de compilation lors de la migration Tailwind v4
- **Contexte** : Tailwind CSS v4 utilise un compilateur CSS-first performant. Les variables de thèmes sont injectées dans la directive `@theme` et lues sous forme de classes utilitaires (ex: `bg-luxury-gold` lié à `--color-luxury-gold`).
- **Risque** : Si nous renommons directement les tokens (ex: supprimer `--color-luxury-gold` pour le remplacer par `--color-luxury-rose-gold` sans mettre à jour simultanément toutes les classes du projet), le compilateur Vite échouera ou de nombreux éléments s'afficheront sans couleur (fonds transparents).
- **Mesure de prévention** : Pendant la transition, conserver des alias temporaires ou migrer méticuleusement composant par composant, en s'assurant qu'aucun fichier ne conserve de référence à l'ancien token supprimé.

### 2.2. Risque 2 : Perte de réactivité (Lag) sur la barre de recherche du catalogue
- **Contexte** : La mise en place d'un système de *debounce* (délai de temporisation) sur l'input de recherche de la boutique est requise pour réduire la surcharge serveur.
- **Risque** : Si la liaison bidirectionnelle (controlled input) entre l'état local du champ de saisie et les paramètres d'URL de React Router n'est pas proprement isolée, le curseur de saisie peut se bloquer, perdre le focus, ou faire sursauter le texte saisi par l'utilisateur.
- **Mesure de prévention** : Découpler la valeur affichée dans le champ (`inputValue` locale) de la valeur recherchée réelle (`searchVal` dans l'URL), et n'actualiser cette dernière qu'à travers le debounce.

### 2.3. Risque 3 : Dysfonctionnement tactile des grilles produits sur Mobile
- **Contexte** : L'aperçu rapide s'active actuellement au survol (`group-hover`). Sur écran tactile, cela se traduit par un premier tap requis pour "simuler le survol", puis un second tap pour ouvrir le lien.
- **Risque** : Résoudre ce problème en modifiant les styles ou le comportement de navigation peut altérer le bon fonctionnement des clics sur ordinateur ou sur tablette.
- **Mesure de prévention** : Désactiver ou adapter l'overlay de survol pour les écrans tactiles via la directive média Tailwind `@media(hover: hover)` pour cibler uniquement les souris.
