# HAFROSE — Developer Guide & Conventions

## 1. Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev      # Local dev server (http://localhost:5173)
npm run lint     # Oxlint code check
npm run test     # Vitest unit & component test suite
npm run build    # Production build
```

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve   # API server (http://localhost:8000)
php artisan test    # PHPUnit test suite
```

---

## 2. Directory Conventions

- `frontend/src/components/ui`: Base primitive UI components (OptimizedImage, SkipToContent, Buttons, Modals).
- `frontend/src/components/common`: App-level components (Header, Footer, ErrorBoundary, InstallPWA, CookieConsent).
- `frontend/src/services`: API clients, query key factories, analytics, and query client configs.
- `frontend/src/hooks`: Custom React hooks (useProductsQuery, useWebVitals, useSEO).

---

## 3. Code Quality Standards
- All UI components must support dark mode (`dark:` Tailwind modifiers).
- All interactive controls must specify explicit `focus-visible` styles and minimum 44px touch targets.
- All non-decorative images must use `<OptimizedImage />`.
