# ==============================================================================
# HAFROSE — Script d'Audit d'Intégrité de Sauvegarde (Windows PowerShell)
# ==============================================================================
# Usage :
#   .\scripts\verify-backup.ps1
#   .\scripts\verify-backup.ps1 -Latest
#   .\scripts\verify-backup.ps1 -BackupId hafrose-backup_2026-09-09_12-00-00
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BackupId,
    [switch]$Latest
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Get-Item -Path $PSScriptRoot).Parent.FullName
$BackendDir = Join-Path -Path $ProjectRoot -ChildPath "backend"

if (-not (Get-Command "php" -ErrorAction SilentlyContinue)) {
    Write-Host "[ERREUR] PHP n'est pas disponible dans le PATH système." -ForegroundColor Red
    exit 1
}

$ArtisanArgs = @("artisan", "hafrose:backup:verify")

if ($BackupId) {
    $ArtisanArgs += $BackupId
}
if ($Latest) {
    $ArtisanArgs += "--latest"
}

Push-Location -Path $BackendDir
try {
    & php $ArtisanArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
