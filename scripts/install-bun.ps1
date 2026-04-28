$BunVersion = "1.2.23"

if (Get-Command bun -ErrorAction SilentlyContinue) {
    $installed = bun --version 2>$null
    if ($installed -eq $BunVersion) {
        Write-Host "bun $BunVersion is already installed."
        exit 0
    }
    Write-Host "bun $installed is installed; upgrading to $BunVersion..."
}

$env:BUN_INSTALL_VERSION = $BunVersion
irm bun.sh/install.ps1 | iex

Write-Host "bun $BunVersion installed successfully."
