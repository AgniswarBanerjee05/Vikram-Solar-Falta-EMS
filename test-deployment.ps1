# Backend Deployment Test Script
# Use this to test your deployed backend APIs

$adminApiUrl = Read-Host "Enter your Admin API URL (e.g., https://falta-ems-admin-api.onrender.com)"
$userApiUrl = Read-Host "Enter your User API URL (e.g., https://falta-ems-user-api.onrender.com)"

Write-Host "`n=== Testing Backend Deployment ===" -ForegroundColor Cyan

# Test Admin API Health
Write-Host "`n1. Testing Admin API Health..." -ForegroundColor Yellow
try {
    $adminHealth = Invoke-RestMethod -Uri "$adminApiUrl/health" -Method Get
    Write-Host "✓ Admin API is healthy: $($adminHealth | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "✗ Admin API health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test User API Health
Write-Host "`n2. Testing User API Health..." -ForegroundColor Yellow
try {
    $userHealth = Invoke-RestMethod -Uri "$userApiUrl/health" -Method Get
    Write-Host "✓ User API is healthy: $($userHealth | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "✗ User API health check failed: $_" -ForegroundColor Red
    exit 1
}

# Ask if user wants to create admin account
Write-Host "`n3. Would you like to create an admin account? (Y/N)" -ForegroundColor Yellow
$createAdmin = Read-Host

if ($createAdmin -eq "Y" -or $createAdmin -eq "y") {
    $adminEmail = Read-Host "Enter admin email"
    $adminPassword = Read-Host "Enter admin password" -AsSecureString
    $adminPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword))
    $adminFullName = Read-Host "Enter admin full name"
    
    $adminBody = @{
        email = $adminEmail
        password = $adminPasswordText
        fullName = $adminFullName
    } | ConvertTo-Json
    
    try {
        $adminResponse = Invoke-RestMethod -Uri "$adminApiUrl/api/admin/register" -Method Post -Body $adminBody -ContentType "application/json"
        Write-Host "✓ Admin account created successfully!" -ForegroundColor Green
        Write-Host "Admin ID: $($adminResponse.admin.id)" -ForegroundColor Cyan
        Write-Host "Admin Email: $($adminResponse.admin.email)" -ForegroundColor Cyan
        Write-Host "Token: $($adminResponse.token.Substring(0, 20))..." -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Failed to create admin account: $_" -ForegroundColor Red
        Write-Host "This is normal if an admin already exists." -ForegroundColor Yellow
    }
}

Write-Host "`n=== Deployment Test Complete ===" -ForegroundColor Cyan
Write-Host "`nYour backend is deployed and ready!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.production with these URLs:" -ForegroundColor White
Write-Host "   VITE_ADMIN_API_URL=$adminApiUrl" -ForegroundColor Gray
Write-Host "   VITE_USER_API_URL=$userApiUrl" -ForegroundColor Gray
Write-Host "2. Run: npm run build" -ForegroundColor White
Write-Host "3. Run: npm run deploy" -ForegroundColor White
Write-Host "4. Visit your GitHub Pages site and test login" -ForegroundColor White
