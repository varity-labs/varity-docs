#!/bin/bash

# Varity Cursor Rules Installation Script
# This script installs all Varity Cursor rules to your project

set -e

echo "🚀 Installing Varity Cursor Rules..."

# Create .cursor/rules directory if it doesn't exist
mkdir -p .cursor/rules

# Base URL for downloading rules
BASE_URL="https://docs.varity.so/cursor-rules"

# List of rule files to download
RULES=(
  "varity-deploy.mdc"
  "varity-auth.mdc"
  "varity-storage.mdc"
  "varity-errors.mdc"
  "varity-testing.mdc"
  "varity-typescript.mdc"
  "varity-performance.mdc"
  "varity-contracts.mdc"
)

# Download each rule file
for rule in "${RULES[@]}"; do
  echo "  📥 Downloading $rule..."
  curl -f -s -o ".cursor/rules/$rule" "$BASE_URL/$rule" || {
    echo "  ❌ Failed to download $rule"
    exit 1
  }
done

echo ""
echo "✅ All Varity Cursor rules installed successfully!"
echo ""
echo "Installed rules:"
for rule in "${RULES[@]}"; do
  echo "  ✓ $rule"
done

echo ""
echo "🎉 You can now use Varity-specific AI assistance in Cursor!"
echo ""
echo "Usage:"
echo "  1. Open Cursor"
echo "  2. Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)"
echo "  3. Ask questions about Varity development"
echo ""
echo "Example prompts:"
echo "  - 'How do I deploy my app to Varity?'"
echo "  - 'Set up authentication with social login'"
echo "  - 'Upload files to Varity storage'"
echo ""
echo "Learn more: https://docs.varity.so/ai-tools/cursor-rules"
