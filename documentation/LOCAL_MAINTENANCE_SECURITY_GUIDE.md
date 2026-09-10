# HAFROSE — Guide Opérationnel de Maintenance & Sécurité Locale

> **Environnement :** 100% Local (Windows 11, PHP 8.5+, Node.js 22+, MySQL 8.0)  
> **Date de révision :** Septembre 2026  
> **Statut :** Validé — Phase 5.4  

---

## 1. Cartographie de l'Environnement & Ports Officiels

Le projet **HAFROSE** fonctionne exclusivement sur une architecture locale découplée. Aucun service cloud, SaaS ou serveur distant n'est utilisé.

| Composant | URL / Port Local | Rôle & Description |
|---|---|---|
| **Frontend SPA (Vite / React)** | `http://localhost:3000` | Interface client Haute Couture & Back-office |
| **Backend API (Laravel 12)** | `http://127.0.0.1:8000` | Moteur métier, Sanctum, Monolog 3 |
| **Endpoint Healthcheck** | `http://127.0.0.1:8000/api/health` | Contrôle d'état en temps réel (DB, Storage, Logs, Cache) |
| **Base de Données (MySQL)** | `127.0.0.1:3306` | Base relationnelle locale (`hafrose`) |

> [!IMPORTANT]
> **Source de Vérité des Ports :**  
> Le port **3000** est le seul et unique port officiel du frontend. Toute référence résiduelle au port 5173 a été supprimée de l'ensemble du projet.

---

## 2. Sécurité Locale & Gestion des Secrets

### 2.1 Hygiène des Fichiers `.env`
- Les fichiers `backend/.env` et `frontend/.env` contiennent des paramètres d'exécution locaux.
- **Règle absolue :** Ne jamais commiter de fichier `.env`, `.env.local` ou `.env.production`.
- Seuls les gabarits `.env.example` sont suivis par Git.

### 2.2 Variables Frontend Exposées (`VITE_*`)
- Les variables préfixées par `VITE_` sont injectées dans le bundle JavaScript côté client et sont **visibles par tout utilisateur**.
- Seules les variables publiques suivantes sont autorisées :
  - `VITE_API_BASE_URL` (ex: `http://127.0.0.1:8000/api`)
  - `VITE_STORAGE_URL` (ex: `http://127.0.0.1:8000/storage`)
  - `VITE_APP_ENV` (ex: `development`)
- **Aucun mot de passe, secret de webhook ou clé privée ne doit jamais être préfixé par `VITE_`.**

### 2.3 Hygiène Git
Les fichiers suivants sont strictement exclus par le `.gitignore` racine et les `.gitignore` secondaires :
- `backend/.env`, `frontend/.env`
- `backend/storage/logs/*.log`
- `backend/storage/app/backups/*` (sauvegardes locales)
- Fichiers temporaires (`*.sql`, `*.dump`, `*.tar.gz`)
- Clés privées et certificats (`*.key`, `*.pem`)

Vérification d'intégrité avant tout commit :
```powershell
git status --short
git ls-files | Select-String -Pattern "(\.env|\.log|backups/|\.sql)"
```

---

## 3. Audit et Gestion des Dépendances

### 3.1 Dépendances PHP (Backend)
Audit de sécurité sans mise à jour massive :
```powershell
cd backend
composer audit
```
*Directives :*
- Ne **jamais** lancer `composer update` sans audit préliminaire.
- Ne pas effectuer de montée de version majeure non testée.

### 3.2 Dépendances Node.js (Frontend)
Audit de vulnérabilité :
```powershell
cd frontend
npm audit
npm audit --omit=dev
```
*Directives :*
- Ne **jamais** utiliser `npm audit fix --force` (risque élevé de régression majeure sur React ou Vite).
- En cas de vulnérabilité avérée, identifier le composant précis et appliquer une mise à jour ciblée du patch.

---

## 4. Politique des Logs Locaux & Masquage des Secrets

### 4.1 Canal Daily & Rétention 14 Jours
- Configuration dans `backend/config/logging.php` : canal `daily`.
- Fichiers générés : `backend/storage/logs/laravel-YYYY-MM-DD.log`.
- Rétention automatique : 14 jours (`LOG_DAILY_DAYS=14`).
- Nettoyage contrôlé manuel :
```powershell
cd backend
php artisan hafrose:logs:clean --dry-run
php artisan hafrose:logs:clean --days=14 --force
```

### 4.2 Masquage Automatique Monolog 3 (`SanitizeContextProcessor`)
Tout événement consigné dans les logs passe par `App\Logging\SanitizeContextProcessor` qui remplace systématiquement par `[REDACTED]` :
- Mots de passe (`password`, `password_confirmation`, `old_password`)
- Tokens d'authentification Sanctum (`\d+\|[A-Za-z0-9]{40}`)
- En-têtes `Authorization: Bearer <token>`
- Clé d'application `APP_KEY`
- Coordonnées bancaires ou cartes de paiement

---

## 5. Procédure Standardisée Avant Toute Mise à Jour

Avant d'appliquer la moindre mise à jour de dépendance, modification de schéma DB ou évolution de code :

```text
[1. Sauvegarde Locale] ──> [2. Contrôle Git] ──> [3. Mise à jour Ciblée] ──> [4. Suite de Validation]
```

### Étape 1 : Sauvegarde Complète Préventive
```powershell
# Création d'un instantané base de données et stockage
powershell -ExecutionPolicy Bypass -File scripts/backup.ps1 -Type full -Compress -Verify
```

### Étape 2 : Vérification de l'État Git
```powershell
git status
# S'assurer que le working tree est propre ou commité sur une branche dédiée
```

### Étape 3 : Application Contrôlée
Mettre à jour uniquement le fichier ou package ciblé :
```powershell
# Exemple PHP ciblé
composer update vendor/package --with-dependencies

# Exemple npm ciblé
npm update package-name
```

### Étape 4 : Validation Complète de Non-Régression
```powershell
# 1. Tests backend (432 tests)
cd backend; php artisan test

# 2. Vérifications frontend
cd ../frontend
npm run typecheck
npm run lint
npm run build

# 3. Tests E2E Playwright
npx playwright test

# 4. Diagnostic santé
powershell -ExecutionPolicy Bypass -File ../scripts/health-check.ps1
```

---

## 6. Procédure d'Urgence et Plan de Rollback

En cas d'erreur bloquante, de régression fonctionnelle ou d'incompatibilité post-mise à jour :

### Scénario A : Régression au niveau du Code / Dépendances
1. Revenir au commit précédent :
   ```powershell
   git status
   git reset --hard HEAD
   git clean -fd
   ```
2. Réinstaller l'état exact des dépendances verrouillées :
   ```powershell
   cd backend
   composer install
   cd ../frontend
   npm ci
   ```

### Scénario B : Corruption ou Problème de Base de Données
1. Lister les sauvegardes récentes disponibles :
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/verify-backup.ps1 -ListOnly
   ```
2. Restaurer la dernière sauvegarde valide :
   ```powershell
   # Restauration de la base de données
   powershell -ExecutionPolicy Bypass -File scripts/restore.ps1 -BackupFile "backups/db/hafrose_db_YYYYMMDD_HHMMSS.sql" -Force
   ```
3. Vider et régénérer les caches applicatifs :
   ```powershell
   cd backend
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

---

## 7. Diagnostic et Surveillance Régulière

Exécuter le script de diagnostic local régulièrement ou lors de toute session de développement :
```powershell
powershell -ExecutionPolicy Bypass -File scripts/health-check.ps1
```

Le script vérifie en moins de 5 secondes :
1. Prerequis Runtimes (PHP >= 8.2, Composer, Node, npm)
2. Port et connexion DB MySQL (3306)
3. Port API Laravel (8000) et endpoint `/api/health`
4. Port Frontend Vite (`http://localhost:3000`) et réponse HTTP 200
5. Droits d'écriture dans `storage/`, `storage/logs/`, `bootstrap/cache/`
6. État de la rotation des logs et absence d'exposition Git

---
*Fin du guide opérationnel de maintenance et sécurité.*
