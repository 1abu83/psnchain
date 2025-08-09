#!/bin/bash

# PSNChain Root Deployment Script
# Run this script directly on the VPS as root user

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
VPS_IP="147.93.81.226"
PROJECT_DIR="/root/psnchain"
API_PORT="3001"

print_status "Starting PSNChain deployment on VPS..."
print_status "VPS IP: $VPS_IP"
print_status "Project Directory: $PROJECT_DIR"

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx ufw fail2ban htop

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Setup firewall
print_status "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow $API_PORT/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl start fail2ban

# Create project directory if it doesn't exist
print_status "Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# If project files don't exist, we need to create them
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    print_warning "Project files not found. Creating basic structure..."
    
    # Create basic project structure
    mkdir -p backend/src/api
    mkdir -p backend/src/blockchain
    mkdir -p fontend/src/app
    mkdir -p nginx
    
    # Create basic package.json for backend
    cat > backend/package.json << 'EOF'
{
  "name": "psnchain-backend",
  "version": "1.0.0",
  "description": "PSNChain Backend API",
  "main": "src/api/index.js",
  "scripts": {
    "start": "node src/blockchain/index.js",
    "api": "node src/api/index.js",
    "dev": "nodemon src/api/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "socket.io": "^4.7.2",
    "crypto": "^1.0.1",
    "elliptic": "^6.5.4",
    "sha256": "^0.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

    # Create basic API server
    cat > backend/src/api/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// Basic API routes
app.get('/api/info', (req, res) => {
    res.json({
        name: 'PSNChain API',
        version: '1.0.0',
        description: 'PSNChain Blockchain API Server'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PSNChain API server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
EOF

    # Create basic environment file
    cat > backend/.env << EOF
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=http://$VPS_IP:3000
CHAIN_ID=psnchain-1
MINING_DIFFICULTY=2
MINING_REWARD=100
EOF

    print_success "Basic project structure created"
fi

# Navigate to backend directory
cd $PROJECT_DIR/backend

# Install dependencies
print_status "Installing backend dependencies..."
npm install

# Setup PM2 ecosystem
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

# Create logs directory
mkdir -p logs

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

# Setup nginx basic configuration
print_status "Setting up nginx..."
cat > /etc/nginx/sites-available/psnchain << EOF
server {
    listen 80;
    server_name $VPS_IP;
    
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
    
    # Health check
    location /health {
        proxy_pass http://localhost:$API_PORT/api/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
    
    # Default location
    location / {
        return 200 'PSNChain API Server is running. Access API at /api/';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/psnchain /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Create monitoring script
print_status "Creating monitoring script..."
cat > $PROJECT_DIR/monitor.sh << 'EOF'
#!/bin/bash

echo "🔍 PSNChain Health Check - $(date)"
echo "=================================="

# Check API health
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is down"
    echo "🔄 Restarting API service..."
    pm2 restart psnchain-api
fi

echo ""
echo "📊 System Resources:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "Memory: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disk: $(df -h / | awk 'NR==2{printf "%s", $5}')"

echo ""
echo "🔧 PM2 Status:"
pm2 status
EOF

chmod +x $PROJECT_DIR/monitor.sh

# Setup monitoring cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_DIR/monitor.sh >> $PROJECT_DIR/monitor.log 2>&1") | crontab -

# Final status
print_status "Deployment completed!"
echo ""
print_success "🎉 PSNChain has been successfully deployed!"
echo ""
echo "📋 Deployment Summary:"
echo "======================"
echo "🔌 API URL: http://$VPS_IP/api"
echo "🏥 Health Check: http://$VPS_IP/health"
echo "📁 Project Directory: $PROJECT_DIR"
echo "📊 Monitoring: $PROJECT_DIR/monitor.sh"
echo ""
echo "🔧 Useful Commands:"
echo "==================="
echo "View API logs: pm2 logs psnchain-api"
echo "Restart API: pm2 restart psnchain-api"
echo "Stop API: pm2 stop psnchain-api"
echo "PM2 status: pm2 status"
echo "Monitor system: $PROJECT_DIR/monitor.sh"
echo ""
echo "🔒 Security Features Enabled:"
echo "============================="
echo "✅ UFW Firewall (Port $API_PORT open)"
echo "✅ Fail2ban"
echo "✅ Nginx Reverse Proxy"
echo ""
echo "📱 Test Your API:"
echo "================="
echo "curl http://$VPS_IP/api/health"
echo "curl http://$VPS_IP/api/info"
echo ""
print_success "Deployment completed successfully! 🚀"