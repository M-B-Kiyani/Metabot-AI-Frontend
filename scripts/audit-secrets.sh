#!/bin/bash

# Security Audit Script for Environment Variables
# Checks for common security issues

echo "=========================================="
echo "Environment Variables Security Audit"
echo "=========================================="
echo ""

ISSUES=()
WARNINGS=()
PASSED=()

# Check 1: Verify .env files are not in git
echo -n "1. Checking git tracking..."
TRACKED_ENV=$(git ls-files 2>/dev/null | grep "\.env")
if [ -n "$TRACKED_ENV" ]; then
    ISSUES+=("❌ .env files are tracked by git")
    echo " ❌ FAIL"
else
    PASSED+=("✅ No .env files tracked by git")
    echo " ✅ PASS"
fi

# Check 2: Verify .gitignore exists and contains .env
echo -n "2. Checking .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q "\.env" ".gitignore"; then
        PASSED+=("✅ .gitignore protects .env files")
        echo " ✅ PASS"
    else
        ISSUES+=("❌ .gitignore doesn't protect .env files")
        echo " ❌ FAIL"
    fi
else
    ISSUES+=("❌ .gitignore not found")
    echo " ❌ FAIL"
fi

# Check 3: Verify file permissions
echo -n "3. Checking file permissions..."
ENV_FILES=(
    "backend/.env"
    "backend/.env.production"
    ".env.production"
)
PERMISSION_ISSUES=0
for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        PERMS=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%A" "$file" 2>/dev/null)
        if [ "$PERMS" != "600" ]; then
            PERMISSION_ISSUES=$((PERMISSION_ISSUES + 1))
        fi
    fi
done
if [ $PERMISSION_ISSUES -gt 0 ]; then
    WARNINGS+=("⚠️  $PERMISSION_ISSUES files don't have 600 permissions")
    echo " ⚠️  WARNING"
else
    PASSED+=("✅ File permissions are secure (600)")
    echo " ✅ PASS"
fi

# Check 4: Search for hardcoded secrets in code
echo -n "4. Scanning for hardcoded secrets..."
FOUND_SECRETS=$(grep -r -E "(password|api_key|secret|token)\s*=\s*['\"][^'\"]+['\"]" \
    backend/src --include="*.ts" --include="*.js" 2>/dev/null | wc -l)
if [ "$FOUND_SECRETS" -gt 0 ]; then
    WARNINGS+=("⚠️  Potential hardcoded secrets found in $FOUND_SECRETS locations")
    echo " ⚠️  WARNING"
else
    PASSED+=("✅ No obvious hardcoded secrets found")
    echo " ✅ PASS"
fi

# Check 5: Verify .env.example exists
echo -n "5. Checking .env.example..."
if [ -f "backend/.env.example" ]; then
    PASSED+=("✅ .env.example exists")
    echo " ✅ PASS"
else
    WARNINGS+=("⚠️  .env.example not found")
    echo " ⚠️  WARNING"
fi

# Check 6: Verify sensitive files are in .gitignore
echo -n "6. Checking sensitive file patterns..."
SENSITIVE_PATTERNS=(
    "google-credentials.json"
    "*.pem"
    "*.key"
)
MISSING_PATTERNS=()
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if ! grep -q "$pattern" ".gitignore" 2>/dev/null; then
        MISSING_PATTERNS+=("$pattern")
    fi
done
if [ ${#MISSING_PATTERNS[@]} -gt 0 ]; then
    WARNINGS+=("⚠️  Some sensitive patterns not in .gitignore: ${MISSING_PATTERNS[*]}")
    echo " ⚠️  WARNING"
else
    PASSED+=("✅ All sensitive patterns in .gitignore")
    echo " ✅ PASS"
fi

# Check 7: Check for weak API keys (too short)
echo -n "7. Checking API key strength..."
WEAK_KEYS=()
for file in "backend/.env" "backend/.env.production"; do
    if [ -f "$file" ]; then
        API_KEY=$(grep "^API_KEY=" "$file" | cut -d'=' -f2)
        if [ -n "$API_KEY" ] && [ ${#API_KEY} -lt 32 ]; then
            WEAK_KEYS+=("$file (length: ${#API_KEY})")
        fi
    fi
done
if [ ${#WEAK_KEYS[@]} -gt 0 ]; then
    ISSUES+=("❌ Weak API keys found: ${WEAK_KEYS[*]}")
    echo " ❌ FAIL"
else
    PASSED+=("✅ API keys meet minimum length requirements")
    echo " ✅ PASS"
fi

# Check 8: Verify production uses HTTPS
echo -n "8. Checking production URLs..."
if [ -f "backend/.env.production" ]; then
    if grep -q "http://" "backend/.env.production"; then
        WARNINGS+=("⚠️  Production config contains HTTP URLs (should be HTTPS)")
        echo " ⚠️  WARNING"
    else
        PASSED+=("✅ Production uses HTTPS")
        echo " ✅ PASS"
    fi
else
    echo " ⚠️  SKIP"
fi

# Summary
echo ""
echo "=========================================="
echo "Audit Summary"
echo "=========================================="
echo ""

if [ ${#PASSED[@]} -gt 0 ]; then
    echo "✅ Passed Checks (${#PASSED[@]}):"
    for item in "${PASSED[@]}"; do
        echo "   $item"
    done
    echo ""
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo "⚠️  Warnings (${#WARNINGS[@]}):"
    for item in "${WARNINGS[@]}"; do
        echo "   $item"
    done
    echo ""
fi

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo "❌ Critical Issues (${#ISSUES[@]}):"
    for item in "${ISSUES[@]}"; do
        echo "   $item"
    done
    echo ""
fi

# Overall status
echo "=========================================="
if [ ${#ISSUES[@]} -eq 0 ] && [ ${#WARNINGS[@]} -eq 0 ]; then
    echo "🎉 All checks passed! Environment is secure."
elif [ ${#ISSUES[@]} -eq 0 ]; then
    echo "✅ No critical issues, but some warnings to address."
else
    echo "❌ Critical security issues found! Please fix immediately."
fi
echo "=========================================="
echo ""

echo "For detailed security guidelines, see: docs/ENVIRONMENT_SECURITY.md"
echo ""
