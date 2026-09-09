# HAFROSE — Maison de Haute Couture & Prêt-à-Porter

Plateforme e-commerce haut de gamme conçue selon une architecture moderne découplée (*API-first*).  
Le projet est exécuté de manière **100% locale** sur environnement **Windows** (aucun prérequis cloud ni serveur distant).

---

## 🏛️ Architecture & Ports Officiels

L'application repose sur une séparation nette entre l'interface utilisateur et la logique métier :

| Composant | Technologie | URL / Port Local | Rôle |
|---|---|---|---|
| **Frontend Web** | React 19, TypeScript, Vite 6, Tailwind CSS | `http://localhost:3000` | Interface client & Back-office |
| **Backend API** | Laravel 12, PHP 8.2+ (8.5.6 supporté), Sanctum | `http://127.0.0.1:8000` | Moteur métier REST & authentification |
| **Health Check** | JSON Endpoint | `http://127.0.0.1:8000/api/health` | Diagnostic en temps réel des services |
| **Base de Données** | MySQL 8.0 | `127.0.0.1:3306` | Base relationnelle locale (`hafrose`) |

> [!IMPORTANT]
> **Source de Vérité des Ports :** Le port **3000** est le port unique et officiel du frontend. Le port 5173 est strictement obsolète.

---

## ⚙️ Prérequis Système

Les outils suivants doivent être installés et accessibles dans le `PATH` Windows :

- **PHP** : `>= 8.2` (testé et validé sur **PHP 8.5.6**)
- **Composer** : `2.x`
- **Node.js** : `>= 18.x` (testé et validé sur **v22.23.0**)
- **npm** : `>= 9.x` (testé et validé sur **10.9.8**)
- **MySQL** : `8.0+` (service démarré sur le port `3306`)
- **Windows PowerShell** : `5.1+`

---

## 🚀 Installation Rapide

Depuis un terminal PowerShell à la racine du projet :

### 1. Base de Données
Créez les bases MySQL requises :
```sql
CREATE DATABASE IF NOT EXISTS `hafrose` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Laravel
```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
cd ..
```

### 3. Frontend React / Vite
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npx playwright install chromium
cd ..
```

---

## 💻 Démarrage Quotidien

Ouvrez **deux terminaux PowerShell distincts** :

### Terminal 1 — Backend API
```powershell
cd backend
php artisan serve --port=8000
```

### Terminal 2 — Frontend Web
```powershell
cd frontend
npm run dev
```

Accédez ensuite à votre boutique locale sur **`http://localhost:3000`**.

---

## 🩺 Diagnostic & Vérification de Santé

Vérifiez l'intégrité de l'environnement avec le script de diagnostic automatisé :

```powershell
powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1
```
*Le script contrôle automatiquement : PHP, Composer, Node, npm, port MySQL 3306, requête SQL `SELECT 1`, port Backend 8000, endpoint `/api/health`, port Frontend 3000, permissions de stockage et rotation des logs.*

---

## 🧪 Exécution des Tests

### Tests Backend & Sécurité
```powershell
cd backend

# Suite complète PHPUnit (432 tests)
php artisan test

# Test d'audit de conformité sécurité
php artisan test --filter=SecurityAuditTest
```

### Tests Qualité Frontend
```powershell
cd frontend
npm run typecheck    # Validation TypeScript stricte
npm run lint         # Analyse statique ESLint (0 warning)
npm run build        # Compilation de production Vite
```

### Tests End-to-End (E2E) Playwright
*(Nécessite que les serveurs sur les ports 8000 et 3000 soient démarrés)*
```powershell
cd frontend
npx playwright test
```

---

## 📦 Sauvegardes & Restauration Locales

HAFROSE intègre une solution complète de sauvegarde et restauration autonome :

- **Sauvegarder :** `powershell -File scripts\backup.ps1` ou `php artisan hafrose:backup --detailed`
- **Vérifier :** `powershell -File scripts\verify-backup.ps1 -Latest`
- **Lister :** `php artisan hafrose:backup:list`
- **Restaurer :** `powershell -File scripts\restore.ps1` ou `php artisan hafrose:restore`

---

## 📚 Documentation Complète

Pour les procédures détaillées, la maintenance, la gestion des incidents et les spécifications techniques, consultez :

- 📖 [**Guide Opérationnel Local Complet (LOCAL_OPERATIONS_GUIDE.md)**](file:///documentation/LOCAL_OPERATIONS_GUIDE.md) : référence exhaustive des 28 procédures locales.
- 🗂️ [**Index de la Documentation (documentation/README.md)**](file:///documentation/README.md) : catalogue structuré de toute la documentation du projet.
- 📋 [**Rapport de Validation Phase 5.5**](file:///documentation/PHASE_5_5_DOCUMENTATION_OPERATIONS_REPORT.md) : bilan officiel de conformité documentaire.

---

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](file:///LICENSE) pour plus de détails.
