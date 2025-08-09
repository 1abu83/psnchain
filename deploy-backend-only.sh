#!/bin/bash

# PSNChain Backend-Only VPS Deployment Script
# This script deploys ONLY the backend API to VPS

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
VPS_IP=${1:-""}
DOMAIN=${2:-""}
API_PORT=${3:-"3001"}

if [ -z "$VPS_IP" ]; then
    print_error "Usage: $0 <VPS_IP> [DOMAIN] [API_PORT]"
    print_error "Example: $0 192.168.1.100 api.mydomain.com 3001"
    exit 1
fi

PROJECT_DIR="/home/$(whoami)/psnchain-backend"

print_status "Starting PSNChain Backend deployment to VPS..."
print_status "VPS IP: $VPS_IP"
print_status "Domain: ${DOMAIN:-'Not specified (will use IP)'}"
print_status "API Port: $API_PORT"
print_status "Project Directory: $PROJECT_DIR"

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx ufw fail2ban htop

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Setup firewall for backend only
print_status "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow $API_PORT/tcp
if [ ! -z "$DOMAIN" ]; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
fi
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

# Check if backend files exist (should be uploaded separately)
if [ ! -f "package.json" ]; then
    print_error "Backend files not found in $PROJECT_DIR"
    print_error "Please upload backend files first:"
    print_error "scp -r backend/* user@$VPS_IP:$PROJECT_DIR/"
    exit 1
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p logs

# Setup environment file
print_status "Setting up environment file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    
    # Update .env with VPS configuration
    sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
    sed -i "s/API_PORT=.*/API_PORT=$API_PORT/" .env
    
    if [ ! -z "$DOMAIN" ]; then
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" .env
    else
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$VPS_IP:3000|" .env
    fi
    
    print_warning "Environment file created. Please review and update .env as needed."
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Setup PM2 ecosystem for backend only
print_status "Setting up PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'psnchain-api',
      script: 'src/api/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        API_PORT: $API_PORT
      },
      log_file: 'logs/combined.log',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Setup nginx for API only (if domain provided)
if [ ! -z "$DOMAIN" ]; then
    print_status "Setting up nginx for API..."
    
    sudo tee /etc/nginx/sites-available/psnchain-api > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL configuration (certificates need to be obtained separately)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # CORS headers for API
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:$API_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:$API_PORT/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:$API_PORT/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

    # Enable site
    sudo ln -sf /etc/nginx/sites-available/psnchain-api /etc/nginx/sites-enabled/
    sudo nginx -t
    
    # Install certbot for SSL
    print_status "Installing SSL certificate..."
    sudo apt install -y certbot python3-certbot-nginx
    
    print_warning "SSL certificate setup required. Run after deployment:"
    print_warning "sudo certbot --nginx -d $DOMAIN"
fi

# Start the API service
print_status "Starting PSNChain API..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Wait for service to start
sleep 10

# Check service health
print_status "Checking service health..."
if curl -f http://localhost:$API_PORT/api/health > /dev/null 2>&1; then
    print_success "Backend API is running on port $API_PORT"
else
    print_error "Backend API is not responding"
    print_status "Checking PM2 status..."
    pm2 status
    print_status "Checking logs..."
    pm2 logs psnchain-api --lines 20
fi

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/psnchain-backend > /dev/null << EOF
$PROJECT_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
}
EOF

# Create monitoring script for backend only
print_status "Creating monitoring script..."
cat > monitor.sh << EOF
#!/bin/bash

# PSNChain Backend Monitoring Script

echo "🔍 PSNChain Backend Health Check - \$(date)"
echo "=========================================="

# Check API health
if curl -f http://localhost:$API_PORT/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is down"
    echo "🔄 Restarting API service..."
    pm2 restart psnchain-api
fi

echo ""
echo "📊 System Resources:"
echo "CPU: \$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}' | awk -F'%' '{print \$1}')%"
echo "Memory: \$(free | grep Mem | awk '{printf("%.1f%%", \$3/\$2 * 100.0)}')"
echo "Disk: \$(df -h / | awk 'NR==2{printf "%s", \$5}')"

echo ""
echo "🔧 PM2 Status:"
pm2 status

echo ""
echo "📝 Recent Logs:"
pm2 logs psnchain-api --lines 5 --nostream
EOF

chmod +x monitor.sh

# Setup monitoring cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_DIR/monitor.sh >> $PROJECT_DIR/monitor.log 2>&1") | crontab -

# Reload nginx if configured
if [ ! -z "$DOMAIN" ]; then
    sudo systemctl reload nginx
fi

# Final status
print_status "Backend deployment completed!"
echo ""
print_success "🎉 PSNChain Backend API has been successfully deployed!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
if [ ! -z "$DOMAIN" ]; then
    echo "🔌 API URL: https://$DOMAIN/api"
    echo "🏥 Health Check: https://$DOMAIN/health"
else
    echo "🔌 API URL: http://$VPS_IP:$API_PORT/api"
    echo "🏥 Health Check: http://$VPS_IP:$API_PORT/api/health"
fi
echo "📁 Project Directory: $PROJECT_DIR"
echo "📊 Monitoring: $PROJECT_DIR/monitor.sh"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "View API logs: pm2 logs psnchain-api"
echo "Restart API: pm2 restart psnchain-api"
echo "Stop API: pm2 stop psnchain-api"
echo "PM2 status: pm2 status"
echo "Monitor system: ./monitor.sh"
echo ""
echo "🔒 Security Features Enabled:"
echo "============================="
echo "✅ UFW Firewall (Port $API_PORT open)"
echo "✅ Fail2ban"
if [ ! -z "$DOMAIN" ]; then
    echo "✅ Nginx Reverse Proxy"
    echo "⚠️  SSL Certificate (run: sudo certbot --nginx -d $DOMAIN)"
fi
echo ""
echo "📱 Frontend Configuration:"
echo "=========================="
echo "Update your frontend .env.local with:"
if [ ! -z "$DOMAIN" ]; then
    echo "NEXT_PUBLIC_API_URL=https://$DOMAIN/api"
    echo "NEXT_PUBLIC_WS_URL=wss://$DOMAIN"
else
    echo "NEXT_PUBLIC_API_URL=http://$VPS_IP:$API_PORT/api"
    echo "NEXT_PUBLIC_WS_URL=ws://$VPS_IP:$API_PORT"
fi
echo ""
print_success "Backend deployment completed successfully! 🚀"
print_warning "Don't forget to configure your frontend to connect to this API endpoint!"