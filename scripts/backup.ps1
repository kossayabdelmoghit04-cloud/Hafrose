# ==============================================================================
# HAFROSE — Script de Sauvegarde Locale Automatisée (Windows PowerShell)
# ==============================================================================
# Usage :
#   .\scripts\backup.ps1
#   .\scripts\backup.ps1 -DryRun
#   .\scripts\backup.ps1 -Force
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Force,
    [switch]$Detailed = $true
)

$ErrorActionPreference = "Stop"

# Détermination des chemins relatifs
$ProjectRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "backend"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       HAFROSE - Sauvegarde Locale (Windows PowerShell)     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Dossier racine  : $ProjectRoot" -ForegroundColor Gray
Write-Host "  Dossier backend : $BackendDir" -ForegroundColor Gray

# 1. Vérification des prérequis
if (-not (Get-Command "php" -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  [ERREUR] PHP n'est pas disponible dans le PATH système." -ForegroundColor Red
    Write-Host "  Veuillez vérifier l'installation de PHP." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackendDir)) {
    Write-Host ""
    Write-Host "  [ERREUR] Le dossier backend est introuvable : $BackendDir" -ForegroundColor Red
    exit 1
}

# 2. Construction des arguments Artisan
$ArtisanArgs = @("artisan", "hafrose:backup")

if ($Detailed) {
    $ArtisanArgs += "--detailed"
}
if ($DryRun) {
    $ArtisanArgs += "--dry-run"
}
if ($Force) {
    $ArtisanArgs += "--force"
}

# 3. Exécution de la sauvegarde
Push-Location -Path $BackendDir
try {
    Write-Host "  Exécution de la commande Artisan..." -ForegroundColor Cyan
    & php $ArtisanArgs
    $ExitCode = $LASTEXITCODE

    if ($ExitCode -ne 0) {
        Write-Host ""
        Write-Host "  [ERREUR] La sauvegarde a échoué (Code sortie: $ExitCode)." -ForegroundColor Red
        exit $ExitCode
    }

    # 4. Vérification immédiate d'intégrité si ce n'est pas un dry-run
    if (-not $DryRun) {
        Write-Host ""
        Write-Host "  Vérification d'intégrité de la sauvegarde générée..." -ForegroundColor Yellow
        & php artisan hafrose:backup:verify --latest
        $VerifyCode = $LASTEXITCODE

        if ($VerifyCode -eq 0) {
            Write-Host ""
            Write-Host "  [SUCCÈS] Sauvegarde locale créée et vérifiée avec succès." -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "  [ATTENTION] La sauvegarde a été créée mais l'audit d'intégrité a signalé des anomalies." -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "  [INFO] Simulation dry-run terminée sans écriture." -ForegroundColor Cyan
    }
}
finally {
    Pop-Location
}
