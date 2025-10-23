# Generate Strong JWT Secret
# Run this script to generate a cryptographically secure JWT secret

Write-Host "=== JWT Secret Generator ===" -ForegroundColor Cyan
Write-Host ""

# Generate a 32-character random string using cryptographic random number generator
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "Your JWT Secret (copy this):" -ForegroundColor Green
Write-Host ""
Write-Host $secret -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: Use this EXACT secret for BOTH services!" -ForegroundColor Red
Write-Host ""
Write-Host "Add this to BOTH Render services as environment variable:" -ForegroundColor Cyan
Write-Host "FALTA_EMS_JWT_SECRET=$secret" -ForegroundColor Gray
Write-Host ""

# Also save to a file
$secret | Out-File -FilePath "jwt-secret.txt" -NoNewline
Write-Host "Secret also saved to: jwt-secret.txt" -ForegroundColor Green
Write-Host "⚠️  Don't commit this file to git!" -ForegroundColor Yellow
