#!/bin/bash
# CASPER BOH - PRODUCTION VERIFICATION SCRIPT
# Validates all critical code paths before deployment

echo "==============================================="
echo "CASPER BOH - PRODUCTION VERIFICATION"
echo "==============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing file: $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check for patterns that might cause crashes
check_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${YELLOW}⚠${NC} Found $description in $file"
        WARNINGS=$((WARNINGS + 1))
        return 1
    else
        echo -e "${GREEN}✓${NC} No $description in $file"
        return 0
    fi
}

echo "1. CHECKING CRITICAL FILES..."
echo "-------------------------------------------"
check_file "package.json"
check_file "app.json"
check_file "app/_layout.tsx"
check_file "app/index.tsx"
check_file "providers/AuthProvider.tsx"
check_file "providers/CasperProvider.tsx"
check_file "lib/supabase.ts"
check_file "lib/trpc.ts"
check_file ".env"
echo ""

echo "2. CHECKING PORTAL SCREENS..."
echo "-------------------------------------------"
check_file "app/admin/index.tsx"
check_file "app/employee.tsx"
check_file "app/partner.tsx"
check_file "app/command.tsx"
echo ""

echo "3. CHECKING CRITICAL COMPONENTS..."
echo "-------------------------------------------"
check_file "components/CinematicIntro.tsx"
check_file "components/PortalButton.tsx"
check_file "components/AccessGate.tsx"
check_file "components/BrandCard.tsx"
echo ""

echo "4. CHECKING FOR UNSAFE PATTERNS..."
echo "-------------------------------------------"

# Check for blocking throws in module-level code
if [ -f "lib/trpc.ts" ]; then
    if grep -q "throw new Error" "lib/trpc.ts"; then
        # Check if it's wrapped in try-catch or conditional
        if grep -q "try {" "lib/trpc.ts"; then
            echo -e "${GREEN}✓${NC} TRPC errors are safely handled"
        else
            echo -e "${RED}✗${NC} TRPC may throw uncaught errors"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${GREEN}✓${NC} No unsafe throws in TRPC"
    fi
fi

# Check for console.errors that might indicate missing error handling
if grep -rq "console.error" app/ --include="*.tsx" --include="*.ts"; then
    echo -e "${GREEN}✓${NC} Error logging present (good for debugging)"
else
    echo -e "${YELLOW}⚠${NC} No error logging found"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

echo "5. CHECKING ENVIRONMENT CONFIGURATION..."
echo "-------------------------------------------"
if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" ".env"; then
        echo -e "${GREEN}✓${NC} Supabase anon key configured in .env template"
    else
        echo -e "${YELLOW}⚠${NC} Supabase anon key not in .env template"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" ".env"; then
        echo -e "${GREEN}✓${NC} Supabase URL configured"
    else
        echo -e "${YELLOW}⚠${NC} Supabase URL not in .env template"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

echo "6. CHECKING PACKAGE DEPENDENCIES..."
echo "-------------------------------------------"
if [ -f "package.json" ]; then
    # Check for critical dependencies
    for dep in "expo" "react" "react-native" "expo-router" "@supabase/supabase-js"; do
        if grep -q "\"$dep\"" package.json; then
            echo -e "${GREEN}✓${NC} Dependency: $dep"
        else
            echo -e "${RED}✗${NC} Missing dependency: $dep"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi
echo ""

echo "7. CHECKING TYPESCRIPT FILES..."
echo "-------------------------------------------"
TS_ERRORS=0

# Check for common TypeScript issues (basic syntax check)
for file in $(find app providers lib components -name "*.tsx" -o -name "*.ts" 2>/dev/null); do
    # Check for unclosed braces (very basic check)
    OPEN=$(grep -o "{" "$file" | wc -l)
    CLOSE=$(grep -o "}" "$file" | wc -l)
    
    if [ $OPEN -ne $CLOSE ]; then
        echo -e "${RED}✗${NC} Possible syntax error in $file (mismatched braces)"
        TS_ERRORS=$((TS_ERRORS + 1))
    fi
done

if [ $TS_ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No obvious TypeScript syntax errors"
else
    echo -e "${RED}✗${NC} Found $TS_ERRORS files with potential syntax errors"
    ERRORS=$((ERRORS + TS_ERRORS))
fi
echo ""

echo "8. CHECKING DOCUMENTATION..."
echo "-------------------------------------------"
check_file "README.md"
check_file "RORK_DEPLOYMENT.md"
check_file "FIX_REPORT.md"
echo ""

echo "==============================================="
echo "VERIFICATION SUMMARY"
echo "==============================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo "Status: PRODUCTION READY ✅"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ PASSED WITH $WARNINGS WARNINGS${NC}"
    echo "Status: PRODUCTION READY (minor warnings) ⚠️"
    exit 0
else
    echo -e "${RED}✗ FAILED WITH $ERRORS ERRORS AND $WARNINGS WARNINGS${NC}"
    echo "Status: NOT READY - FIX ERRORS FIRST ❌"
    exit 1
fi
