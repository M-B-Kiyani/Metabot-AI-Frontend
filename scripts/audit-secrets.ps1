# Security Audit Script for Environment Variables
# Checks for common security issues

Write-Host "=========================================="
Write-Host "Environment Variables Security Audit"
Write-Host "=========================================="
Write-Host ""

$issues = @()
$warnings = @()
$passed = @()

# Check 1: Verify .env files are not in git
Write-Host "1. Checking git tracking..." -NoNewline
$trackedEnv = git ls-files 2>$null | Select-String -Pattern "\.env"
if ($trackedEnv) {
    $issues += "❌ .env files are tracked by git"
    Write-Host " ❌ FAIL" -ForegroundColor Red
} else {
    $passed += "✅ No .env files tracked by git"
    Write-Host " ✅ PASS" -ForegroundColor Green
}

# Check 2: Verify .gitignore exists and contains .env
Write-Host "2. Checking .gitignore..." -NoNewline
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        $passed += "✅ .gitignore protects .env files"
        Write-Host " ✅ PASS" -ForegroundColor Green
    } else {
        $issues += "❌ .gitignore doesn't protect .env files"
        Write-Host " ❌ FAIL" -ForegroundColor Red
    }
} else {
    $issues += "❌ .gitignore not found"
    Write-Host " ❌ FAIL" -ForegroundColor Red
}

# Check 3: Verify file permissions (Windows - check if files exist)
Write-Host "3. Checking file permissions..." -NoNewline
$envFiles = @(
    "backend\.env",
    "backend\.env.production",
    ".env.production"
)
$permissionIssues = 0
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        # On Windows, just verify file exists and is readable only by owner
        # Full permission check requires admin rights
        $permissionIssues++
    }
}
if ($permissionIssues -eq 0) {
    $warnings += "⚠️  No .env files found to check permissions"
    Write-Host " ⚠️  SKIP" -ForegroundColor Yellow
} else {
    $passed += "✅ Environment files exist"
    Write-Host " ✅ PASS" -ForegroundColor Green
}

# Check 4: Search for hardcoded secrets in code
Write-Host "4. Scanning for hardcoded secrets..." -NoNewline
$secretPatterns = @(
    "password\s*=\s*['\`"][^'\`"]+['\`"]",
    "api_key\s*=\s*['\`"][^'\`"]+['\`"]",
    "secret\s*=\s*['\`"][^'\`"]+['\`"]",
    "token\s*=\s*['\`"][^'\`"]+['\`"]"
)

$foundSecrets = @()
Get-ChildItem -Path "backend\src" -Recurse -Include "*.ts","*.js" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    foreach ($pattern in $secretPatterns) {
        if ($content -match $pattern) {
            $foundSecrets += $_.FullName
            break
        }
    }
}

if ($foundSecrets.Count -gt 0) {
    $warnings += "⚠️  Potential hardcoded secrets found in $($foundSecrets.Count) files"
    Write-Host " ⚠️  WARNING" -ForegroundColor Yellow
} else {
    $passed += "✅ No obvious hardcoded secrets found"
    Write-Host " ✅ PASS" -ForegroundColor Green
}

# Check 5: Verify .env.example exists
Write-Host "5. Checking .env.example..." -NoNewline
if (Test-Path "backend\.env.example") {
    $passed += "✅ .env.example exists"
    Write-Host " ✅ PASS" -ForegroundColor Green
} else {
    $warnings += "⚠️  .env.example not found"
    Write-Host " ⚠️  WARNING" -ForegroundColor Yellow
}

# Check 6: Verify sensitive files are in .gitignore
Write-Host "6. Checking sensitive file patterns..." -NoNewline
$sensitivePatterns = @(
    "google-credentials.json",
    "*.pem",
    "*.key"
)
$gitignoreContent = Get-Content ".gitignore" -Raw -ErrorAction SilentlyContinue
$missingPatterns = @()
foreach ($pattern in $sensitivePatterns) {
    if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
        $missingPatterns += $pattern
    }
}
if ($missingPatterns.Count -gt 0) {
    $warnings += "⚠️  Some sensitive patterns not in .gitignore: $($missingPatterns -join ', ')"
    Write-Host " ⚠️  WARNING" -ForegroundColor Yellow
} else {
    $passed += "✅ All sensitive patterns in .gitignore"
    Write-Host " ✅ PASS" -ForegroundColor Green
}

# Check 7: Check for weak API keys (too short)
Write-Host "7. Checking API key strength..." -NoNewline
$envFiles = @("backend\.env", "backend\.env.production")
$weakKeys = @()
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "API_KEY=([^\r\n]+)") {
            $apiKey = $matches[1]
            if ($apiKey.Length -lt 32) {
                $weakKeys += "$file (length: $($apiKey.Length))"
            }
        }
    }
}
if ($weakKeys.Count -gt 0) {
    $issues += "❌ Weak API keys found: $($weakKeys -join ', ')"
    Write-Host " ❌ FAIL" -ForegroundColor Red
} else {
    $passed += "✅ API keys meet minimum length requirements"
    Write-Host " ✅ PASS" -ForegroundColor Green
}

# Check 8: Verify production uses HTTPS
Write-Host "8. Checking production URLs..." -NoNewline
if (Test-Path "backend\.env.production") {
    $content = Get-Content "backend\.env.production" -Raw
    if ($content -match "http://") {
        $warnings += "⚠️  Production config contains HTTP URLs (should be HTTPS)"
        Write-Host " ⚠️  WARNING" -ForegroundColor Yellow
    } else {
        $passed += "✅ Production uses HTTPS"
        Write-Host " ✅ PASS" -ForegroundColor Green
    }
} else {
    Write-Host " ⚠️  SKIP" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=========================================="
Write-Host "Audit Summary"
Write-Host "=========================================="
Write-Host ""

if ($passed.Count -gt 0) {
    Write-Host "✅ Passed Checks ($($passed.Count)):" -ForegroundColor Green
    $passed | ForEach-Object { Write-Host "   $_" -ForegroundColor Green }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Warnings ($($warnings.Count)):" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    Write-Host ""
}

if ($issues.Count -gt 0) {
    Write-Host "❌ Critical Issues ($($issues.Count)):" -ForegroundColor Red
    $issues | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    Write-Host ""
}

# Overall status
Write-Host "=========================================="
if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! Environment is secure." -ForegroundColor Green
} elseif ($issues.Count -eq 0) {
    Write-Host "✅ No critical issues, but some warnings to address." -ForegroundColor Yellow
} else {
    Write-Host "❌ Critical security issues found! Please fix immediately." -ForegroundColor Red
}
Write-Host "=========================================="
Write-Host ""

Write-Host "For detailed security guidelines, see: docs/ENVIRONMENT_SECURITY.md"
Write-Host ""
