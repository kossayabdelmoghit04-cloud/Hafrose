# HAFROSE — System Architecture & Technical Design

## 1. Overview
HAFROSE is an Enterprise E-Commerce Platform built with a decoupled API-first architecture:
- **Frontend Layer:** React 19 SPA + Vite + Tailwind CSS v4 + TanStack React Query v5 + Framer Motion.
- **Backend Layer:** Laravel 12 API + Sanctum Auth + Spatie Permissions + MySQL / SQLite.
- **Proxy & Server Layer:** Nginx 1.27 + Docker + PHP 8.2-FPM + SSL TLS 1.3.

---

## 2. Decoupled Architecture Diagram

```
                   ┌──────────────────────────────────────┐
                   │    Client Browser / PWA Manifest     │
                   └──────────────────┬───────────────────┘
                                      │  HTTPS (TLS 1.3)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │        Nginx Reverse Proxy           │
                   │ (Gzip, HSTS, CSP, Rate Limiting)     │
                   └──────────┬────────────────┬──────────┘
                              │                │
           Static Assets / SPA│                │ API Requests (/api/*)
                              ▼                ▼
                   ┌────────────────────┐   ┌───────────────────────────┐
                   │  React 19 SPA App  │   │     Laravel 12 API        │
                   │ (Vite static build)│   │  (PHP 8.2-FPM + Sanctum)  │
                   └────────────────────┘   └─────────────┬─────────────┘
                                                          │
                                                          ▼
                                            ┌───────────────────────────┐
                                            │      MySQL Database       │
                                            └───────────────────────────┘
```

---

## 3. Data Flow & Security Perimeters
1. **Authentication:** Sanctum bearer tokens stored securely in client storage, passed via `Authorization: Bearer <token>` interceptor.
2. **Security Headers:** Enforced at both Nginx proxy and Laravel middleware levels (`SecurityHeadersMiddleware`).
3. **Data Caching:** TanStack React Query handles client-side caching with a 5-minute stale threshold and hover-prefetching.
4. **Analytics:** Consent-gated unified tracking layer (GA4, GTM, Meta Pixel).
