# HAFROSE — Guide de Sauvegarde & Restauration Locale

> **Version** : Phase 5.2 — Sauvegarde & Restauration Locale  
> **OS cible** : Windows 10/11 (PowerShell & CLI)  
> **Environnement** : 100% Local (sans VPS, sans cloud, sans DNS externe)  
> **Principe fondamental** : *Sauvegarder → Vérifier → Restaurer → Tester → Documenter*

---

## 1. Vue d'Ensemble & Principes Fondamentaux

Dans le cadre du fonctionnement local de HAFROSE, la pérennité et la sécurité des données reposent sur des mécanismes de sauvegarde et restauration robustes, autonomes et reproductibles.

### Composants sauvegardés :
1. **Base de données MySQL** (`hafrose`) : structure DDL complète et données (comptes administrateurs, clients, produits, commandes, avis, paramètres).
2. **Médias & Uploads persistants** : répertoire `backend/storage/app/public` (`banners/`, `categories/`, `hero/`, `products/`, `settings/`).
3. **Images applicatives publiques** : répertoire `backend/public/images/`.
4. **Fichiers de configuration non sensibles** : `composer.json`, `.env.example`, `.env.sanitized` (secrets masqués).
5. **Manifeste standardisé horodaté** : `manifest.json` avec sommes de contrôle SHA-256 pour chaque fichier, commit Git, version applicative et inventaire des tables.

### Protection stricte des secrets (Zero Secret Leak) :
* Le fichier `.env` brut n'est **JAMAIS** inclus dans les archives.
* Les clés sensibles (`APP_KEY`, `DB_PASSWORD`, tokens de paiement, secrets OAuth/JWT) sont systématiquement masquées sous la forme `********` dans `.env.sanitized`.
* Les archives de sauvegarde et dumps SQL sont strictement exclus du suivi Git par `.gitignore`.

---

## 2. Commandes & Scripts Disponibles

L'outillage propose deux interfaces complémentaires :
- **Commandes Laravel Artisan** : universelles, scriptables et intégrées à l'environnement PHP.
- **Scripts PowerShell Windows** : automatisations directes « un clic » pour l'opérateur local.

| Action | Commande Artisan | Script PowerShell Windows |
|---|---|---|
| **Créer une sauvegarde** | `php artisan hafrose:backup --detailed` | `.\scripts\backup.ps1` |
| **Vérifier l'intégrité** | `php artisan hafrose:backup:verify` | `.\scripts\verify-backup.ps1` |
| **Lister les sauvegardes** | `php artisan hafrose:backup:list` | *(utilise la commande Artisan)* |
| **Restaurer (interactive)**| `php artisan hafrose:restore <id>` | `.\scripts\restore.ps1 -BackupId <id>` |
| **Restaurer vers base test**| `php artisan hafrose:restore <id> --target-db=hafrose_restore_test` | `.\scripts\restore.ps1 -BackupId <id> -TargetDb hafrose_restore_test` |
| **Simulation (Dry-run)** | `php artisan hafrose:restore <id> --dry-run` | `.\scripts\restore.ps1 -BackupId <id> -DryRun` |

---

## 3. Structure & Anatomie d'une Archive de Sauvegarde

Les archives sont stockées dans : `backend/storage/app/backups/`.  
Format du nom : `hafrose-backup_YYYY-MM-DD_HH-mm-ss.zip`.

```text
hafrose-backup_2026-09-09_14-23-09.zip
│
├── manifest.json                  # Métadonnées, SHA-256 de chaque fichier, version, commit
├── database/
│   └── database.sql               # Dump DDL + DML complet MySQL (compatible PDO natif)
├── storage/
│   └── public/                    # Fichiers médias uploadés (produits, bannières, etc.)
│       ├── products/
│       ├── categories/
│       ├── banners/
│       └── settings/
├── images/                        # Images publiques applicatives
│   └── ...
└── config/
    ├── .env.example               # Modèle de configuration
    ├── .env.sanitized             # Configuration avec secrets caviardés
    └── composer.json              # Dépendances exactes du backend
```

### Exemple de `manifest.json` :
```json
{
  "backup_id": "hafrose-backup_2026-09-09_14-23-09",
  "app_name": "Hafrose",
  "app_env": "local",
  "app_version": "12.62.0",
  "git_commit": "723d7ef",
  "timestamp": "2026-09-09T14:23:22+00:00",
  "database": {
    "connection": "mysql",
    "database": "hafrose",
    "tables_count": 36,
    "dump_file": "database/database.sql"
  },
  "files_count": 1410,
  "files_manifest": {
    "database/database.sql": {
      "sha256": "8a7c2b4e...",
      "size_bytes": 1048576
    },
    "config/.env.sanitized": {
      "sha256": "4b3d1f...",
      "size_bytes": 1280
    }
  },
  "security": {
    "secrets_included": false,
    "sanitized": true
  }
}
```

---

## 4. Procédure de Création d'une Sauvegarde

### Méthode A : Via Script PowerShell (Recommandé)
Depuis la racine du projet :
```powershell
.\scripts\backup.ps1
```
*Le script effectue automatiquement la création de l'archive, puis enchaîne immédiatement avec l'audit d'intégrité SHA-256.*

### Méthode B : Via Laravel Artisan
Depuis le dossier `backend` :
```powershell
cd backend
php artisan hafrose:backup --detailed
```

Options utiles :
- `--detailed` : Affiche l'avancement pas-à-pas de chaque étape.
- `--dry-run` : Simule l'opération sans écrire sur le disque.
- `--force` : Force l'exécution même si des alertes de rétention ou configuration existent.

---

## 5. Procédure de Vérification d'Intégrité

Une sauvegarde non testée n'est pas une sauvegarde.  
La commande de vérification effectue **5 contrôles stricts** :

1. **Existence et taille du fichier ZIP**.
2. **Intégrité structurelle de l'archive** (drapeau `ZipArchive::CHECKCONS` — détection des corruptions CRC/Deflate).
3. **Présence et conformité du manifeste** (`manifest.json` valide, schéma v1.0).
4. **Validation cryptographique SHA-256** (chaque fichier interne est recalculé et comparé au hash du manifeste).
5. **Intégrité syntaxique du dump SQL** (présence des déclarations DDL `CREATE TABLE`, `INSERT`, et encodage UTF-8).

### Exécuter la vérification :
```powershell
# Vérifier la dernière sauvegarde :
php artisan hafrose:backup:verify --latest

# Ou vérifier une sauvegarde spécifique :
php artisan hafrose:backup:verify hafrose-backup_2026-09-09_14-23-09

# Ou via PowerShell :
.\scripts\verify-backup.ps1
```

---

## 6. Procédure de Restauration Locale

### A. Restauration Complète Interactive
```powershell
cd backend
php artisan hafrose:restore hafrose-backup_2026-09-09_14-23-09
```
*Le système demandera une confirmation explicite avant d'appliquer les modifications.*

### B. Restauration Sélective / Granulaire
Il est possible d'isoler la restauration selon les composants souhaités :
```powershell
# Restaurer UNIQUEMENT la base de données (sans toucher aux fichiers) :
php artisan hafrose:restore <id> --no-storage --no-images --force

# Restaurer UNIQUEMENT les médias et images (sans toucher à la base) :
php artisan hafrose:restore <id> --no-db --force
```

### C. Test de Restauration à Froid (Base Temporaire Isolée)
Pour valider une archive sans risquer d'altérer la base de travail locale :
```powershell
php artisan hafrose:restore <id> --target-db=hafrose_restore_test --no-storage --no-images --force
```
*Cette commande crée automatiquement la base `hafrose_restore_test` si nécessaire et y injecte le dump complet.*

### D. Mode Simulation (Dry-Run)
Pour prévisualiser les étapes et valider l'archive sans effectuer aucune écriture :
```powershell
php artisan hafrose:restore <id> --dry-run
```

---

## 7. Scénarios de Disaster Recovery (Plans d'Urgence)

### 🔴 SCÉNARIO A : Corruption ou Perte de la Base de Données

**Symptôme** : Erreur SQL `Table doesn't exist`, corruption d'une table MySQL ou suppression involontaire de données.

**Procédure de récupération :**
1. Trouver la dernière sauvegarde valide :
   ```powershell
   php artisan hafrose:backup:list
   ```
2. Vérifier son intégrité :
   ```powershell
   php artisan hafrose:backup:verify --latest
   ```
3. Restaurer uniquement la base de données :
   ```powershell
   php artisan hafrose:restore <id_sauvegarde> --no-storage --no-images --force
   ```
4. Vérifier la cohérence de l'application :
   ```powershell
   php artisan test --filter=DatabaseRelationsTest
   ```

---

### 🔴 SCÉNARIO B : Perte ou Corruption des Médias & Uploads

**Symptôme** : Images de produits cassées (404), bannières disparues dans `storage/app/public`.

**Procédure de récupération :**
1. Restaurer uniquement le stockage et les images :
   ```powershell
   php artisan hafrose:restore <id_sauvegarde> --no-db --force
   ```
2. Re-créer le lien symbolique de stockage si nécessaire :
   ```powershell
   php artisan storage:link
   ```
3. Vérifier l'accès aux images dans le navigateur (`http://localhost:8000/storage/...`).

---

### 🔴 SCÉNARIO C : Réinstallation Complète sur une Machine Vierge

**Symptôme** : Nouvelle machine Windows ou disque dur réinitialisé.

**Procédure de reprise complète :**
1. **Cloner le code source** :
   ```powershell
   git clone <repo-url> Hafrose
   cd Hafrose
   ```
2. **Installer les dépendances** :
   ```powershell
   cd backend && composer install
   cd ../frontend && npm install
   ```
3. **Configurer l'environnement** :
   ```powershell
   cd ../backend
   copy .env.example .env
   php artisan key:generate
   ```
   *Renseigner les accès MySQL locaux dans `.env` (`DB_HOST=127.0.0.1`, `DB_PASSWORD=...`).*
4. **Créer la base vide** dans MySQL :
   ```sql
   CREATE DATABASE hafrose CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
5. **Placer l'archive de sauvegarde** dans `backend/storage/app/backups/`.
6. **Lancer la restauration complète** :
   ```powershell
   php artisan hafrose:restore <id_sauvegarde> --force
   php artisan storage:link
   ```
7. **Exécuter les suites de tests** :
   ```powershell
   php artisan test
   cd ../frontend && npm run typecheck && npm run lint
   ```

---

## 8. Politique de Rétention & Espace Disque

Afin de préserver l'espace disque sur la machine locale, une rotation automatique est intégrée au service `ProductionBackupService` et configurable dans `backend/config/production.php` :

* **Rétention par défaut** : 7 sauvegardes locales conservées.
* **Comportement de rotation** : à chaque nouvelle sauvegarde créée, les archives les plus anciennes au-delà de la limite sont automatiquement purgées.
* **Suppression manuelle** d'une sauvegarde obsolète via Artisan :
  ```powershell
  php artisan hafrose:backup:list
  ```
  *(La suppression directe du fichier `.zip` dans `storage/app/backups/` est également supportée).*

---

## 9. Bonnes Pratiques & Règles de Sécurité Incontournables

1. **Règle d'or Git** : Ne jamais forcer l'ajout d'une archive de sauvegarde dans Git (`git add -f ...` interdit). Les règles du `.gitignore` protègent l'intégrité du dépôt.
2. **Sauvegarde avant opération majeure** : Toujours exécuter `.\scripts\backup.ps1` avant toute migration (`migrate`), seed (`db:seed`), ou refactorisation massive de modèles.
3. **Test périodique de restauration** : Effectuer une restauration de test sur `hafrose_restore_test` une fois par mois pour s'assurer que la chaîne reste 100% opérationnelle.
