#!/bin/bash

echo "🚀 PSNChain Developer Wallet Setup"
echo "==================================="
echo ""

echo "📝 This script will:"
echo "  1. Create a new developer wallet"
echo "  2. Allocate 100,000,000 PSN coins"
echo "  3. Setup blockchain with genesis allocation"
echo "  4. Save wallet information"
echo ""

echo "⚠️  WARNING: This will clear existing blockchain data!"
echo "   Make sure you have backups if needed."
echo ""

read -p "Do you want to continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "🚀 Running developer wallet setup..."
node setup-developer-wallet.js

echo ""
echo "✅ Setup complete! Check the output above for your wallet details."
echo ""
