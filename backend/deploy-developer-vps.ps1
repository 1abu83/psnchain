# PSNChain Developer Wallet VPS Deployment
# This script deploys the developer wallet setup to your VPS

param(
    [string]$VPS_IP = "147.93.81.226",
    [string]$VPS_USER = "root"
)

$BACKUP_DIR = "./backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "🚀 PSNChain Developer Wallet VPS Deployment" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📝 This script will:" -ForegroundColor Yellow
Write-Host "  1. Backup existing VPS data" -ForegroundColor White
Write-Host "  2. Upload developer wallet setup" -ForegroundColor White
Write-Host "  3. Run setup on VPS" -ForegroundColor White
Write-Host "  4. Restart blockchain service" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  WARNING: This will clear existing blockchain data on VPS!" -ForegroundColor Red
Write-Host "   Make sure you have backups if needed." -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Do you want to continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "🔧 Step 1: Creating backup directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null

Write-Host ""
Write-Host "📦 Step 2: Backing up existing VPS data..." -ForegroundColor Cyan
ssh $VPS_USER@$VPS_IP "mkdir -p /tmp/psnchain-backup && cp -r /root/psnchain/src/storage/* /tmp/psnchain-backup/ 2>/dev/null || echo 'No existing data to backup'"

Write-Host ""
Write-Host "📤 Step 3: Uploading files to VPS..." -ForegroundColor Cyan
scp -r ./src $VPS_USER@$VPS_IP:/root/psnchain/
scp ./setup-developer-wallet.js $VPS_USER@$VPS_IP:/root/psnchain/
scp ./package.json $VPS_USER@$VPS_IP:/root/psnchain/

Write-Host ""
Write-Host "🔧 Step 4: Installing dependencies on VPS..." -ForegroundColor Cyan
ssh $VPS_USER@$VPS_IP "cd /root/psnchain && npm install"

Write-Host ""
Write-Host "🚀 Step 5: Running developer wallet setup on VPS..." -ForegroundColor Cyan
ssh $VPS_USER@$VPS_IP "cd /root/psnchain && node setup-developer-wallet.js"

Write-Host ""
Write-Host "🔄 Step 6: Restarting blockchain service..." -ForegroundColor Cyan
ssh $VPS_USER@$VPS_IP "pm2 reload psnchain-api || pm2 start ecosystem.config.js"

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Check VPS logs: pm2 logs psnchain-api" -ForegroundColor White
Write-Host "  2. Verify developer wallet balance via API" -ForegroundColor White
Write-Host "  3. Test transactions with developer wallet" -ForegroundColor White
Write-Host ""
Write-Host "🔗 API endpoints:" -ForegroundColor Yellow
Write-Host "  - Health: http://$VPS_IP`:3001/api/health" -ForegroundColor White
Write-Host "  - Balance: http://$VPS_IP`:3001/api/balance/{ADDRESS}" -ForegroundColor White
Write-Host "  - Blockchain info: http://$VPS_IP`:3001/api/blockchain/info" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue..."
