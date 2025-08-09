# Simple PSNChain Upload Script
# Just uploads files to VPS without deployment

param(
    [string]$VpsHost = "root@147.93.81.226",
    [string]$RemoteDir = "/root/psnchain"
)

Write-Host "🚀 Uploading PSNChain to VPS..." -ForegroundColor Blue
Write-Host "VPS: $VpsHost" -ForegroundColor Yellow
Write-Host "Remote Directory: $RemoteDir" -ForegroundColor Yellow

# Create remote directory
Write-Host "Creating remote directory..." -ForegroundColor Blue
ssh $VpsHost "mkdir -p $RemoteDir"

# Upload files
Write-Host "Uploading backend..." -ForegroundColor Blue
scp -r backend $VpsHost`:$RemoteDir/

Write-Host "Uploading frontend..." -ForegroundColor Blue
scp -r fontend $VpsHost`:$RemoteDir/

Write-Host "Uploading nginx config..." -ForegroundColor Blue
scp -r nginx $VpsHost`:$RemoteDir/

Write-Host "Uploading deployment scripts..." -ForegroundColor Blue
scp deploy-*.sh $VpsHost`:$RemoteDir/
scp docker-compose.yml $VpsHost`:$RemoteDir/
scp *.md $VpsHost`:$RemoteDir/

# Make scripts executable
Write-Host "Making scripts executable..." -ForegroundColor Blue
ssh $VpsHost "cd $RemoteDir && chmod +x *.sh"

Write-Host "✅ Upload completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. SSH to VPS: ssh $VpsHost"
Write-Host "2. Navigate to project: cd $RemoteDir"
Write-Host "3. Run deployment: ./deploy-backend-only.sh 147.93.81.226"
Write-Host ""
Write-Host "Or run this script to deploy backend only:" -ForegroundColor Yellow
Write-Host "ssh $VpsHost 'cd $RemoteDir && ./deploy-backend-only.sh 147.93.81.226'"