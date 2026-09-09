# HAFROSE — Guide d'Environnement Local

> **Version** : Phase 5.1 — Stabilisation locale
> **OS cible** : Windows 10/11 (adapté macOS/Linux en note)
> **Objectif** : Reproduire l'environnement complet sur une machine vierge.

---

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer --version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL | 8.0 | `mysql --version` |
| Git | 2.x | `git --version` |

> **Optionnel** : Docker Desktop (pour les tests Docker isolés uniquement).

---

## 1. Cloner le Projet

```bash
git clone <url-du-repo> hafrose
cd hafrose
```

---

## 2. Configurer la Base de Données MySQL

```sql
CREATE DATABASE hafrose CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> `hafrose` = base de développement local
> `test` = base isolée pour les tests PHPUnit

---

## 3. Configurer le Backend Laravel

```bash
cd backend
cp .env.example .env
```

Ajuster dans `backend/.env` :

```ini
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hafrose
DB_USERNAME=root
DB_PASSWORD=
```

```bash
composer install
php artisan key:generate
php artisan storage:link
php artisan migrate
php artisan db:seed
```

---

## 4. Configurer le Frontend React

```bash
cd ../frontend
cp .env.example .env
npm install
```

Le `.env` par défaut est correct pour le dev local :

```ini
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STORAGE_URL=http://127.0.0.1:8000/storage
VITE_APP_ENV=development
```

---

## 5. Démarrer l'Application

**Backend — Terminal 1 :**
```bash
cd backend
php artisan serve --port=8000
```

**Frontend — Terminal 2 :**
```bash
cd frontend
npm run dev
```

- Frontend : http://localhost:3000
- Backend  : http://localhost:8000
- Health   : http://localhost:8000/api/health

---

## 6. Comptes de Test

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@hafrose.com` | `Admin@Hafrose2024!` |
| Client | `client@hafrose.com` | `Secret123!` |

---

## 7. Ports Utilisés

| Service | Port |
|---|---|
| Frontend Vite (dev) | 3000 |
| Backend Laravel | 8000 |
| MySQL | 3306 |

---

## 8. Tests

**Tests Backend PHPUnit :**
```bash
cd backend
php artisan test
```
Résultat attendu : 413 tests, 1656 assertions, 0 failure.

**Tests E2E Playwright :**
```bash
cd frontend
npx playwright test
npx playwright test e2e/purchase-flow.spec.ts
npx playwright test e2e/admin-auth.spec.ts
npx playwright test e2e/auth_customer_journey.spec.ts
```

---

## 9. Build Frontend

```bash
cd frontend
npm run typecheck   # 0 erreur TypeScript
npm run lint        # 0 warning ESLint
npm run build       # génère dist/
```

---

## 10. Arrêt et Redémarrage

**Arrêt :** Ctrl+C dans chaque terminal.

**Redémarrage propre :**
```bash
# Terminal 1
cd backend
php artisan config:clear
php artisan cache:clear
php artisan serve --port=8000

# Terminal 2
cd frontend
npm run dev
```

---

## 11. Maintenance

```bash
# Backend
php artisan migrate:status
php artisan migrate:fresh --seed  # reinitialiser la BDD
php artisan route:list
php artisan about
composer validate

# Sync images (si storage vide)
php database/scripts/sync_storage_images.php

# Frontend
npm run typecheck
npm run lint
npm run build
```

---

## 12. Dépannage Courant

**DB inconnue :** `CREATE DATABASE hafrose...`

**Port 3000 occupé :** `netstat -ano | findstr :3000`

**Images manquantes :** `php database/scripts/sync_storage_images.php`

**Lien storage cassé :** `php artisan storage:link`

**DB test manquante :** `CREATE DATABASE test CHARACTER SET utf8mb4...`

**Conteneurs Docker sur 80/443 :** `docker compose down` (n'affecte pas les ports 3000/8000)
