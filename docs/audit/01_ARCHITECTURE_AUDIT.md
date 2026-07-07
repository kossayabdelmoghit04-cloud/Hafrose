# 01 — Audit de l'Architecture Frontend

## 1. Structure Générale du Projet
Le projet frontend est basé sur **React 19**, **Vite 8**, **React Router v7** et **Tailwind CSS v4**.

```
frontend/
├── dist/                          # Build de production
├── node_modules/                  # Dépendances NPM
├── public/                        # Assets statiques globaux
│   ├── images/
│   │   └── hero.png               # Image hero principale du client (769 Ko)
│   ├── favicon.svg
│   ├── icons.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/                           # Code source de l'application
│   ├── components/                # Composants partagés
│   │   ├── cards/                 # Cartes de présentation (CategoryCard, ProductCard)
│   │   ├── common/                # Composants transverses (Navbar, Footer, AdminProtectedRoute)
│   │   ├── sections/              # Sections de la page d'accueil (Hero, MaisonPresentation, etc.)
│   │   └── ui/                    # Éléments d'interface réutilisables (Button, Input, Badge, etc.)
│   ├── context/                   # Contextes React pour l'état global (AuthContext, CartContext)
│   ├── hooks/                     # Hooks personnalisés (useDocumentTitle)
│   ├── layouts/                   # Layouts de l'application (MainLayout, AdminLayout)
│   ├── pages/                     # Pages de l'application (Client & Admin)
│   │   ├── About/
│   │   ├── Admin/                 # Pages de l'espace administration
│   │   ├── Cart/
│   │   ├── Contact/
│   │   ├── Home/
│   │   ├── NotFound/
│   │   ├── OrderConfirmation/
│   │   ├── Product/
│   │   └── Shop/
│   ├── routes/                    # Configuration du routeur (index.jsx)
│   ├── services/                  # Clients et services API (api.js, productService.js, etc.)
│   ├── utils/                     # Utilitaires d'aide (format.js, imageHelper.js)
│   ├── App.jsx                    # Point d'entrée de l'application React
│   ├── index.css                  # Styles CSS globaux & configuration Tailwind v4
│   └── main.jsx                   # Point d'ancrage DOM
├── .gitignore
├── .oxlintrc.json                 # Linter rapide Oxlint
├── index.html
├── package.json
└── vite.config.js
```

---

## 2. Configuration du Routeur
Le routage est géré avec **React Router v7 (react-router-dom ^7.18.0)** à l'aide de l'API moderne `createBrowserRouter` dans `src/routes/index.jsx`.
- **Routage client** : Tous les chemins clients sont imbriqués sous `MainLayout` avec des imports asynchrones via `lazy()` et enveloppés dans un `Suspense` géré dans le layout avec le composant de chargement `Loader`.
- **Routage d'administration** :
  - `/admin/login` est autonome pour éviter d'embarquer les styles et la Navbar client.
  - `/admin` est enveloppé par le composant `AdminProtectedRoute` pour la restriction d'accès aux seuls comptes autorisés, puis imbriqué dans `AdminLayout`.

---

## 3. Organisation des Layouts
1. **MainLayout (`src/layouts/MainLayout.jsx`)** :
   - Configure un helper de scroll-to-top (`ScrollToTop`) lors des changements de page.
   - Rend la `Navbar` globale (qui comprend le tiroir de navigation mobile et le panier coulissant `CartDrawer`).
   - Structure le contenu via une balise `<main className="flex-grow">` qui utilise `<Suspense>` pour afficher le contenu enfant.
   - Rend le `Footer` global.
2. **AdminLayout (`src/layouts/AdminLayout.jsx`)** :
   - Structure l'espace d'administration avec une barre latérale (`aside`) desktop persistante et un menu mobile (`sidebarOpen` state).
   - Affiche les informations de l'administrateur connecté (`user`) avec un bouton de déconnexion.
   - Contient le point d'ancrage `<Outlet />` de l'administration sous `<Suspense>`.

---

## 4. Gestion d'État (State Management)
L'état de l'application est divisé en deux catégories :
1. **État Local/Global Applicatif** :
   - **CartContext (`src/context/CartContext.jsx`)** : Gère l'état du panier (ajout, suppression, mise à jour des quantités, stockage automatique dans le `localStorage` sous la clé `hafrose_cart`).
   - **AuthContext (`src/context/AuthContext.jsx`)** : Gère le jeton JWT de l'administrateur (`admin_token`), récupère les données de session `/admin/me`, et injecte automatiquement l'en-tête `Authorization: Bearer <token>` dans l'instance Axios.
2. **État Serveur (Server State)** :
   - Géré avec **React Query (`@tanstack/react-query ^5.101.2`)**. Le client de requêtes (`QueryClient`) est instancié dans `App.jsx` avec des configurations adaptées : `refetchOnWindowFocus: false` pour éviter les requêtes intempestives et `staleTime: 5 min` pour la mise en cache.

---

## 5. Couche de Services (API)
Toutes les requêtes HTTP passent par une instance centralisée d'**Axios** configurée dans `src/services/api.js`.
- **Base URL** : Gérée via `import.meta.env.VITE_API_URL` avec une valeur par défaut de `http://localhost:8000/api`.
- **Intercepteur de requêtes** : Ajoute automatiquement le token de sécurité JWT présent dans le stockage local.
- **Intercepteur de réponses** : Centralise la gestion des erreurs HTTP (400, 401, 403, 404, 422, 429, 500) et formate les retours pour n'extraire que les données utiles (`response.data`).

Services spécialisés :
- `categoryService.js` : Appels liés aux catégories.
- `productService.js` : Recherche, tri et détails des produits.
- `orderService.js` : Validation et création des commandes.
- `reviewService.js` : Ajout d'avis clients.
- `contactService.js` : Envoi des messages de contact.

---

## 6. Styles Globaux & Design System
Le projet tire pleinement parti de **Tailwind CSS v4** :
- Le fichier `src/index.css` importe Tailwind v4 via `@import "tailwindcss";`.
- Les variables de thème (polices, couleurs luxury-gold, luxury-cream, animations, transitions) sont déclarées directement dans la directive `@theme` de Tailwind v4.
- Suppression des fichiers CSS annexes obsolètes. La configuration des polices de caractères (`Playfair Display` et `Plus Jakarta Sans`) se fait via `@import url` Google Fonts.
