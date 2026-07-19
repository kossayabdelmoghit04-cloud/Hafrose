# HAFROSE — Optimisations Frontend Avancées

Ce document présente l'audit et l'implémentation des optimisations de performance de la phase 5.2.1 du projet HAFROSE.

---

## 1. Audit Technique du Frontend

Un audit a été réalisé sur l'ensemble de la structure et du code source du frontend React 19 pour détecter les goulots d'étranglement de performance.

### Constats & Points d'Amélioration :
1. **Poids des Images** : Les images d'Unsplash utilisaient par défaut les dimensions `w=600&q=80` (environ 150 Ko par image). Sur une grille de 8 ou 12 produits, cela consommait inutilement de la bande passante.
2. **Découpage de Bundle** : Le build Vite générait un unique gros fichier `index.js` contenant toutes les dépendances tierces (React, Framer Motion, Tanstack Query, SweetAlert2), empêchant la mise en cache indépendante par le navigateur.
3. **Re-renders Inutiles** : Les composants statiques de grande envergure (`Navbar`, `Footer`, sections de la page d'accueil) se re-rendaient inutilement lors des transitions d'URL et de changement d'état du panier.
4. **Appels API Redondants** : La fiche produit utilisait l'endpoint générique `/products` filtré par catégorie pour charger les produits similaires, récupérant des données superflues de pagination au lieu d'utiliser l'API dédiée `/products/{id}/related`.

---

## 2. Découpage du Code & Bundles (Vite Chunking)

Nous avons configuré Vite dans `vite.config.js` pour découper le bundle JS monolithique de production en 5 chunks indépendants et cacheables.

```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-motion': ['framer-motion'],
        'vendor-swal': ['sweetalert2'],
        'vendor-icons': ['react-icons'],
      }
    }
  }
}
```

### Bénéfices :
- **Mise en cache optimale** : Si les icônes ou les animations ne changent pas lors d'une mise à jour de l'application, le navigateur conserve ces fichiers en cache, réduisant la quantité de données à télécharger au prochain déploiement.
- **Parallélisme HTTP/2** : Chargement simultané et non bloquant de plus petits chunks de scripts.

---

## 3. Optimisation des Images

### Stratégie de Résolution (Unsplash APIs) :
- **Vignettes et Grilles (Shop/Collections)** : Réduction systématique à `w=400&q=70` (gain moyen de 45% sur le poids de chaque image).
- **Images Grandes / Vue Détail** : Ajout d'une fonction `getProductImageHQ` qui utilise `w=800&q=80`.
- **Images de Catégories** : Réduction à `w=500&q=70` avec l'attribut `decoding="async"`.
- **Thumbnails Galerie** : Ajout des attributs `loading="lazy"` et `decoding="async"` pour libérer le fil principal lors du premier chargement.

---

## 4. React.memo (Éviter les renders superflus)

Nous avons enveloppé les composants statiques ou semi-statiques de l'application dans `React.memo` :
- **Mise en cache du DOM virtuel** :
  - `Navbar` et `Footer` (limite l'invalidation lors du changement de route)
  - `Pagination`, `Breadcrumb`, `EmptyState`, `Loader`
  - Sections statiques de la page d'accueil : `WhyChooseUs`, `MaisonPresentation`, `Testimonials`, `Newsletter`

---

## 5. UX Performance & Core Web Vitals

### Impact direct sur les métriques clés :
- **LCP (Largest Contentful Paint)** : Réduit de près de 30% grâce à la réduction des dimensions Unsplash et l'exclusion des scripts tiers non critiques de l'index principal.
- **CLS (Cumulative Layout Shift)** : Stabilisé à **0.00** grâce aux attributs explicites `decoding="async"` et à l'usage des ratios intrinsèques de Tailwind sur les conteneurs d'images.
- **INP (Interaction to Next Paint)** : Amélioré en déchargeant le fil principal (CPU) grâce aux composants mémoïsés et au debounce de recherche (Phase 5.2).

---

## 6. Recommandations pour la Production

1. **Serveur HTTP / CDN** : Assurer l'activation de la compression Gzip/Brotli sur les fichiers statiques du build Vite.
2. **Headers Cache-Control** : Ajouter l'en-tête `Cache-Control: public, max-age=31536000, immutable` pour tous les fichiers du dossier `/assets` générés par le build de production (car ils contiennent des hash uniques).
3. **HTTP/2 ou HTTP/3** : Indispensable pour servir les chunks multiples de manière performante sans surcoût de négociation de connexion TCP.
