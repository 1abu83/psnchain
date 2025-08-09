# 🚀 PSNChain Developer Wallet Setup

## 📋 Overview

This guide will help you create a developer wallet with **100,000,000 PSN Coins** using Genesis Block Allocation. This is the most legitimate and secure way to allocate initial funds in a blockchain.

## 🎯 What You'll Get

- ✅ **Developer Wallet**: New wallet with private/public keys
- ✅ **100M PSN**: Initial allocation of 100,000,000 PSN coins
- ✅ **Genesis Block**: Blockchain starts with your allocation
- ✅ **Enhanced Features**: Gas fees, token support, AMM

## 🛠️ Prerequisites

- Node.js 16+ installed
- Access to VPS (147.93.81.226)
- SSH key configured
- Basic blockchain knowledge

## 🚀 Quick Start

### **Option 1: Local Setup (Development)**

```bash
# Navigate to backend directory
cd backend

# Run setup script
./run-developer-setup.sh    # Linux/Mac
# OR
run-developer-setup.bat     # Windows
```

### **Option 2: VPS Deployment (Production)**

```bash
# Navigate to backend directory
cd backend

# Deploy to VPS
./deploy-developer-vps.sh   # Linux/Mac
# OR
./deploy-developer-vps.ps1  # Windows PowerShell
```

## 📁 Files Created

After setup, you'll have:

```
backend/
├── src/storage/
│   ├── blockchain.json          # Blockchain with genesis allocation
│   ├── developer-wallet.json    # Developer wallet info
│   └── wallets.json            # All wallet data
├── .env.developer              # Environment configuration
└── setup-developer-wallet.js   # Setup script
```

## 🔐 Developer Wallet Information

Your developer wallet will contain:

- **Address**: `psn...` (40+ characters)
- **Private Key**: 64-character hex string
- **Public Key**: Derived from private key
- **Balance**: 100,000,000 PSN
- **Created**: Timestamp

## ⚠️ Security Warnings

### **CRITICAL: Protect Your Private Key**

- 🔒 **Never share** your private key
- 💾 **Backup securely** in multiple locations
- 🚫 **Don't commit** to version control
- 🔐 **Use hardware wallet** for large amounts

### **Storage Recommendations**

- **Paper wallet**: Print and store in safe
- **Hardware wallet**: Ledger, Trezor
- **Encrypted file**: AES-256 encryption
- **Cloud backup**: Encrypted, multiple providers

## 🔍 Verification Steps

### **1. Check Wallet Balance**

```bash
# Via API
curl http://localhost:3001/api/balance/{YOUR_ADDRESS}

# Expected response
{
  "success": true,
  "data": {
    "address": "psn...",
    "balance": 100000000,
    "tokens": {}
  }
}
```

### **2. Verify Genesis Block**

```bash
# Via API
curl http://localhost:3001/api/blockchain/info

# Check first block has your transaction
```

### **3. Test Transaction**

```bash
# Create a test transaction
# Send 1000 PSN to another address
# Verify balance changes
```

## 🚀 Next Steps

### **Phase 1: Testing**
1. ✅ Verify wallet balance
2. ✅ Test small transactions
3. ✅ Check gas fee calculations
4. ✅ Validate blockchain integrity

### **Phase 2: Development**
1. 🏗️ Build token contracts
2. 🔄 Test AMM functionality
3. 📱 Integrate with frontend
4. 🧪 Run comprehensive tests

### **Phase 3: Production**
1. 🌐 Deploy to mainnet
2. 🔒 Secure private keys
3. 📊 Monitor transactions
4. 🚀 Launch applications

## 🆘 Troubleshooting

### **Common Issues**

#### **1. "Module not found" Error**
```bash
# Install dependencies
npm install

# Check file paths
ls -la src/blockchain/
```

#### **2. "Permission denied" Error**
```bash
# Make scripts executable
chmod +x *.sh

# Check file permissions
ls -la
```

#### **3. "Blockchain already exists" Error**
```bash
# Clear existing data
rm -rf src/storage/blockchain.json
rm -rf src/storage/wallets.json

# Re-run setup
node setup-developer-wallet.js
```

#### **4. "VPS connection failed" Error**
```bash
# Check SSH connection
ssh root@147.93.81.226

# Verify SSH key
ssh-add -l

# Test SCP
scp test.txt root@147.93.81.226:/tmp/
```

### **Debug Mode**

```bash
# Enable debug logging
DEBUG=* node setup-developer-wallet.js

# Check PM2 logs
pm2 logs psnchain-api

# Monitor blockchain storage
tail -f src/storage/blockchain.json
```

## 📚 API Reference

### **Wallet Endpoints**

```
GET  /api/wallet/create          # Create new wallet
POST /api/wallet/import          # Import existing wallet
GET  /api/balance/{address}      # Get wallet balance
GET  /api/wallet/{address}       # Get wallet info
```

### **Blockchain Endpoints**

```
GET  /api/blockchain/info        # Blockchain status
GET  /api/blockchain/blocks      # List all blocks
GET  /api/blockchain/transactions # Pending transactions
POST /api/blockchain/mine        # Mine new block
```

### **Transaction Endpoints**

```
POST /api/transaction/send       # Send PSN
POST /api/transaction/token      # Send tokens
GET  /api/transaction/{hash}     # Get transaction details
GET  /api/transaction/history/{address} # Transaction history
```

## 🔗 Useful Commands

### **Local Development**
```bash
# Start blockchain
npm run start

# Run tests
npm test

# Check logs
tail -f logs/blockchain.log
```

### **VPS Management**
```bash
# Check service status
pm2 status

# View logs
pm2 logs psnchain-api

# Restart service
pm2 reload psnchain-api

# Monitor resources
htop
```

### **Blockchain Operations**
```bash
# Check balance
curl http://localhost:3001/api/balance/{ADDRESS}

# Mine block
curl -X POST http://localhost:3001/api/blockchain/mine

# Get blockchain info
curl http://localhost:3001/api/blockchain/info
```

## 📞 Support

If you encounter issues:

1. **Check logs**: `pm2 logs psnchain-api`
2. **Verify setup**: Re-run setup script
3. **Check dependencies**: `npm list`
4. **Review configuration**: Check `.env.developer`

## 🎉 Congratulations!

You now have a developer wallet with 100M PSN coins! 

**Remember**: 
- 🔒 Keep your private key secure
- 💾 Backup wallet information
- 🧪 Test thoroughly before production
- 🚀 Build amazing blockchain applications!

---

**Happy Coding! 🚀**
