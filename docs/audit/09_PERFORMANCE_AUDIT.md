# 09 — Audit de Performance (Vitesse & Core Web Vitals)

Ce document évalue la performance technique du frontend Hafrose, en analysant la taille des ressources, l'optimisation des images, le découpage du code (code splitting) et l'impact des requêtes API sur la réactivité de l'application.

---

## 1. Découpage du Code (Code Splitting) & Chargement Asynchrone

- **Excellente implémentation initiale** : Toutes les pages clients et d'administration sont importées de manière asynchrone à l'aide de la fonction `lazy()` de React et configurées dans `src/routes/index.jsx`.
- **Bénéfice** : Vite génère des paquets de code (chunks) séparés pour chaque page. Lors du premier chargement du site, seul le code nécessaire à la page d'accueil est téléchargé, réduisant le temps de blocage de l'interactivité (Total Blocking Time - TBT).
- **Fallback visuel** : L'utilisation de `<Suspense fallback={<Loader fullPage />}>` dans `MainLayout` et `AdminLayout` garantit qu'un indicateur de chargement premium s'affiche pendant le chargement des fichiers js asynchrones.

---

## 2. Optimisation et Poids des Images (Largest Contentful Paint - LCP)

Les images constituent la ressource la plus lourde sur un site e-commerce de luxe.

### 2.1. L'image Hero principale (`hero.png`)
- **Problème** : Le fichier `public/images/hero.png` pèse **769 Ko**. C'est un poids excessif pour une image de couverture chargée dès la première seconde (LCP). De plus, elle est au format PNG, moins performant que les formats modernes.
- **Optimisation** : Sa conversion au format **WebP** ou **AVIF** avec une compression légère réduirait sa taille à moins de 150 Ko (gain de performance de plus de 80%).

### 2.2. Images externes issues d'Unsplash
- Les images de catégories (`PopularCategories.jsx`) et les images de secours utilisent des requêtes Unsplash avec des paramètres de redimensionnement (`fit=crop&w=600&q=80`).
- **Piste d'amélioration** : Réduire le paramètre de qualité de `q=80` à `q=75` ou `q=70` (la différence est invisible à l'œil nu sur des écrans Retina, mais réduit le poids de moitié) et adapter la largeur (`w=400`) pour les cartes affichées en petit format sur les grilles à 4 colonnes.

---

## 3. Optimisation des Rendus React (API Storms)

### 3.1. Problème de sur-rendu lié à la saisie de recherche (Shop Page)
- **Analyse** : Dans `Shop/index.jsx`, chaque lettre saisie dans la barre de recherche appelle instantanément `setSearchParams` qui réactualise l'URL. Par ricochet, le hook de récupération des produits est déclenché :
  ```javascript
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  ```
- **Impact technique** : Le composant `Shop` effectue un nouveau rendu complet et envoie une requête API asynchrone à chaque lettre tapée.
- **Solution** : Implémenter un état de saisie temporaire découplé, et utiliser une fonction de **debounce** (ex: 300ms) pour ne déclencher la mise à jour des paramètres d'URL et la requête API qu'une fois que l'utilisateur a fini d'écrire.

### 3.2. Mémoïsation des cartes
- Les composants `ProductCard.jsx` et `CategoryCard.jsx` sont enveloppés dans `React.memo()`. C'est une excellente pratique qui évite à React de recalculer le DOM de toutes les cartes de la grille lors d'un filtrage n'affectant pas leur contenu.
