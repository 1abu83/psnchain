#!/bin/bash

# PSNChain VPS Upload and Deployment Script
# This script uploads the project to VPS and runs deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
VPS_HOST="root@147.93.81.226"
VPS_IP="147.93.81.226"
PROJECT_NAME="psnchain"
REMOTE_DIR="/root/$PROJECT_NAME"

print_status "Starting PSNChain upload to VPS..."
print_status "VPS Host: $VPS_HOST"
print_status "Remote Directory: $REMOTE_DIR"

# Test SSH connection
print_status "Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $VPS_HOST exit 2>/dev/null; then
    print_error "Cannot connect to VPS. Please check:"
    print_error "1. SSH key is properly configured"
    print_error "2. VPS is accessible"
    print_error "3. Host address is correct"
    exit 1
fi
print_success "SSH connection successful"

# Create remote directory
print_status "Creating remote directory..."
ssh $VPS_HOST "mkdir -p $REMOTE_DIR"

# Create exclusion list for rsync
print_status "Preparing files for upload..."
cat > .rsync-exclude << EOF
.git/
node_modules/
.next/
dist/
*.log
.env
.env.local
.DS_Store
Thumbs.db
*.tmp
*.temp
coverage/
.nyc_output/
.cache/
EOF

# Upload project files using rsync
print_status "Uploading project files..."
rsync -avz --progress --exclude-from=.rsync-exclude \
    --delete \
    ./ $VPS_HOST:$REMOTE_DIR/

# Clean up temporary files
rm -f .rsync-exclude

print_success "Files uploaded successfully"

# Make deployment scripts executable
print_status "Setting up deployment scripts..."
ssh $VPS_HOST "cd $REMOTE_DIR && chmod +x *.sh"

# Copy environment examples to actual env files if they don't exist
print_status "Setting up environment files..."
ssh $VPS_HOST "cd $REMOTE_DIR && \
    if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi && \
    if [ ! -f fontend/.env.local ]; then cp fontend/.env.example fontend/.env.local; fi"

# Update environment files with VPS IP
print_status "Configuring environment for VPS..."
ssh $VPS_HOST "cd $REMOTE_DIR && \
    sed -i 's/NODE_ENV=.*/NODE_ENV=production/' backend/.env && \
    sed -i 's/API_PORT=.*/API_PORT=3001/' backend/.env && \
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=http://$VPS_IP:3000|' backend/.env && \
    sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$VPS_IP:3001/api|' fontend/.env.local && \
    sed -i 's|NEXT_PUBLIC_WS_URL=.*|NEXT_PUBLIC_WS_URL=ws://$VPS_IP:3001|' fontend/.env.local"

print_success "Environment configured for VPS IP: $VPS_IP"

# Ask user which deployment option they prefer
echo ""
echo "🚀 Choose deployment option:"
echo "1. Backend-only deployment (Recommended for development)"
echo "2. Full-stack deployment with Docker"
echo "3. Manual setup (just upload files)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_status "Running backend-only deployment..."
        ssh $VPS_HOST "cd $REMOTE_DIR && ./deploy-backend-only.sh $VPS_IP"
        
        print_success "Backend deployment completed!"
        echo ""
        echo "📋 Next Steps:"
        echo "=============="
        echo "1. Your backend API is running at: http://$VPS_IP:3001/api"
        echo "2. Test the API: curl http://$VPS_IP:3001/api/health"
        echo "3. Run frontend locally and connect to VPS API"
        echo "4. Update your local frontend/.env.local with:"
        echo "   NEXT_PUBLIC_API_URL=http://$VPS_IP:3001/api"
        echo "   NEXT_PUBLIC_WS_URL=ws://$VPS_IP:3001"
        ;;
    2)
        print_status "Running full-stack deployment..."
        ssh $VPS_HOST "cd $REMOTE_DIR && ./deploy-vps.sh $VPS_IP admin@example.com"
        
        print_success "Full-stack deployment completed!"
        echo ""
        echo "📋 Access Your Application:"
        echo "=========================="
        echo "Frontend: http://$VPS_IP:3000"
        echo "Backend API: http://$VPS_IP:3001/api"
        echo "Health Check: http://$VPS_IP:3001/api/health"
        ;;
    3)
        print_status "Files uploaded successfully. Manual setup required."
        echo ""
        echo "📋 Manual Setup Instructions:"
        echo "============================="
        echo "1. SSH to your VPS: ssh $VPS_HOST"
        echo "2. Navigate to project: cd $REMOTE_DIR"
        echo "3. Review environment files: backend/.env and fontend/.env.local"
        echo "4. Choose deployment method:"
        echo "   - Backend only: ./deploy-backend-only.sh $VPS_IP"
        echo "   - Full stack: ./deploy-vps.sh $VPS_IP admin@example.com"
        echo "   - Docker: docker-compose up -d"
        ;;
    *)
        print_error "Invalid choice. Files uploaded but no deployment performed."
        exit 1
        ;;
esac

# Show final status
echo ""
print_success "🎉 PSNChain upload completed!"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "SSH to VPS: ssh $VPS_HOST"
echo "Check API health: curl http://$VPS_IP:3001/api/health"
echo "View backend logs: ssh $VPS_HOST 'cd $REMOTE_DIR && pm2 logs psnchain-api'"
echo "Restart services: ssh $VPS_HOST 'cd $REMOTE_DIR && pm2 restart all'"
echo ""
echo "📁 Remote project location: $REMOTE_DIR"
echo "🌐 VPS IP: $VPS_IP"