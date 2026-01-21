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

$destination = if ([System.IO.Path]::IsPathRooted($OutFile)) {
  $OutFile
} else {
  Join-Path $root $OutFile
}
$archiveName = [System.IO.Path]::GetFileName($destination)

$exclude = @(".git", "node_modules", "dev", "src", "scripts", $archiveName)
$items = Get-ChildItem -Force |
  Where-Object { $exclude -notcontains $_.Name } |
  ForEach-Object { $_.FullName }

if ($items.Count -eq 0) {
  throw "No files to package."
}

Compress-Archive -Path $items -DestinationPath $destination -Force
Write-Host "Created $destination"
