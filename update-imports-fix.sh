#!/bin/bash

# Find all files that have the problematic import
files=$(grep -l "import.*from '../../app/components/Web3AuthProvider'" $(find ./src -name "*.tsx" -o -name "*.ts"))

# For each file, fix the import path
for file in $files; do
  # Update the import paths based on the file's location
  dirname=$(dirname "$file")
  relative_path=$(python3 -c "import os.path; print(os.path.relpath('$(pwd)/src/app/components', '$dirname'))")
  
  # Update the import statement
  sed -i '' "s|import { useWallet } from '../../app/components/Web3AuthProvider'|import { useWallet } from '$relative_path/Web3AuthProvider'|g" "$file"
  
  echo "Updated $file"
done

# Handle other special cases
grep -l "import.*from '../app/components/Web3AuthProvider'" $(find ./src -name "*.tsx" -o -name "*.ts") | while read file; do
  sed -i '' "s|import { useWallet } from '../app/components/Web3AuthProvider'|import { useWallet } from '../app/components/Web3AuthProvider'|g" "$file"
  echo "Updated $file"
done

# Fix specific contexts
sed -i '' "s|import { useWallet } from '../app/components/Web3AuthProvider'|import { useWallet } from '../app/components/Web3AuthProvider'|g" src/context/PostsContext.tsx
sed -i '' "s|import { useWallet } from '../app/components/Web3AuthProvider'|import { useWallet } from '../app/components/Web3AuthProvider'|g" src/context/EventsContext.tsx
sed -i '' "s|import { useWallet } from '../app/components/Web3AuthProvider'|import { useWallet } from '../app/components/Web3AuthProvider'|g" src/context/ProfileContext.tsx

echo "All imports fixed!" 