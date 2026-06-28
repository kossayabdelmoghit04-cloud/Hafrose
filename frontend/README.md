# Hafrose — E-Commerce Frontend Élite

Ce répertoire contient l'application cliente React de la **Maison Hafrose**, une vitrine e-commerce haut de gamme spécialisée dans la vente d'accessoires de mode, maroquinerie de luxe, joaillerie et horlogerie d'exception.

---

## 💎 Technologies & Frameworks

L'application est bâtie sur une architecture moderne de production intégrant :
*   **React 19** : Gestion réactive de l'interface et du cycle de vie.
*   **Vite 8** : Environnement de build ultra-rapide avec Rolldown.
*   **Tailwind CSS v4** : Styling moderne reposant sur les variables CSS natales et le moteur de thème `@theme`.
*   **React Router DOM v7** : Routage applicatif client.
*   **Framer Motion** : Animations fluides et transitions d'état immersives.
*   **Axios** : Requêtes REST avec intercepteurs pour la gestion globale des erreurs API.
*   **SweetAlert2** : Modaux d'information et alertes utilisateur élégantes.
*   **Oxlint** : Linter haute performance garantissant la qualité du code.

---

## 📂 Structure du Projet

L'architecture suit strictement une séparation par domaines de responsabilité :

```text
src/
├── assets/          # Logos et ressources visuelles
├── components/      # Composants partagés
│   ├── cards/       # Cartes de présentation (ProductCard, CategoryCard)
│   ├── common/      # Composants structurels globaux (Navbar, Footer)
│   ├── ui/          # Primitives graphiques réutilisables (Button, Input, Badge, Loader...)
│   └── sections/    # Blocs éditoriaux de la page d'accueil (Hero, presentation...)
├── context/         # Contexts d'états partagés (CartContext)
├── hooks/           # Custom Hooks (useDocumentTitle pour le SEO dynamique)
├── layouts/         # Layouts de page généraux (MainLayout)
├── pages/           # Pages de premier niveau chargées en lazy-loading
│   ├── About/       # Histoire & héritage
│   ├── Cart/        # Panier & Checkout unifié
│   ├── Contact/     # Formulaire et boutique physique
│   ├── Home/        # Page d'accueil éditoriale
│   ├── NotFound/    # Fallback 404
│   ├── OrderConfirmation/ # Succès d'achat
│   ├── Product/     # Fiche détaillée & zoom
│   └── Shop/        # Galerie marchande & filtres complexes
├── routes/          # Configuration du routeur et code-splitting
├── services/        # Clients d'API REST (orderService, productService...)
└── utils/           # Fonctions utilitaires (formatage de prix, images fallbacks)
```

---

## 🚀 Installation & Lancement local

### Prérequis
*   Node.js (v18.0.0 ou supérieur recommandé)
*   NPM ou Yarn

### Instructions
1.  Installez les dépendances du projet :
    ```bash
    npm install
    ```
2.  Configurez le fichier d'environnement (voir section suivante).
3.  Lancez le serveur de développement local :
    ```bash
    npm run dev
    ```
4.  L'application est accessible à l'adresse : `http://localhost:5173`.

---

## ⚙️ Variables d'Environnement

Créez un fichier `.env` à la racine du dossier `frontend` :

```env
# URL de base pour communiquer avec l'API Laravel
VITE_API_URL=http://localhost:8000/api
```

---

## ⚡ Optimisations & Performance de Production

1.  **Code Splitting (React.lazy / Suspense)** :
    Toutes les pages de premier niveau sont importées dynamiquement. Le bundle initial est ainsi divisé en petits morceaux de code (chunks), réduisant le fichier JS principal sous la limite de **450 Ko** et éliminant tout blocage du rendu.
2.  **Mémoïsation (`React.memo`)** :
    Les cartes de présentation récurrentes (`ProductCard` et `CategoryCard`) sont mémoïsées pour empêcher des re-rendus superflus lors du filtrage ou de la recherche de produits.
3.  **Largest Contentful Paint (LCP) Optimisé** :
    L'image principale du pli de l'accueil (`Hero.jsx`) utilise l'attribut `fetchpriority="high"` pour charger instantanément la ressource critique de fond.
4.  **Cumulative Layout Shift (CLS) prévenu** :
    Toutes les grilles d'images utilisent des proportions fixes (`aspect-[3/4]` ou `aspect-[4/5]`) pour figer l'espace avant le chargement des visuels.

---

## 🔍 Référencement (SEO) & Accessibilité

*   **robots.txt & sitemap.xml** : Configurés pour une indexation complète de l'arborescence par Googlebot.
*   **Custom Hook `useDocumentTitle`** : Met à jour dynamiquement la balise de titre `<title>` de l'onglet et la meta-description sur les changements de route.
*   **Accessibilité (WCAG)** :
    *   Attributs `aria-label` ajoutés aux boutons d'actions iconographiques.
    *   Boutons d'ajustement de stock verrouillés selon l'inventaire.
    *   Navigation au clavier et focus-visible dorés.

---

## 📦 Build & Déploiement

### Compiler le projet pour la production :
```bash
npm run build
```
Cette commande génère un répertoire `dist/` optimisé et minifié.

### Guide de Déploiement :
1.  **Hébergement Statique (Frontend)** : Le dossier `dist/` peut être hébergé sur des plateformes comme Vercel, Netlify, ou un serveur Apache/Nginx.
2.  **Redirections Single Page Application (SPA)** :
    *   *Nginx* : Configurez `try_files $uri $uri/ /index.html;` dans votre bloc serveur pour éviter les erreurs 404 lors des rafraîchissements de page.
    *   *Apache (.htaccess)* : Ajoutez une règle de réécriture renvoyant toutes les requêtes vers `index.html`.
3.  **CORS (Backend)** : Assurez-vous que le domaine de production de votre frontend est bien déclaré dans les variables d'environnement de votre backend Laravel (dans `config/cors.php`).
