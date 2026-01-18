param(
  [string]$OutFile = "theme-organization.zip",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

if (-not $SkipBuild) {
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "pnpm not found in PATH."
  }
  pnpm run build
}

$exclude = @(".git", "node_modules", "dev", "src", "scripts")
$items = Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object { $_.Name }

if ($items.Count -eq 0) {
  throw "No files to package."
}

Compress-Archive -Path $items -DestinationPath $OutFile -Force
Write-Host "Created $OutFile"
