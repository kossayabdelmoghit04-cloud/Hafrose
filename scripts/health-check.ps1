# ==============================================================================
# HAFROSE - Script de Diagnostic et Monitoring Local (Windows PowerShell)
# ==============================================================================
# Usage :
#   .\scripts\health-check.ps1
#   .\scripts\health-check.ps1 -Detailed
#   .\scripts\health-check.ps1 -BackendUrl "http://127.0.0.1:8000"
# ==============================================================================

[CmdletBinding()]
param (
    [switch]$Detailed,
    [string]$BackendUrl = "http://127.0.0.1:8000",
    [string]$FrontendUrl = "http://localhost:3000",
    [int]$DbPort = 3306
)

$ErrorActionPreference = "Continue"

function Write-Pass([string]$label, [string]$detail) {
    Write-Host "  [" -NoNewline
    Write-Host "PASS" -ForegroundColor Green -NoNewline
    Write-Host "] $label - $detail"
}

function Write-WarnMsg([string]$label, [string]$detail) {
    Write-Host "  [" -NoNewline
    Write-Host "WARN" -ForegroundColor Yellow -NoNewline
    Write-Host "] $label - $detail"
}

function Write-Fail([string]$label, [string]$detail) {
    Write-Host "  [" -NoNewline
    Write-Host "FAIL" -ForegroundColor Red -NoNewline
    Write-Host "] $label - $detail"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       HAFROSE - Diagnostic & Monitoring Local (v5.4)       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "backend"
$FrontendDir = Join-Path -Path $ProjectRoot -ChildPath "frontend"

$globalPass = 0
$globalWarn = 0
$globalFail = 0

# 1. Prerequis & Outils Systeme
Write-Host "  [1/6] Prerequis Systeme & Runtimes" -ForegroundColor Magenta

# 1.1 PHP
$phpCmd = Get-Command "php" -ErrorAction SilentlyContinue
if ($phpCmd) {
    $phpVersionRaw = (& php -r "echo PHP_VERSION;")
    $phpMajorMinor = (& php -r "echo PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;")
    if ([version]$phpMajorMinor -ge [version]"8.2") {
        Write-Pass "PHP Runtime" "Version $phpVersionRaw (requis >= 8.2)"
        $globalPass++
    } else {
        Write-Fail "PHP Runtime" "Version $phpVersionRaw obsolete (requis >= 8.2)"
        $globalFail++
    }
} else {
    Write-Fail "PHP Runtime" "Binaire PHP introuvable dans le PATH"
    $globalFail++
}

# 1.2 Composer
$composerCmd = Get-Command "composer" -ErrorAction SilentlyContinue
if ($composerCmd) {
    $composerVer = (& composer --version 2>&1 | Select-Object -First 1)
    Write-Pass "Composer" $composerVer
    $globalPass++
} else {
    Write-WarnMsg "Composer" "Binaire introuvable dans le PATH"
    $globalWarn++
}

# 1.3 Node.js & npm
$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeVer = (& node -v)
    Write-Pass "Node.js" $nodeVer
    $globalPass++
} else {
    Write-Fail "Node.js" "Binaire Node introuvable"
    $globalFail++
}

$npmCmd = Get-Command "npm" -ErrorAction SilentlyContinue
if ($npmCmd) {
    $npmVer = (& npm -v)
    Write-Pass "npm CLI" "v$npmVer"
    $globalPass++
} else {
    Write-WarnMsg "npm CLI" "Binaire npm introuvable"
    $globalWarn++
}

Write-Host ""

# 2. Base de Donnees MySQL
Write-Host "  [2/6] Base de Donnees MySQL" -ForegroundColor Magenta

# 2.1 Test de port TCP 3306
$tcpDb = Test-NetConnection -ComputerName "127.0.0.1" -Port $DbPort -WarningAction SilentlyContinue
if ($tcpDb.TcpTestSucceeded) {
    Write-Pass "Port MySQL ($DbPort)" "Port ouvert et a l ecoute sur 127.0.0.1"
    $globalPass++
} else {
    Write-Fail "Port MySQL ($DbPort)" "Connexion TCP refusee sur 127.0.0.1:$DbPort"
    $globalFail++
}

# 2.2 Test requete reelle SELECT 1 via Artisan
try {
    $artisanPath = Join-Path $BackendDir "artisan"
    $dbTestOutput = (& php $artisanPath tinker --execute="echo DB::select('SELECT 1 as result')[0]->result;" 2>&1)
    if ($dbTestOutput -match "1") {
        Write-Pass "Connexion DB (PDO)" "Requete SELECT 1 executee avec succes"
        $globalPass++
    } else {
        Write-Fail "Connexion DB (PDO)" "Echec execution SQL : $dbTestOutput"
        $globalFail++
    }
} catch {
    Write-Fail "Connexion DB (PDO)" $_.Exception.Message
    $globalFail++
}

Write-Host ""

# 3. Backend API Laravel
Write-Host "  [3/6] Backend API Laravel" -ForegroundColor Magenta

$backendUri = [System.Uri]$BackendUrl
$tcpBackend = Test-NetConnection -ComputerName $backendUri.Host -Port $backendUri.Port -WarningAction SilentlyContinue
if ($tcpBackend.TcpTestSucceeded) {
    Write-Pass "Port Backend ($($backendUri.Port))" "Port ouvert sur $($backendUri.Host)"
    $globalPass++
} else {
    Write-Fail "Port Backend ($($backendUri.Port))" "Serveur Laravel non demarre sur $($backendUri.Host):$($backendUri.Port)"
    $globalFail++
}

# Requete GET /api/health
try {
    $healthUrl = "$BackendUrl/api/health"
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "healthy") {
        $appStat = $response.services.application
        $dbStat = $response.services.database
        $storageStat = $response.services.storage
        $logsStat = $response.services.logs
        Write-Pass "Endpoint /api/health" "Status = healthy (App: $appStat, DB: $dbStat, Storage: $storageStat, Logs: $logsStat)"
        $globalPass++
    } else {
        Write-WarnMsg "Endpoint /api/health" "Status = $($response.status)"
        $globalWarn++
    }
} catch {
    Write-Fail "Endpoint /api/health" "Erreur HTTP : $($_.Exception.Message)"
    $globalFail++
}

Write-Host ""

# 4. Frontend Web Application
Write-Host "  [4/6] Frontend Web Application" -ForegroundColor Magenta

$frontendUri = [System.Uri]$FrontendUrl
$tcpFrontend = Test-NetConnection -ComputerName $frontendUri.Host -Port $frontendUri.Port -WarningAction SilentlyContinue

if ($tcpFrontend.TcpTestSucceeded) {
    Write-Pass "Port Frontend ($($frontendUri.Port))" "Serveur Vite actif sur $($frontendUri.Host):$($frontendUri.Port)"
    $globalPass++
    
    try {
        $htmlRes = Invoke-WebRequest -Uri $FrontendUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($htmlRes.StatusCode -eq 200) {
            Write-Pass "Acces Frontend HTTP" "Page d accueil repond HTTP 200 OK"
            $globalPass++
        } else {
            Write-WarnMsg "Acces Frontend HTTP" "Code statut HTTP : $($htmlRes.StatusCode)"
            $globalWarn++
        }
    } catch {
        Write-WarnMsg "Acces Frontend HTTP" $_.Exception.Message
        $globalWarn++
    }
} else {
    Write-WarnMsg "Port Frontend ($($frontendUri.Port))" "Serveur Vite non detecte sur $($frontendUri.Host):$($frontendUri.Port)"
    $globalWarn++
}

Write-Host ""

# 5. Stockage & Permissions
Write-Host "  [5/6] Stockage & Permissions Locales" -ForegroundColor Magenta

$storageDirs = @(
    (Join-Path $BackendDir "storage"),
    (Join-Path $BackendDir "storage\logs"),
    (Join-Path $BackendDir "storage\framework\cache"),
    (Join-Path $BackendDir "storage\framework\views"),
    (Join-Path $BackendDir "bootstrap\cache")
)

foreach ($dir in $storageDirs) {
    $rel = $dir.Replace($ProjectRoot, "").TrimStart("\/")
    if (Test-Path $dir) {
        $probe = Join-Path $dir ".probe_health_$(Get-Random).tmp"
        try {
            [System.IO.File]::WriteAllText($probe, "probe")
            [System.IO.File]::Delete($probe)
            Write-Pass "Dossier $rel" "Accessible en ecriture"
            $globalPass++
        } catch {
            Write-Fail "Dossier $rel" "Non inscriptible : $($_.Exception.Message)"
            $globalFail++
        }
    } else {
        Write-Fail "Dossier $rel" "Repertoire introuvable"
        $globalFail++
    }
}

Write-Host ""

# 6. Systeme de Logs & Retention
Write-Host "  [6/6] Systeme de Logs & Retention" -ForegroundColor Magenta

$logsFolder = Join-Path $BackendDir "storage\logs"
if (Test-Path $logsFolder) {
    $logFiles = Get-ChildItem -Path $logsFolder -Filter "*.log" -File
    $todayDate = (Get-Date).ToString("yyyy-MM-dd")
    $todayLogName = "laravel-$todayDate.log"
    $todayLogPath = Join-Path $logsFolder $todayLogName
    $legacyLogPath = Join-Path $logsFolder "laravel.log"

    $hasActiveLog = (Test-Path $todayLogPath) -or (Test-Path $legacyLogPath)
    if ($hasActiveLog) {
        Write-Pass "Fichier Log Actif" "Journalisation operationnelle pour aujourd hui"
        $globalPass++
    } else {
        Write-WarnMsg "Fichier Log Actif" "Aucun fichier de log recent detecte"
        $globalWarn++
    }

    $totalLogBytes = ($logFiles | Measure-Object -Property Length -Sum).Sum
    $totalLogMb = [math]::Round($totalLogBytes / 1MB, 2)
    if ($totalLogMb -gt 50) {
        Write-WarnMsg "Taille des Logs" "$totalLogMb Mo (> 50 Mo - lancer php artisan hafrose:logs:clean)"
        $globalWarn++
    } else {
        Write-Pass "Taille des Logs" "$totalLogMb Mo (seuil alerte 50 Mo)"
        $globalPass++
    }

    $logGitignore = Join-Path $logsFolder ".gitignore"
    if (Test-Path $logGitignore) {
        Write-Pass "Securite Git Logs" ".gitignore present dans storage/logs"
        $globalPass++
    } else {
        Write-WarnMsg "Securite Git Logs" ".gitignore manquant dans storage/logs"
        $globalWarn++
    }
} else {
    Write-Fail "Dossier Logs" "Repertoire storage/logs introuvable"
    $globalFail++
}

Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor Gray
Write-Host "  RESUME DU DIAGNOSTIC LOCAL :" -ForegroundColor Cyan
Write-Host "  Controles reussis   : " -NoNewline
Write-Host "$globalPass PASS" -ForegroundColor Green
Write-Host "  Avertissements      : " -NoNewline
Write-Host "$globalWarn WARN" -ForegroundColor Yellow
Write-Host "  Erreurs critiques   : " -NoNewline
Write-Host "$globalFail FAIL" -ForegroundColor Red
Write-Host "------------------------------------------------------------" -ForegroundColor Gray
Write-Host ""

if ($globalFail -gt 0) {
    Write-Host "  [ECHEC] Des composants critiques sont defaillants." -ForegroundColor Red
    exit 1
} elseif ($globalWarn -gt 0) {
    Write-Host "  [SUCCES AVEC RESERVES] Les services critiques fonctionnent, avertissements detectes." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "  [SUCCES COMPLET] Tous les indicateurs d environnement local sont au vert." -ForegroundColor Green
    exit 0
}
