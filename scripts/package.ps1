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

$rootItems = Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name }
if ($rootItems.Count -eq 0) {
  throw "No files to package."
}

if (Test-Path $destination) {
  Remove-Item -Force $destination
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($item in $rootItems) {
    if ($item.PSIsContainer) {
      $files = Get-ChildItem -Force -File -Recurse -Path $item.FullName
    } else {
      $files = @($item)
    }
    foreach ($file in $files) {
      $relativePath = Resolve-Path -Relative -Path $file.FullName
      $relativePath = $relativePath -replace '^[.][\\/]', ''
      $entryName = $relativePath.Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $zip,
        $file.FullName,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null
    }
  }
} finally {
  $zip.Dispose()
}

Write-Host "Created $destination"
