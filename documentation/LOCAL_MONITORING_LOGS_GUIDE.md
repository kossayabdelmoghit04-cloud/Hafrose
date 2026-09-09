# HAFROSE — Guide de Monitoring & Logs Locaux

> **Phase 5.3 — Monitoring & Logs Locaux**
> Environnement exclusivement local (Windows). Aucun service distant.

---

## 1. Architecture des Logs

### 1.1 Canal par Défaut

HAFROSE utilise le canal **`daily`** (Monolog `RotatingFileHandler`).

| Paramètre | Valeur |
|---|---|
| `LOG_CHANNEL` | `daily` |
| `LOG_LEVEL` | `debug` |
| `LOG_DAILY_DAYS` | `14` |
| Chemin des fichiers | `backend/storage/logs/laravel-YYYY-MM-DD.log` |
| Rétention | 14 jours (nettoyage automatique Monolog) |

### 1.2 Conventions de Nommage

```
backend/storage/logs/
+-- laravel-2026-09-09.log    # Fichier du jour courant
+-- laravel-2026-09-08.log    # Hier
+-- ...                       # Jusqu à 14 jours
```

### 1.3 Processeur de Masquage Automatique (SanitizeContextProcessor)

Tout enregistrement Monolog passe par `App\Logging\SanitizeContextProcessor` avant l ecriture sur disque.

| Type | Remplacement |
|---|---|
| Clés sensibles (password, token, api_key, cvv, app_key...) | `[REDACTED]` |
| Tokens Sanctum (`442\|GshHwgQ...`) | `[REDACTED_SANCTUM_TOKEN]` |
| En-têtes Bearer | `Bearer [REDACTED]` |
| APP_KEY Laravel | `base64:[REDACTED_APP_KEY]` |
| Numéros de carte bancaire | `[REDACTED_CARD]` |

---

## 2. Niveaux de Log (8 Niveaux RFC 5424)

| Niveau | Méthode PHP | Utilisation |
|---|---|---|
| `DEBUG` | `Log::debug()` | Traces de développement |
| `INFO` | `Log::info()` | Événements normaux |
| `NOTICE` | `Log::notice()` | Conditions inhabituelles non critiques |
| `WARNING` | `Log::warning()` | Comportements inattendus |
| `ERROR` | `Log::error()` | Erreurs sans arrêt de service |
| `CRITICAL` | `Log::critical()` | Composant critique défaillant |
| `ALERT` | `Log::alert()` | Action immédiate requise |
| `EMERGENCY` | `Log::emergency()` | Système inutilisable |

---

## 3. Diagnostic en 7 Étapes

### Étape 1 — Script PowerShell Automatisé

```powershell
powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1
```

### Étape 2 — Endpoint Healthcheck API

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get | ConvertTo-Json
```

Réponse attendue (HTTP 200) :
```json
{
  "status": "healthy",
  "services": { "application":"ok","database":"ok","storage":"ok","logs":"ok","cache":"ok" }
}
```

### Étape 3 — Vérification des Logs Backend

```powershell
$today = (Get-Date).ToString("yyyy-MM-dd")
Get-Content "backend\storage\logs\laravel-$today.log" -Tail 50
```

### Étape 4 — Vérification du Backend

```powershell
cd backend && php artisan about
```

### Étape 5 — Vérification DB

```powershell
cd backend && php artisan db:show
```

### Étape 6 — Vérification des Ports

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3306   # MySQL
Test-NetConnection -ComputerName 127.0.0.1 -Port 8000   # Backend
Test-NetConnection -ComputerName localhost  -Port 5173   # Frontend
```

### Étape 7 — Tests Automatisés

```powershell
cd backend && php artisan test --filter=LoggingAndMonitoringTest
cd backend && php artisan test
```

---

## 4. Commandes de Maintenance des Logs

```powershell
# Simulation (aucune suppression)
php artisan hafrose:logs:clean --dry-run

# Nettoyage avec rétention 14 jours
php artisan hafrose:logs:clean --force

# Rétention personnalisée (30 jours)
php artisan hafrose:logs:clean --days=30 --force
```

### Alerte Taille Totale

Si `storage/logs/` dépasse **50 Mo**, exécuter :
```powershell
php artisan hafrose:logs:clean --days=7 --force
```

---

## 5. Sécurité Git

```powershell
# Aucune sortie ne doit apparaître
git ls-files backend/storage/logs/

# En cas d erreur accidentelle
git rm --cached backend/storage/logs/laravel.log
```

---

## 6. Monitoring Temps Réel (Développement)

```powershell
# Suivi en temps réel
$today = (Get-Date).ToString("yyyy-MM-dd")
Get-Content "backend\storage\logs\laravel-$today.log" -Wait -Tail 30

# Filtrage erreurs critiques
Select-String -Path "backend\storage\logs\*.log" -Pattern "\.(ERROR|CRITICAL|ALERT|EMERGENCY):"
```

---

## 7. Rotation & Rétention

La rotation est gérée nativement par Monolog `RotatingFileHandler` :

1. Nouveau fichier `laravel-YYYY-MM-DD.log` créé chaque jour.
2. Fichiers plus anciens que `LOG_DAILY_DAYS` (14j) supprimés automatiquement.
3. Aucune tâche cron requise.

---

## 8. Référence Rapide

| Action | Commande |
|---|---|
| Diagnostic complet | `powershell -ExecutionPolicy Bypass -File scripts\health-check.ps1` |
| Healthcheck API | `Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health"` |
| Lire log du jour | `Get-Content "backend\storage\logs\laravel-$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 50` |
| Erreurs uniquement | `Select-String -Path "backend\storage\logs\*.log" -Pattern "\.ERROR:"` |
| Nettoyage dry-run | `php artisan hafrose:logs:clean --dry-run` |
| Nettoyage 14j | `php artisan hafrose:logs:clean --days=14 --force` |
| Tests Phase 5.3 | `php artisan test --filter=LoggingAndMonitoringTest` |
| Suite complète | `php artisan test` |
