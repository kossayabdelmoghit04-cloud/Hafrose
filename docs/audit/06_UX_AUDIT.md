# 06 — Audit UX (Expérience Utilisateur)

Ce document analyse l'ergonomie, la fluidité des parcours, le tunnel de commande et les points de friction de l'application Hafrose pour les clients.

---

## 1. Parcours de Navigation & En-tête

### 1.1. Liens brisés dans la Navbar (Friction Majeure)
- **Icône de Recherche** : L'icône loupe dans la Navbar est un composant `<button>` statique. Cliquer dessus ne déclenche aucune action (pas de barre de recherche surgissante, pas d'ouverture de volet).
- **Icône de Favoris (Wishlist)** : L'icône cœur pointe vers un lien mort `to="#"`. L'utilisateur s'attend à voir ses articles favoris ou une notification signalant l'absence de favoris.

### 1.2. Cart Drawer (Panier coulissant)
- **Comportement d'ouverture** : L'ouverture du tiroir de panier se fait par glissement depuis la droite. Cependant, l'arrière-plan (`backdrop`) noir transparent ne dispose d'aucune transition de fondu à la fermeture, ce qui crée une coupure abrupte.
- **Retour à la boutique** : Si le panier est vide, le bouton "Continuer mes achats" ferme le tiroir, ce qui est une bonne pratique.

---

## 2. Expérience de Recherche et de Filtrage (La Boutique)

### 2.1. Absence de Debounce sur la recherche (Surcharge API)
Dans `Shop/index.jsx`, l'événement de saisie sur la barre de recherche met à jour instantanément les paramètres d'URL à chaque caractère tapé :
```javascript
onChange={(e) => updateParam('search', e.target.value)}
```
Cette modification des paramètres d'URL déclenche immédiatement le hook `useEffect` qui appelle `productService.getAll`.
- **Friction UX** : Si l'utilisateur saisit rapidement "sac à main", 10 requêtes HTTP successives sont envoyées au serveur Laravel. Cela provoque des micro-saccades de rafraîchissement d'interface et peut déclencher la restriction de requêtes du serveur (Error 429 Too Many Requests). L'implémentation d'un délai d'attente (debounce de 300ms) est indispensable.

### 2.2. Ergonomie des filtres sur Mobile
- La barre de défilement des catégories est horizontale et masque les catégories situées en fin de liste (ex: "Ceintures" et "Portefeuilles"). L'utilisateur doit deviner qu'il faut faire glisser la barre horizontalement.
- Les pastilles de couleurs pour les filtres avancés sont très petites (6px sur 6px dans un bouton de 24px) et difficiles à cibler avec précision au doigt sur un écran de smartphone (non-respect des critères de taille de cible tactile de 44x44px d'Apple/Google).

---

## 3. Tunnel d'Achat (Checkout)

### 3.1. Panier persistant
- Le panier est synchronisé avec le `localStorage`. Si un utilisateur quitte le site et revient plus tard, ses articles sont préservés, ce qui élimine une friction d'achat.

### 3.2. Formulaire de commande à étape unique
- Le formulaire d'adresse est réuni sur la même page que le récapitulatif des articles du panier, réduisant le nombre de clics nécessaires.
- **Friction de validation** : Les erreurs de validation du formulaire de livraison ne renvoient pas l'utilisateur automatiquement vers le premier champ en erreur, ce qui l'oblige à faire défiler manuellement la page vers le haut pour identifier le champ invalide sur mobile.

---

## 4. Expérience Mobile Générale

- Les tiroirs de navigation mobile et de panier coulissent de manière fluide grâce aux transitions spring de Framer Motion.
- Les grilles de produits basculent proprement de 4 colonnes (desktop) à 2 colonnes (tablette) puis 1 colonne (mobile).
- **Problème UX de l'aperçu rapide** : Sur mobile, l'overlay "Aperçu rapide" s'active au survol (`group-hover:opacity-100`). Comme le survol n'existe pas sur écran tactile, le premier clic sur l'image d'un produit affiche brièvement l'overlay sans ouvrir directement la page produit, obligeant l'utilisateur à cliquer une seconde fois pour accéder à la fiche produit. C'est une friction majeure de navigation mobile.
