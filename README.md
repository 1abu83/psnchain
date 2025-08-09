# PSNChain - Complete Blockchain Solution

Modern, production-ready blockchain with decentralized exchange (DEX), token creation, and elegant web interface.

## 🌟 Features

### 🔗 Blockchain Core
- **Proof-of-Work Consensus**: SHA256 mining algorithm
- **Native Cryptocurrency**: PSN token with mining rewards
- **Smart Contracts**: Token creation and management
- **Transaction Pool**: Pending transaction management
- **Chain Validation**: Cryptographic integrity verification

### 💱 Decentralized Exchange (DEX)
- **Automated Market Maker**: Uniswap-like constant product formula
- **Liquidity Pools**: Token pair trading
- **Swap Functionality**: Instant token exchanges
- **Fee System**: 0.3% trading fees for liquidity providers
- **Slippage Protection**: Minimum output amount validation

### 🎨 Modern Web Interface
- **Glassmorphism Design**: Translucent UI with backdrop blur
- **Responsive Layout**: Mobile-first design approach
- **Dark/Light Theme**: Automatic theme switching
- **Real-time Updates**: WebSocket integration
- **Smooth Animations**: Framer Motion micro-interactions

### 🔐 Security Features
- **ECDSA Signatures**: secp256k1 cryptographic security
- **Rate Limiting**: API protection against abuse
- **CORS Protection**: Cross-origin request security
- **SSL/TLS Encryption**: HTTPS with Let's Encrypt
- **Firewall Configuration**: UFW and fail2ban protection

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   Core          │
│   Port: 3000    │    │   Port: 3001    │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Nginx Proxy   │
                    │   Port: 80/443  │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Local Development

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd psnchain
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run api
   ```

3. **Setup Frontend**
   ```bash
   cd fontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/api
   - Health Check: http://localhost:3001/api/health

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 VPS Deployment

### Automated Deployment

```bash
# Make deployment script executable
chmod +x deploy-vps.sh

# Deploy to VPS (replace with your domain)
./deploy-vps.sh your-domain.com admin@your-domain.com
```

### Manual Deployment

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install dependencies
   sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
   ```

2. **SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Deploy Application**
   ```bash
   # Clone and setup
   git clone <repository-url>
   cd psnchain
   
   # Install dependencies
   cd backend && npm install && cd ..
   cd fontend && npm install && cd ..
   
   # Start with Docker
   docker-compose up -d
   ```

## 📡 API Endpoints

### Wallet Management
- `POST /api/wallet/create` - Create new wallet
- `GET /api/balance/:address` - Get wallet balance

### Transactions
- `POST /api/transaction/send` - Send PSN tokens
- `GET /api/transactions/:address` - Get transaction history
- `POST /api/mine` - Mine pending transactions

### Token Management
- `POST /api/token/create` - Create new token
- `GET /api/tokens` - List all tokens

### DEX/AMM
- `POST /api/swap` - Swap tokens
- `GET /api/pools` - List liquidity pools

### Blockchain Info
- `GET /api/blockchain/info` - Blockchain statistics
- `GET /api/blockchain/blocks` - Get blocks
- `GET /api/health` - Health check

## 🔧 Configuration

### Backend Environment (.env)
```env
NODE_ENV=production
API_PORT=3001
FRONTEND_URL=https://your-domain.com
CHAIN_ID=psnchain-1
MINING_DIFFICULTY=2
MINING_REWARD=100
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_WS_URL=wss://your-domain.com
NEXT_PUBLIC_CHAIN_ID=psnchain-1
NEXT_PUBLIC_FEE_DENOM=psn
NEXT_PUBLIC_FEE_AMOUNT=5000
```

## 🛠️ Development

### Project Structure
```
psnchain/
├── backend/                 # Blockchain & API server
│   ├── src/
│   │   ├── blockchain/      # Core blockchain logic
│   │   ├── api/            # REST API server
│   │   ├── cli/            # Command line interface
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
├── fontend/                # Next.js frontend
│   ├── src/app/
│   │   ├── components/     # React components
│   │   └── providers/      # Context providers
│   ├── Dockerfile
│   └── package.json
├── nginx/                  # Reverse proxy config
├── docker-compose.yml      # Container orchestration
└── deploy-vps.sh          # Deployment script
```

### Available Scripts

**Backend:**
- `npm start` - Start blockchain core
- `npm run api` - Start API server
- `npm run cli` - CLI interface
- `npm test` - Run tests

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server

### CLI Usage

```bash
# Create wallet
npm run cli create-wallet

# Check balance
npm run cli get-balance <address>

# Send tokens
npm run cli send-token --amount 10 --to <address> --from <private-key>

# Create token
npm run cli create-token --name "My Token" --symbol "MTK" --total-supply 1000000 --from <address>

# List tokens
npm run cli list-tokens
```

## 📊 Monitoring

### Health Monitoring
```bash
# Check service status
curl http://localhost:3001/api/health

# View logs
docker-compose logs -f

# System monitoring
./monitor.sh
```

### Performance Metrics
- **Blockchain**: Block time, transaction throughput
- **API**: Response time, request rate
- **System**: CPU, memory, disk usage

## 🔒 Security

### Implemented Security Measures
- **Cryptographic Security**: ECDSA signatures, SHA256 hashing
- **Network Security**: Firewall, rate limiting, CORS
- **Transport Security**: SSL/TLS encryption
- **Application Security**: Input validation, error handling
- **Infrastructure Security**: Container isolation, non-root users

### Security Best Practices
- Regular security updates
- Strong password policies
- Network segmentation
- Monitoring and logging
- Backup and recovery procedures

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join our Discord/Telegram for discussions

## 🎯 Roadmap

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Advanced smart contracts
- [ ] Multi-signature wallets
- [ ] Governance system
- [ ] Mobile applications
- [ ] Layer 2 scaling solutions

---

**Built with ❤️ for the decentralized future**