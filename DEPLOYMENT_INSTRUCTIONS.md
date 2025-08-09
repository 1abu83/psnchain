# PSNChain Deployment Instructions

## 🎯 **Deployment Strategy**

Ada 2 pendekatan deployment yang bisa dipilih:

### **Option 1: Backend di VPS, Frontend Local (Recommended)**
- Backend API di-deploy ke VPS
- Frontend dijalankan di local development
- Frontend connect ke API VPS via HTTPS/HTTP

### **Option 2: Full Stack di VPS**
- Backend dan Frontend sama-sama di VPS
- Menggunakan Nginx sebagai reverse proxy
- SSL certificate untuk production

---

## 🚀 **Option 1: Backend-Only Deployment**

### **Step 1: Prepare Backend Files**
```bash
# Di local machine, siapkan backend files
cd psnchain
tar -czf backend.tar.gz backend/
```

### **Step 2: Upload ke VPS**
```bash
# Upload backend files ke VPS
scp backend.tar.gz user@your-vps-ip:/home/user/

# SSH ke VPS
ssh user@your-vps-ip

# Extract files
tar -xzf backend.tar.gz
mv backend psnchain-backend
cd psnchain-backend
```

### **Step 3: Run Deployment Script**
```bash
# Download deployment script
wget https://raw.githubusercontent.com/your-repo/deploy-backend-only.sh
chmod +x deploy-backend-only.sh

# Deploy dengan IP only
./deploy-backend-only.sh YOUR_VPS_IP

# Atau deploy dengan domain
./deploy-backend-only.sh YOUR_VPS_IP api.yourdomain.com
```

### **Step 4: Configure Frontend Local**
```bash
# Di local machine, update frontend config
cd fontend
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001/api
NEXT_PUBLIC_WS_URL=ws://YOUR_VPS_IP:3001
# atau jika pakai domain:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
# NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Start frontend
npm run dev
```

### **Step 5: Test Connection**
```bash
# Test API dari local
curl http://YOUR_VPS_IP:3001/api/health

# Akses frontend
http://localhost:3000
```

---

## 🌐 **Option 2: Full Stack Deployment**

### **Step 1: Upload All Files**
```bash
# Upload semua files
scp -r . user@your-vps-ip:/home/user/psnchain
```

### **Step 2: Run Full Deployment**
```bash
ssh user@your-vps-ip
cd psnchain
chmod +x deploy-vps.sh
./deploy-vps.sh yourdomain.com admin@yourdomain.com
```

---

## 📋 **Manual Deployment Steps**

Jika ingin deploy manual tanpa script:

### **Backend Manual Setup**
```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Setup project
cd psnchain-backend
npm install
cp .env.example .env
# Edit .env sesuai kebutuhan

# 4. Start API
npm run api
# atau dengan PM2:
pm2 start src/api/index.js --name psnchain-api
pm2 save
pm2 startup
```

### **Frontend Manual Setup (jika di VPS)**
```bash
# 1. Setup frontend
cd psnchain-frontend
npm install
npm run build

# 2. Start frontend
npm start
# atau dengan PM2:
pm2 start npm --name psnchain-frontend -- start
```

### **Nginx Configuration**
```bash
# 1. Install nginx
sudo apt install nginx

# 2. Create config
sudo nano /etc/nginx/sites-available/psnchain

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/psnchain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 **Environment Configuration**

### **Backend .env**
```env
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=http://localhost:3000
CHAIN_ID=psnchain-1
MINING_DIFFICULTY=2
MINING_REWARD=100
```

### **Frontend .env.local**
```env
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:3001/api
NEXT_PUBLIC_WS_URL=ws://YOUR_VPS_IP:3001
NEXT_PUBLIC_CHAIN_ID=psnchain-1
NEXT_PUBLIC_FEE_DENOM=psn
NEXT_PUBLIC_FEE_AMOUNT=5000
NEXT_PUBLIC_GAS_LIMIT=200000
```

---

## 🔒 **Security Setup**

### **Firewall Configuration**
```bash
# Basic firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3001/tcp  # API port
sudo ufw enable
```

### **SSL Certificate (jika pakai domain)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **Monitoring & Maintenance**

### **Check Service Status**
```bash
# PM2 status
pm2 status

# API health
curl http://localhost:3001/api/health

# View logs
pm2 logs psnchain-api

# System resources
htop
```

### **Common Commands**
```bash
# Restart API
pm2 restart psnchain-api

# Update code
git pull
npm install
pm2 restart psnchain-api

# View real-time logs
pm2 logs psnchain-api --lines 100 -f
```

---

## 🚨 **Troubleshooting**

### **API Not Starting**
```bash
# Check logs
pm2 logs psnchain-api

# Check port
sudo netstat -tlnp | grep 3001

# Check environment
cat .env
```

### **Frontend Can't Connect**
```bash
# Check CORS settings
# Check API URL in frontend .env.local
# Check firewall rules
sudo ufw status
```

### **SSL Issues**
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check nginx config
sudo nginx -t
```

---

## 📝 **Deployment Checklist**

### **Pre-deployment**
- [ ] VPS dengan Ubuntu 20.04+
- [ ] Domain name (optional)
- [ ] SSH access ke VPS
- [ ] Backup existing data

### **Backend Deployment**
- [ ] Upload backend files
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Setup firewall
- [ ] Start API service
- [ ] Test API endpoints

### **Frontend Configuration**
- [ ] Update API URLs
- [ ] Test connection
- [ ] Verify all features work

### **Production Setup**
- [ ] SSL certificate
- [ ] Monitoring setup
- [ ] Log rotation
- [ ] Backup strategy
- [ ] Performance optimization

---

## 🎉 **Success Indicators**

Deployment berhasil jika:
- ✅ API health check returns 200 OK
- ✅ Frontend dapat connect ke API
- ✅ Wallet creation works
- ✅ Balance checking works
- ✅ Transaction sending works
- ✅ WebSocket connection established
- ✅ All API endpoints respond correctly

---

**Pilih deployment strategy yang sesuai dengan kebutuhan Anda!**