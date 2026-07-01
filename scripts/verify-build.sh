#!/bin/bash

# Build Verification Script for DESIGN.md Playground
# Verifies all packages build successfully for deployment

set -e

echo "=========================================="
echo "DESIGN.md Build Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check command exit status
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    FAILURES=$((FAILURES + 1))
  fi
}

echo "Step 1: Installing dependencies..."
bun install --production=false
check_status "Dependency installation"
echo ""

echo "Step 2: Building design-core package..."
cd packages/design-core
bun run build
check_status "design-core build"
cd ../..
echo ""

echo "Step 3: Building CLI package..."
cd packages/cli
bun run build
check_status "CLI build"
cd ../..
echo ""

echo "Step 4: Building MCP server..."
cd packages/mcp-server
bun run build
check_status "MCP server build"
cd ../..
echo ""

echo "Step 5: Building playground..."
cd packages/playground
bun run build
check_status "Playground build"
cd ../..
echo ""

echo "Step 6: Verifying build artifacts..."
if [ -d "packages/design-core/dist" ]; then
  echo -e "${GREEN}✓ design-core artifacts found${NC}"
else
  echo -e "${RED}✗ design-core artifacts missing${NC}"
  FAILURES=$((FAILURES + 1))
fi

if [ -d "packages/playground/dist" ]; then
  echo -e "${GREEN}✓ Playground artifacts found${NC}"
else
  echo -e "${RED}✗ Playground artifacts missing${NC}"
  FAILURES=$((FAILURES + 1))
fi

if [ -d "packages/mcp-server/dist" ]; then
  echo -e "${GREEN}✓ MCP server artifacts found${NC}"
else
  echo -e "${RED}✗ MCP server artifacts missing${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

echo "Step 7: Checking artifact sizes..."
PLAYGROUND_SIZE=$(du -sh packages/playground/dist 2>/dev/null | cut -f1)
MCP_SIZE=$(du -sh packages/mcp-server/dist 2>/dev/null | cut -f1)
CORE_SIZE=$(du -sh packages/design-core/dist 2>/dev/null | cut -f1)

echo "Artifact sizes:"
echo "  Playground: $PLAYGROUND_SIZE"
echo "  MCP Server: $MCP_SIZE"
echo "  Design Core: $CORE_SIZE"
echo ""

echo "=========================================="
if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}All checks passed! Ready for deployment.${NC}"
  echo "=========================================="
  exit 0
else
  echo -e "${RED}$FAILURES check(s) failed! Please fix issues before deploying.${NC}"
  echo "=========================================="
  exit 1
fi
