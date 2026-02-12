param(
  [string]$OutFileName,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$themeYamlPath = Join-Path $root "theme.yaml"
if (-not (Test-Path $themeYamlPath)) {
  throw "theme.yaml not found."
}

$themeYamlRaw = Get-Content -Path $themeYamlPath -Raw -Encoding UTF8

$nameMatch = [regex]::Match($themeYamlRaw, "(?m)^\s*name:\s*([A-Za-z0-9._-]+)\s*$")
if (-not $nameMatch.Success) {
  throw "Cannot find theme name in theme.yaml."
}
$themeName = $nameMatch.Groups[1].Value

$versionPattern = "(?m)^(\s*version:\s*)(\d+\.\d+\.\d+)(\s*)$"
$versionMatch = [regex]::Match($themeYamlRaw, $versionPattern)
if (-not $versionMatch.Success) {
  throw "Cannot find spec.version with SemVer format (x.y.z) in theme.yaml."
}

$currentVersion = $versionMatch.Groups[2].Value
$parts = $currentVersion.Split(".")
$newVersion = "{0}.{1}.{2}" -f [int]$parts[0], [int]$parts[1], ([int]$parts[2] + 1)
$updatedThemeYamlRaw = [regex]::Replace(
  $themeYamlRaw,
  $versionPattern,
  ('$1' + $newVersion + '$3'),
  1
)
Set-Content -Path $themeYamlPath -Value $updatedThemeYamlRaw -Encoding UTF8
Write-Host "Version bumped: $currentVersion -> $newVersion"

if (-not $SkipBuild) {
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "pnpm not found in PATH."
  }
  pnpm run build
}

$buildDir = Join-Path $root "build"
if (-not (Test-Path $buildDir)) {
  New-Item -ItemType Directory -Path $buildDir | Out-Null
}

$finalOutFileName = if ([string]::IsNullOrWhiteSpace($OutFileName)) {
  "$themeName-$newVersion.zip"
} else {
  $OutFileName
}

if (-not $finalOutFileName.EndsWith(".zip", [System.StringComparison]::OrdinalIgnoreCase)) {
  $finalOutFileName = "$finalOutFileName.zip"
}

$destination = Join-Path $buildDir $finalOutFileName
$archiveName = [System.IO.Path]::GetFileName($destination)

$exclude = @(".git", "node_modules", "dev", "src", "scripts", "build", $archiveName)

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
