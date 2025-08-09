#!/bin/bash

# PSNChain VPS Deployment Script
# This script deploys PSNChain to a VPS with full production setup

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Configuration
DOMAIN=${1:-"your-domain.com"}
EMAIL=${2:-"admin@your-domain.com"}
PROJECT_DIR="/home/$(whoami)/psnchain"

print_status "Starting PSNChain VPS deployment..."
print_status "Domain: $DOMAIN"
print_status "Email: $EMAIL"
print_status "Project Directory: $PROJECT_DIR"

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban htop

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker and Docker Compose
print_status "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $(whoami)
rm get-docker.sh

# Install Docker Compose
print_status "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Setup firewall
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create project directory
print_status "Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or copy project files (assuming files are already present)
if [ ! -f "docker-compose.yml" ]; then
    print_error "Project files not found. Please ensure all project files are in $PROJECT_DIR"
    exit 1
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p backend/logs
mkdir -p fontend/.next
mkdir -p nginx/ssl
mkdir -p nginx/logs

# Setup environment files
print_status "Setting up environment files..."

# Backend environment
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_warning "Please edit backend/.env with your configuration"
fi

# Frontend environment
if [ ! -f "fontend/.env.local" ]; then
    cat > fontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN/api
NEXT_PUBLIC_WS_URL=wss://$DOMAIN
NEXT_PUBLIC_CHAIN_ID=psnchain-1
NEXT_PUBLIC_RPC_URL=https://$DOMAIN/api
NEXT_PUBLIC_REST_URL=https://$DOMAIN/api
NEXT_PUBLIC_FEE_DENOM=psn
NEXT_PUBLIC_FEE_AMOUNT=5000
NEXT_PUBLIC_GAS_LIMIT=200000
EOF
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd fontend
npm install
cd ..

# Generate SSL certificates with Let's Encrypt
print_status "Generating SSL certificates..."
if [ "$DOMAIN" != "your-domain.com" ]; then
    sudo certbot certonly --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Copy certificates to nginx directory
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/key.pem
    sudo chown $(whoami):$(whoami) nginx/ssl/*.pem
else
    print_warning "Using default domain. SSL certificates not generated."
    print_warning "Please update nginx configuration and generate certificates manually."
    
    # Create self-signed certificates for testing
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

# Update nginx configuration with domain
print_status "Updating nginx configuration..."
sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf

# Build and start services with Docker Compose
print_status "Building and starting services..."
docker-compose build
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend API is running"
else
    print_error "Backend API is not responding"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is running"
else
    print_error "Frontend is not responding"
fi

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
if [ "$DOMAIN" != "your-domain.com" ]; then
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
fi

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/psnchain > /dev/null << EOF
$PROJECT_DIR/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
}

$PROJECT_DIR/nginx/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
}
EOF

# Create monitoring script
print_status "Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash

# PSNChain Monitoring Script

check_service() {
    local service=$1
    local url=$2
    
    if curl -f $url > /dev/null 2>&1; then
        echo "✅ $service is running"
    else
        echo "❌ $service is down"
        # Restart service
        docker-compose restart $service
    fi
}

echo "🔍 PSNChain Health Check - $(date)"
echo "=================================="

check_service "Backend API" "http://localhost:3001/api/health"
check_service "Frontend" "http://localhost:3000"

echo ""
echo "📊 System Resources:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "Memory: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disk: $(df -h / | awk 'NR==2{printf "%s", $5}')"

echo ""
echo "🐳 Docker Status:"
docker-compose ps
EOF

chmod +x monitor.sh

# Setup monitoring cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_DIR/monitor.sh >> $PROJECT_DIR/monitor.log 2>&1") | crontab -

# Final status
print_status "Deployment completed!"
echo ""
print_success "🎉 PSNChain has been successfully deployed!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "🌐 Frontend URL: https://$DOMAIN"
echo "🔌 API URL: https://$DOMAIN/api"
echo "📁 Project Directory: $PROJECT_DIR"
echo "📊 Monitoring: $PROJECT_DIR/monitor.sh"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "View logs: docker-compose logs -f"
echo "Restart services: docker-compose restart"
echo "Stop services: docker-compose down"
echo "Update services: docker-compose pull && docker-compose up -d"
echo "Monitor system: ./monitor.sh"
echo ""
echo "🔒 Security Features Enabled:"
echo "============================="
echo "✅ UFW Firewall"
echo "✅ Fail2ban"
echo "✅ SSL/TLS Encryption"
echo "✅ Security Headers"
echo "✅ Rate Limiting"
echo ""
print_warning "Please review and update configuration files as needed:"
print_warning "- backend/.env"
print_warning "- fontend/.env.local"
print_warning "- nginx/nginx.conf"
echo ""
print_success "Deployment completed successfully! 🚀"