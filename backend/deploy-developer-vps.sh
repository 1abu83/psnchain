#!/bin/bash

# PSNChain Developer Wallet VPS Deployment
# This script deploys the developer wallet setup to your VPS

VPS_IP="147.93.81.226"
VPS_USER="root"
BACKUP_DIR="./backup-$(date +%Y%m%d-%H%M%S)"

echo "🚀 PSNChain Developer Wallet VPS Deployment"
echo "============================================"
echo ""

echo "📝 This script will:"
echo "  1. Backup existing VPS data"
echo "  2. Upload developer wallet setup"
echo "  3. Run setup on VPS"
echo "  4. Restart blockchain service"
echo ""

echo "⚠️  WARNING: This will clear existing blockchain data on VPS!"
echo "   Make sure you have backups if needed."
echo ""

read -p "Do you want to continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🔧 Step 1: Creating backup directory..."
mkdir -p "$BACKUP_DIR"

echo ""
echo "📦 Step 2: Backing up existing VPS data..."
ssh $VPS_USER@$VPS_IP "mkdir -p /tmp/psnchain-backup && cp -r /root/psnchain/src/storage/* /tmp/psnchain-backup/ 2>/dev/null || echo 'No existing data to backup'"

echo ""
echo "📤 Step 3: Uploading files to VPS..."
scp -r ./src $VPS_USER@$VPS_IP:/root/psnchain/
scp ./setup-developer-wallet.js $VPS_USER@$VPS_IP:/root/psnchain/
scp ./package.json $VPS_USER@$VPS_IP:/root/psnchain/

echo ""
echo "🔧 Step 4: Installing dependencies on VPS..."
ssh $VPS_USER@$VPS_IP "cd /root/psnchain && npm install"

echo ""
echo "🚀 Step 5: Running developer wallet setup on VPS..."
ssh $VPS_USER@$VPS_IP "cd /root/psnchain && node setup-developer-wallet.js"

echo ""
echo "🔄 Step 6: Restarting blockchain service..."
ssh $VPS_USER@$VPS_IP "pm2 reload psnchain-api || pm2 start ecosystem.config.js"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check VPS logs: pm2 logs psnchain-api"
echo "  2. Verify developer wallet balance via API"
echo "  3. Test transactions with developer wallet"
echo ""
echo "🔗 API endpoints:"
echo "  - Health: http://$VPS_IP:3001/api/health"
echo "  - Balance: http://$VPS_IP:3001/api/balance/{ADDRESS}"
echo "  - Blockchain info: http://$VPS_IP:3001/api/blockchain/info"
echo ""
