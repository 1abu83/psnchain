# PSNChain VPS Upload and Deployment Script (PowerShell)
# This script uploads the project to VPS and runs deployment

param(
    [string]$VpsHost = "root@147.93.81.226",
    [string]$VpsIP = "147.93.81.226",
    [string]$ProjectName = "psnchain",
    [string]$RemoteDir = "/root/psnchain"
)

function Write-Status {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Status "Starting PSNChain upload to VPS..."
Write-Status "VPS Host: $VpsHost"
Write-Status "Remote Directory: $RemoteDir"

# Test SSH connection
Write-Status "Testing SSH connection..."
try {
    $testResult = ssh -o ConnectTimeout=10 -o BatchMode=yes $VpsHost "exit" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "SSH connection failed"
    }
    Write-Success "SSH connection successful"
} catch {
    Write-Error "Cannot connect to VPS. Please check:"
    Write-Error "1. SSH key is properly configured"
    Write-Error "2. VPS is accessible"
    Write-Error "3. Host address is correct"
    exit 1
}

# Create remote directory
Write-Status "Creating remote directory..."
ssh $VpsHost "mkdir -p $RemoteDir"

# Create exclusion list for scp
Write-Status "Preparing files for upload..."
$excludeItems = @(
    ".git",
    "node_modules",
    ".next",
    "dist",
    "*.log",
    ".env",
    ".env.local",
    ".DS_Store",
    "Thumbs.db",
    "*.tmp",
    "*.temp",
    "coverage",
    ".nyc_output",
    ".cache"
)

# Upload project files using scp
Write-Status "Uploading project files..."

# Upload main directories
Write-Status "Uploading backend..."
scp -r backend $VpsHost`:$RemoteDir/

Write-Status "Uploading frontend..."
scp -r fontend $VpsHost`:$RemoteDir/

Write-Status "Uploading nginx config..."
scp -r nginx $VpsHost`:$RemoteDir/

Write-Status "Uploading deployment scripts..."
scp deploy-*.sh $VpsHost`:$RemoteDir/
scp docker-compose.yml $VpsHost`:$RemoteDir/
scp README.md $VpsHost`:$RemoteDir/
scp DEPLOYMENT_INSTRUCTIONS.md $VpsHost`:$RemoteDir/

Write-Success "Files uploaded successfully"

# Make deployment scripts executable
Write-Status "Setting up deployment scripts..."
ssh $VpsHost "cd $RemoteDir && chmod +x *.sh"

# Copy environment examples to actual env files if they don't exist
Write-Status "Setting up environment files..."
ssh $VpsHost "cd $RemoteDir && if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi && if [ ! -f fontend/.env.local ]; then cp fontend/.env.example fontend/.env.local; fi"

# Update environment files with VPS IP
Write-Status "Configuring environment for VPS..."
ssh $VpsHost "cd $RemoteDir && sed -i 's/NODE_ENV=.*/NODE_ENV=production/' backend/.env && sed -i 's/API_PORT=.*/API_PORT=3001/' backend/.env && sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=http://$VpsIP:3000|' backend/.env && sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$VpsIP:3001/api|' fontend/.env.local && sed -i 's|NEXT_PUBLIC_WS_URL=.*|NEXT_PUBLIC_WS_URL=ws://$VpsIP:3001|' fontend/.env.local"

Write-Success "Environment configured for VPS IP: $VpsIP"

# Ask user which deployment option they prefer
Write-Host ""
Write-Host "🚀 Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Backend-only deployment (Recommended for development)"
Write-Host "2. Full-stack deployment with Docker"
Write-Host "3. Manual setup (just upload files)"
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Status "Running backend-only deployment..."
        ssh $VpsHost "cd $RemoteDir && ./deploy-backend-only.sh $VpsIP"
        
        Write-Success "Backend deployment completed!"
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Cyan
        Write-Host "=============="
        Write-Host "1. Your backend API is running at: http://$VpsIP:3001/api"
        Write-Host "2. Test the API: curl http://$VpsIP:3001/api/health"
        Write-Host "3. Run frontend locally and connect to VPS API"
        Write-Host "4. Update your local frontend/.env.local with:"
        Write-Host "   NEXT_PUBLIC_API_URL=http://$VpsIP:3001/api"
        Write-Host "   NEXT_PUBLIC_WS_URL=ws://$VpsIP:3001"
    }
    "2" {
        Write-Status "Running full-stack deployment..."
        ssh $VpsHost "cd $RemoteDir && ./deploy-vps.sh $VpsIP admin@example.com"
        
        Write-Success "Full-stack deployment completed!"
        Write-Host ""
        Write-Host "📋 Access Your Application:" -ForegroundColor Cyan
        Write-Host "=========================="
        Write-Host "Frontend: http://$VpsIP:3000"
        Write-Host "Backend API: http://$VpsIP:3001/api"
        Write-Host "Health Check: http://$VpsIP:3001/api/health"
    }
    "3" {
        Write-Status "Files uploaded successfully. Manual setup required."
        Write-Host ""
        Write-Host "📋 Manual Setup Instructions:" -ForegroundColor Cyan
        Write-Host "============================="
        Write-Host "1. SSH to your VPS: ssh $VpsHost"
        Write-Host "2. Navigate to project: cd $RemoteDir"
        Write-Host "3. Review environment files: backend/.env and fontend/.env.local"
        Write-Host "4. Choose deployment method:"
        Write-Host "   - Backend only: ./deploy-backend-only.sh $VpsIP"
        Write-Host "   - Full stack: ./deploy-vps.sh $VpsIP admin@example.com"
        Write-Host "   - Docker: docker-compose up -d"
    }
    default {
        Write-Error "Invalid choice. Files uploaded but no deployment performed."
        exit 1
    }
}

# Show final status
Write-Host ""
Write-Success "🎉 PSNChain upload completed!"
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "==================="
Write-Host "SSH to VPS: ssh $VpsHost"
Write-Host "Check API health: curl http://$VpsIP:3001/api/health"
Write-Host "View backend logs: ssh $VpsHost 'cd $RemoteDir && pm2 logs psnchain-api'"
Write-Host "Restart services: ssh $VpsHost 'cd $RemoteDir && pm2 restart all'"
Write-Host ""
Write-Host "📁 Remote project location: $RemoteDir"
Write-Host "🌐 VPS IP: $VpsIP"