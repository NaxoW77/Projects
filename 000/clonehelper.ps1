# ================================
# GitHub Downloader - Full Power
# ================================

# Ir al directorio donde está el script
Set-Location $PSScriptRoot

# Crear carpeta 'download' si no existe
$downloadDir = Join-Path $PSScriptRoot "download"
if (!(Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

# GitHub Downloader
Write-Host "==============================="
Write-Host "GitHub Downloader"
Write-Host "==============================="

$url = Read-Host "Enter GitHub file or folder URL"

if ($url -like "*blob*") {
    # Es un archivo
    $rawUrl = $url -replace "/blob/", "/raw/"
    $fileName = Split-Path $url -Leaf
    Write-Host "Downloading file $fileName ..."
    Invoke-WebRequest -Uri $rawUrl -OutFile (Join-Path $downloadDir $fileName)
} elseif ($url -like "*tree*") {
    # Es una carpeta
    $repo = "https://github.com/NaxoW77/Projects.git"
    $folder = ($url -split "/tree/main/")[1]
    # Decodificar URL para espacios y caracteres especiales
    $folderDecoded = [System.Uri]::UnescapeDataString($folder)
    Write-Host "Downloading folder '$folderDecoded' with Git sparse-checkout ..."

    # Crear carpeta temporal dentro de download
    $tempDir = Join-Path $downloadDir "temp_repo"
    if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    Set-Location $tempDir

    git init
    git remote add origin $repo
    git config core.sparseCheckout true

    # Escribir carpeta en sparse-checkout
    $folderDecoded | Out-File -Encoding ASCII .git/info/sparse-checkout
    git pull origin main

    # Mover la carpeta descargada a download
    Move-Item -Path (Join-Path $tempDir $folderDecoded) -Destination $downloadDir

    # Borrar carpeta temporal
    Set-Location $downloadDir
    Remove-Item -Recurse -Force $tempDir
} else {
    Write-Host "URL no reconocida. Debe ser un archivo (/blob/) o carpeta (/tree/)"
}

Write-Host "Done!"
Pause
