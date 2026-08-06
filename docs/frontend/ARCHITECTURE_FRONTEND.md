# HAFROSE — Architecture Frontend Officielle
## Phase 1 Foundation Document

> **Statut :** Definitif — Toutes les phases suivantes s'appuient sur cette fondation.
> **Stack :** React 19 + TypeScript + Vite + Tailwind CSS + Zustand + TanStack Query + Axios + React Router v7

---

## 1. Arborescence Complete du Dossier `src`

```
frontend/
├── index.html                    # SPA entrypoint - SEO meta, fonts
├── vite.config.ts                # Build + alias configuration
├── tsconfig.json                 # Strict TypeScript config + path aliases
├── tailwind.config.ts            # Design tokens HAFROSE
├── postcss.config.js             # Tailwind CSS pipeline
├── .env.example                  # Template variables d'environnement
│
└── src/
    ├── main.tsx                  # React 19 root mount - StrictMode
    ├── vite-env.d.ts             # Type VITE_* env vars
    │
    ├── app/
    │   ├── App.tsx               # Composant root (AppProvider + AppRouter)
    │   └── index.ts
    │
    ├── assets/
    │   ├── images/
    │   ├── fonts/
    │   └── icons/
    │
    ├── components/               # Bibliotheque de composants partages
    │   ├── ui/                   # Primitives visuelles pures
    │   ├── common/               # Communs cross-feature
    │   ├── forms/                # Elements de formulaire
    │   ├── feedback/             # Notifications (Toast, Modal, Drawer)
    │   ├── navigation/           # Navbar, Footer, SearchBar, Sidebar
    │   ├── layout/               # Container, Grid, Section
    │   └── index.ts
    │
    ├── constants/
    │   ├── api.constants.ts      # BASE_URL + tous les endpoints
    │   ├── routes.constants.ts   # Routes frontend SPA
    │   ├── storage.constants.ts  # Cles localStorage
    │   └── index.ts
    │
    ├── features/                 # Modules metier independants
    │   ├── auth/
    │   │   ├── components/
    │   │   ├── hooks/            # useLogin, useRegister, useLogout
    │   │   ├── pages/
    │   │   └── index.ts
    │   ├── catalog/
    │   │   ├── components/
    │   │   ├── hooks/            # useProducts, useProductDetail, useCategories
    │   │   ├── pages/
    │   │   └── index.ts
    │   ├── cart/
    │   │   ├── components/
    │   │   ├── hooks/            # useCart
    │   │   └── index.ts
    │   ├── wishlist/
    │   │   ├── components/
    │   │   ├── hooks/            # useWishlist, useToggleWishlist
    │   │   └── index.ts
    │   ├── orders/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── index.ts
    │   ├── checkout/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── index.ts
    │   ├── account/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── index.ts
    │   └── admin/
    │       ├── components/
    │       ├── hooks/
    │       └── index.ts
    │
    ├── hooks/                    # Hooks partages cross-feature
    │   ├── useApiMutation.ts
    │   ├── useSession.ts
    │   ├── useUtilities.ts
    │   └── index.ts
    │
    ├── layouts/
    │   ├── PublicLayout.tsx
    │   ├── AccountLayout.tsx
    │   ├── AdminLayout.tsx
    │   ├── AuthLayout.tsx
    │   └── index.ts
    │
    ├── pages/
    │   ├── public/
    │   ├── auth/
    │   ├── account/
    │   └── admin/
    │
    ├── providers/
    │   ├── QueryProvider.tsx
    │   ├── AppProvider.tsx
    │   └── index.ts
    │
    ├── router/
    │   ├── AppRouter.tsx
    │   ├── ProtectedRoute.tsx
    │   └── index.ts
    │
    ├── services/
    │   ├── apiClient.ts
    │   ├── auth.service.ts
    │   ├── products.service.ts
    │   ├── wishlist.service.ts
    │   └── index.ts
    │
    ├── stores/
    │   ├── useAuthStore.ts
    │   ├── useCartStore.ts
    │   ├── useWishlistStore.ts
    │   ├── useUIStore.ts
    │   ├── useThemeStore.ts
    │   └── index.ts
    │
    ├── styles/
    │   └── index.css
    │
    ├── types/
    │   ├── api.ts
    │   ├── models.ts
    │   ├── auth.ts
    │   ├── cart.ts
    │   └── index.ts
    │
    └── utils/
        ├── cn.ts
        ├── formatters.ts
        ├── validators.ts
        └── index.ts
```

---

## 2. Categories de Composants

| Categorie | Dossier | Role | Peut consommer |
|-----------|---------|------|----------------|
| **UI** | `components/ui/` | Primitives visuelles - Button, Badge, Tag, Spinner | Props uniquement |
| **Common** | `components/common/` | EmptyState, LazyImage, Breadcrumbs, PageLoader | hooks partages, stores |
| **Forms** | `components/forms/` | Input, Select, Checkbox, FormField, FormError | Props uniquement |
| **Feedback** | `components/feedback/` | Toast, Modal, Drawer, Alert, Skeleton | useUIStore |
| **Navigation** | `components/navigation/` | Navbar, Footer, SearchBar, AccountSidebar | stores, hooks |
| **Layout** | `components/layout/` | Container, Grid, Section, Stack | Tailwind uniquement |

---

## 3. Architecture Feature-First

Chaque feature est **totalement autonome** :

```
features/<feature-name>/
├── components/       # Composants specifiques a la feature
├── hooks/            # Logique metier (useQuery, useMutation, store actions)
├── pages/            # Page containers
├── types/            # Types specifiques (optionnel)
└── index.ts          # Barrel export
```

**Regle d'or :** Une feature n'importe jamais depuis une autre feature.
La communication inter-feature passe uniquement par les stores Zustand.

---

## 4. Layouts

| Layout | Responsabilite |
|--------|----------------|
| **PublicLayout** | Navbar luxury + Outlet + Footer. Pages : Home, Catalog, Product |
| **AuthLayout** | Cadre centre minimaliste. Pages : Login, Register, Reset |
| **AccountLayout** | Sidebar navigation compte client + Outlet. Pages : Profile, Orders, Wishlist |
| **AdminLayout** | Sidebar admin sombre + Topbar + Outlet. Pages : Dashboard, Produits, Commandes |

---

## 5. Stores Zustand

| Store | Role |
|-------|------|
| **useAuthStore** | Session client (user, token, isAuthenticated, isLoading). Persist token Sanctum. |
| **useCartStore** | Panier local (items, drawer state). Aucun appel API direct. |
| **useWishlistStore** | Cache wishlist + helper `isWishlisted(productId)`. Sync avec l'API. |
| **useUIStore** | Etats interface : isSearchOpen, isMobileMenuOpen, activeModalId. |
| **useThemeStore** | Preferences : devise (EUR/USD/MAD), langue (fr/en/ar). |

---

## 6. Services API

| Service | Endpoints |
|---------|-----------|
| **apiClient** | Singleton Axios - Bearer token, intercepteur 401, event `hafrose:unauthorized` |
| **authService** | login, register, logout, getProfile |
| **productsService** | getProducts (filtre/pagine), getProductBySlug, getCategories |
| **wishlistService** | getWishlist, addToWishlist, removeFromWishlist |

> **Regle :** Aucun appel Axios direct dans les composants ou hooks. Toujours via un service.

---

## 7. Hooks Partages

| Hook | Responsabilite |
|------|----------------|
| `useApiMutation` | Mutation generique loading/error/data pour soumissions de formulaires |
| `useSession` | Rehydrate la session au boot via `authService.getProfile()` |
| `useDebounce` | Retarde la mise a jour d'une valeur - recherche |
| `useMediaQuery` | Detecte les breakpoints CSS |
| `useClickOutside` | Ferme les dropdowns/drawers sur clic exterieur |
| `useLocalStorage` | Persistance de state dans localStorage |

---

## 8. Types TypeScript

| Fichier | Contenu |
|---------|---------|
| `types/api.ts` | `ApiResponse<T>`, `ApiPaginatedResponse<T>`, `ApiErrorResponse` |
| `types/models.ts` | `User`, `Product`, `Category`, `Order`, `WishlistItem`, `Review` |
| `types/auth.ts` | `LoginPayload`, `RegisterPayload`, `AuthResponse` |
| `types/cart.ts` | `CartItem`, `CartSummary` |

---

## 9. Regles d'Importation

```
pages/
  importe depuis
features/*/components, features/*/hooks, components/*, layouts/*
  importe depuis
stores/*, hooks/*, services/*, utils/*, constants/*, types/*
  importe depuis
types/*  (couche de base - aucune dependance vers le haut)
```

### Regles strictes

| Autorise | Interdit |
|----------|---------|
| `features/auth` vers `services/auth.service` | `features/catalog` vers `features/wishlist` |
| `features/*` vers `stores/*` | `stores/*` vers `features/*` |
| `components/*` vers `types/*` | `services/*` vers `stores/*` |
| `hooks/*` vers `services/*` | `types/*` vers tout autre module |

### Prevenir les dependances circulaires
1. Barrel exports sur chaque `index.ts` - jamais d'import profond depuis l'exterieur
2. Types au niveau racine `src/types/` - jamais definis dans les services ou stores
3. Communication inter-feature via stores uniquement
4. Les services ne connaissent pas les stores

---

## 10. Workflow Developpeur - Chaque Nouvelle Page

```
1. VERIFIER    -> Explorer src/components/* + src/features/* + src/stores/*

2. REUTILISER  -> Importer les composants et hooks existants

3. CREER       -> UI/Common/Forms first -> hooks feature -> composant feature

4. FEATURE     -> Construire dans src/features/<nom>/hooks/ + components/

5. ASSEMBLER   -> Page = assemblage composants + hooks (sans logique directe)
                  Placer dans src/pages/<zone>/

6. ROUTER      -> Ajouter dans src/router/AppRouter.tsx avec React.lazy()

7. BACKEND     -> Verifier src/services/ + src/constants/api.constants.ts
                  Creer hook TanStack Query dans features/<nom>/hooks/

8. TESTER      -> npm run typecheck
                  Verifier rendu navigateur + appels Network tab
```

---

## Palette HAFROSE

| Token Tailwind | Hex | Usage |
|----------------|-----|-------|
| `hafrose-burgundy` | `#8A1538` | Brand principale, CTA primaires |
| `hafrose-rose-soft` | `#EAA2B1` | Accents, hover states |
| `hafrose-rose-powder` | `#F8D7DA` | Fonds secondaires, badges |
| `hafrose-rose-blush` | `#FDF2F4` | Backgrounds legers |
| `hafrose-cream` | `#FAF6F0` | Background principal |
| `hafrose-gold` | `#D4AF37` | Details premium, icones luxury |
| `hafrose-charcoal` | `#1A1A1A` | Texte principal, sidebar admin |

## Typographie

| Usage | Police | Poids |
|-------|--------|-------|
| Titres, heros | Playfair Display / Cormorant Garamond | 400, 500, 600 |
| Corps, UI | Montserrat / Inter | 300, 400, 500, 600 |

---

*Document officiel Phase 1 - Architecture Foundation HAFROSE. Toute modification structurelle necessite une mise a jour de ce document.*
