# PWA Icon Generator Script
# This script helps generate all required PWA icons from a source image

Write-Host "PWA Icon Generator for CivicAid" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if ImageMagick is installed
$imageMagickInstalled = Get-Command magick -ErrorAction SilentlyContinue

if (-not $imageMagickInstalled) {
    Write-Host "ImageMagick is not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To generate icons, you have two options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Install ImageMagick" -ForegroundColor White
    Write-Host "  1. Download from: https://imagemagick.org/script/download.php" -ForegroundColor Gray
    Write-Host "  2. Install and restart PowerShell" -ForegroundColor Gray
    Write-Host "  3. Run this script again" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 2: Use an online tool" -ForegroundColor White
    Write-Host "  1. Visit: https://realfavicongenerator.net/" -ForegroundColor Gray
    Write-Host "  2. Upload your logo (recommend 512x512 or larger)" -ForegroundColor Gray
    Write-Host "  3. Download generated icons" -ForegroundColor Gray
    Write-Host "  4. Place them in the public/icons/ folder" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Required icon sizes: 72, 96, 128, 144, 152, 192, 384, 512" -ForegroundColor Yellow
    exit
}

# Prompt for source image
Write-Host "Place your source image (512x512 or larger PNG) in the project root" -ForegroundColor Cyan
Write-Host "and enter the filename (e.g., logo.png):" -ForegroundColor Cyan
$sourceImage = Read-Host

if (-not (Test-Path $sourceImage)) {
    Write-Host "Error: File not found: $sourceImage" -ForegroundColor Red
    exit
}

# Create icons directory if it doesn't exist
$iconsDir = "public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

# Generate icons
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

Write-Host ""
Write-Host "Generating icons..." -ForegroundColor Green

foreach ($size in $sizes) {
    $outputFile = "$iconsDir\icon-${size}x${size}.png"
    Write-Host "Creating ${size}x${size}..." -ForegroundColor Gray
    magick convert $sourceImage -resize "${size}x${size}" $outputFile
}

Write-Host ""
Write-Host "✓ All icons generated successfully!" -ForegroundColor Green
Write-Host "Icons saved to: $iconsDir" -ForegroundColor Cyan
