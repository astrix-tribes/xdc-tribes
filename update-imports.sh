#!/bin/bash

# Find all files that import from WalletProvider
files=$(grep -l "import.*WalletProvider" $(find ./src -name "*.tsx" -o -name "*.ts"))

# For each file, update the import statement and usage
for file in $files; do
  # Skip the WalletProvider.tsx file itself
  if [[ "$file" == "./src/app/components/WalletProvider.tsx" ]]; then
    continue
  fi
  
  # Skip the Web3AuthProvider.tsx file if it exists
  if [[ "$file" == "./src/app/components/Web3AuthProvider.tsx" ]]; then
    continue
  fi
  
  # Update the import statement
  sed -i '' "s/import { useWallet } from '.*WalletProvider'/import { useWallet } from '..\/..\/app\/components\/Web3AuthProvider'/g" "$file"
  sed -i '' "s/import { useWallet } from '.*\/WalletProvider'/import { useWallet } from '..\/Web3AuthProvider'/g" "$file"
  sed -i '' "s/import { WalletProvider } from/import { Web3AuthProvider } from/g" "$file"
  
  # Update component usage if present
  sed -i '' "s/<WalletProvider>/<Web3AuthProvider>/g" "$file"
  sed -i '' "s/<\/WalletProvider>/<\/Web3AuthProvider>/g" "$file"
  
  echo "Updated $file"
done

echo "All imports updated!" 