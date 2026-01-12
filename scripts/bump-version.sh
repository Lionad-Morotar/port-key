#!/bin/bash
set -e

DRY_RUN=false
VERSION_TYPE=""

# Parse arguments
for arg in "$@"; do
  if [ "$arg" == "--dry-run" ]; then
    DRY_RUN=true
  elif [[ "$arg" =~ ^(patch|minor|major)$ ]]; then
    VERSION_TYPE=$arg
  fi
done

if [ -z "$VERSION_TYPE" ]; then
  VERSION_TYPE="patch"
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./packages/core/package.json').version")

# Calculate next version using simple node script
NEXT_VERSION=$(node -e "
  const parts = '$CURRENT_VERSION'.split('.').map(Number);
  const type = '$VERSION_TYPE';
  if (type === 'major') { parts[0]++; parts[1]=0; parts[2]=0; }
  else if (type === 'minor') { parts[1]++; parts[2]=0; }
  else { parts[2]++; }
  console.log(parts.join('.'));
")

# Check changelogs unless it's a dry run
if [ "$DRY_RUN" = false ]; then
  echo "Checking CHANGELOG.md updates..."
  MISSING_CHANGELOGS=()
  
  # Find all package directories (excluding node_modules)
  PACKAGES=$(find packages -mindepth 1 -maxdepth 1 -type d)
  
  for pkg in $PACKAGES; do
    CHANGELOG="$pkg/CHANGELOG.md"
    
    # Check if CHANGELOG.md exists
    if [ ! -f "$CHANGELOG" ]; then
      MISSING_CHANGELOGS+=("$pkg (CHANGELOG.md missing)")
      continue
    fi
    
    # Check if CHANGELOG.md has been modified in git staging area or working tree
    if ! git diff --name-only HEAD | grep -q "^$CHANGELOG$"; then
      MISSING_CHANGELOGS+=("$pkg")
    fi
  done
  
  if [ ${#MISSING_CHANGELOGS[@]} -ne 0 ]; then
    echo "Error: The following packages have no CHANGELOG.md updates:"
    for pkg in "${MISSING_CHANGELOGS[@]}"; do
      echo "  - $pkg"
    done
    echo ""
    echo "Please update CHANGELOG.md for all packages before bumping version."
    exit 1
  fi
  echo "All changelogs updated."
fi

if [ "$DRY_RUN" = true ]; then
  echo "=== DRY RUN MODE ==="
  echo "Current version: $CURRENT_VERSION"
  echo "Next version:    $NEXT_VERSION"
  echo ""
  echo "The following commands would be executed:"
  echo "  1. pnpm -r exec npm version $VERSION_TYPE --no-git-tag-version"
  echo "  2. Update version in packages/mcp/src/mcp-server.ts"
  echo "  3. pnpm install"
  echo "  4. git add ."
  echo "  5. git commit -m \"release: v$NEXT_VERSION\" --no-verify"
  echo "  6. git tag \"v$NEXT_VERSION\""
  echo "===================="
  exit 0
fi

echo "Bumping versions ($VERSION_TYPE)..."

# Bump version in all packages
pnpm -r exec npm version $VERSION_TYPE --no-git-tag-version

# Get the new version from core package (double check)
NEW_VERSION=$(node -p "require('./packages/core/package.json').version")

echo "New version: $NEW_VERSION"

# Update MCP Server version in mcp-server.ts
echo "Updating MCP Server version to $NEW_VERSION..."
node -e "
const fs = require('fs');
const path = './packages/mcp/src/mcp-server.ts';
try {
  const content = fs.readFileSync(path, 'utf8');
  const lines = content.split('\n');
  const markerIndex = lines.findIndex(line => line.includes('// ! AUTO GENERATED VERSION - DO NOT EDIT'));
  
  if (markerIndex !== -1 && markerIndex + 1 < lines.length) {
    const markerLine = lines[markerIndex];
    const indentation = markerLine.match(/^\\s*/)[0];
    lines[markerIndex + 1] = indentation + 'version: \"$NEW_VERSION\",';
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully updated mcp-server.ts');
  } else {
    console.error('Could not find version marker in mcp-server.ts');
    process.exit(1);
  }
} catch (err) {
  console.error('Error updating mcp-server.ts:', err);
  process.exit(1);
}
"

# Update lockfile just in case
pnpm install

# Stage changes
git add .

# Commit
echo "Committing release: v$NEW_VERSION"
git commit -m "release: v$NEW_VERSION" --no-verify

# Tag
echo "Tagging v$NEW_VERSION"
git tag "v$NEW_VERSION"

echo "Done! Version bumped to v$NEW_VERSION"
