# ==============================================================================
# HAFROSE — Script de Restauration Locale (Windows PowerShell)
# ==============================================================================
# Usage :
#   .\scripts\restore.ps1
#   .\scripts\restore.ps1 -BackupId hafrose-backup_2026-09-09_12-00-00
#   .\scripts\restore.ps1 -TargetDb hafrose_restore_test -Force
#   .\scripts\restore.ps1 -DryRun
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BackupId,
    [string]$TargetDb,
    [switch]$NoDb,
    [switch]$NoStorage,
    [switch]$NoImages,
    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "backend"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "      HAFROSE - Restauration Locale (Windows PowerShell)    " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Dossier racine  : $ProjectRoot" -ForegroundColor Gray
Write-Host "  Dossier backend : $BackendDir" -ForegroundColor Gray

if (-not (Get-Command "php" -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "  [ERREUR] PHP n'est pas disponible dans le PATH système." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackendDir)) {
    Write-Host ""
    Write-Host "  [ERREUR] Le dossier backend est introuvable : $BackendDir" -ForegroundColor Red
    exit 1
}

# Construction des arguments Artisan
$ArtisanArgs = @("artisan", "hafrose:restore")

if ($BackupId) {
    $ArtisanArgs += $BackupId
}
if ($TargetDb) {
    $ArtisanArgs += "--target-db=$TargetDb"
}
if ($NoDb) {
    $ArtisanArgs += "--no-db"
}
if ($NoStorage) {
    $ArtisanArgs += "--no-storage"
}
if ($NoImages) {
    $ArtisanArgs += "--no-images"
}
if ($Force) {
    $ArtisanArgs += "--force"
}
if ($DryRun) {
    $ArtisanArgs += "--dry-run"
}

Push-Location -Path $BackendDir
try {
    & php $ArtisanArgs
    $ExitCode = $LASTEXITCODE

    if ($ExitCode -ne 0) {
        Write-Host ""
        Write-Host "  [ERREUR] La restauration a rencontré une erreur (Code: $ExitCode)." -ForegroundColor Red
        exit $ExitCode
    } else {
        Write-Host ""
        Write-Host "  [SUCCÈS] Opération de restauration achevée avec succès." -ForegroundColor Green
    }
}
finally {
    Pop-Location
}
