# PSNChain

PSNChain is a public Proof of Stake blockchain with token creation and swapping capabilities.

## Features

- Wallet creation and management
- PSN token transfers
- Fungible token creation and management
- AMM-based token swapping
- CLI tools for all operations
- Ready for mainnet deployment
- React frontend for wallet and token operations

## Prerequisites

- Node.js 18.x or higher
- npm 8.x or higher

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/psnchain.git
   cd psnchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

### CLI Commands

#### Create Wallet
```
node src/cli/index.js create-wallet
```

#### Get Balance
```
node src/cli/index.js get-balance <address>
```

#### Send Token
```
node src/cli/index.js send-token -a <amount> -t <recipient> -f <sender-private-key>
```

#### Create Token
```
node src/cli/index.js create-token -n <name> -s <symbol> -t <total-supply> -d <decimals> -f <creator-private-key>
```

#### Swap Token
```
node src/cli/index.js swap-token -p <pool-id> -i <token-in> -a <amount> -f <sender-private-key>
```

#### List Tokens
```
node src/cli/index.js list-tokens
```

## Frontend

The project includes a React frontend for wallet and token operations:

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and go to http://localhost:3000

## Deployment

### Ubuntu VPS Deployment

1. Copy the deploy directory to your VPS:
   ```
   scp -r deploy user@your-server:/home/user/
   ```

2. Run the deployment script on your VPS:
   ```
   chmod +x deploy/ubuntu-deploy.sh
   sudo ./deploy/ubuntu-deploy.sh
   ```

### Manual Deployment

1. Create a dedicated user:
   ```
   sudo useradd -m -s /bin/bash psnchain
   ```

2. Copy files to the psnchain user's home directory:
   ```
   sudo mkdir -p /home/psnchain/psnchain
   sudo cp -r . /home/psnchain/psnchain/
   sudo chown -R psnchain:psnchain /home/psnchain/psnchain
   ```

3. Install dependencies:
   ```
   sudo -u psnchain npm install --prefix /home/psnchain/psnchain
   ```

4. Install and start the systemd service:
   ```
   sudo cp /home/psnchain/psnchain/deploy/psnchain.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable psnchain
   sudo systemctl start psnchain
   ```

## Architecture

### Core Components

1. **Blockchain**: Main blockchain implementation with proof-of-stake consensus
2. **Token Manager**: Handles fungible token creation and management
3. **AMM**: Automated Market Maker for token swapping
4. **Wallet Utilities**: Cryptographic functions for wallet management

### Data Structures

1. **Block**: Contains transactions and metadata
2. **Transaction**: Represents a token transfer
3. **Token**: Fungible token information
4. **Liquidity Pool**: AMM liquidity pool for token swapping

## Security

- All private keys are generated using secure cryptographic methods
- Transactions are signed using ECDSA
- All communications should be secured with TLS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT

Dari pengujian yang telah dilakukan:

Membuat wallet baru berhasil dan menghasilkan alamat, public key, dan private key.
Memeriksa saldo wallet menunjukkan saldo PSN dan token.
Membuat token baru akan menambahkan token ke daftar token komunitas.
Arsitektur Blockchain
Blockchain PSNChain menggunakan:

Proof of Stake Consensus: Sistem konsensus yang efisien dan ramah lingkungan.
Hashing Real: Menggunakan algoritma SHA256 untuk hashing blok dan transaksi.
Struktur Modular: Memungkinkan penambahan fitur baru di masa depan.
AMM (Automated Market Maker): Sistem pertukaran token berbasis likuiditas pool.
Validasi Transaksi: Menggunakan ECDSA untuk penandatanganan dan verifikasi transaksi.
Blockchain ini siap untuk digunakan di mainnet dan mendukung semua fitur yang diminta, termasuk wallet, token creation, dan token swapping dengan biaya dalam token PSN.