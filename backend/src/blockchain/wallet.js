const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class Wallet {
  constructor() {
    this.privateKey = this.generatePrivateKey();
    this.publicKey = this.generatePublicKey();
    this.address = this.generateAddress();
  }

  generatePrivateKey() {
    // Generate 32 bytes (256 bits) and convert to hex (64 characters)
    return crypto.randomBytes(32).toString('hex');
  }

  generatePublicKey() {
    // Generate public key from private key using SHA256
    return crypto
      .createHash('sha256')
      .update(this.privateKey)
      .digest('hex');
  }

  generateAddress() {
    // Generate PSN address from public key
    const hash = crypto
      .createHash('sha256')
      .update(this.publicKey)
      .digest('hex');
    
    return 'psn' + hash.substring(0, 40);
  }

  signTransaction(transaction) {
    const hash = transaction.calculateHash();
    transaction.signature = crypto
      .createHash('sha256')
      .update(hash + this.privateKey)
      .digest('hex');
  }
}

class WalletManager {
  constructor() {
    this.storageFile = path.join(__dirname, '../storage/wallets.json');
    this.wallets = new Map();
    this.loadFromStorage();
  }

  async loadFromStorage() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const parsed = JSON.parse(data);
      
      for (const [address, walletData] of Object.entries(parsed.wallets)) {
        this.wallets.set(address, walletData);
      }
    } catch (error) {
      console.log('Creating new wallet storage...');
      await this.saveToStorage();
    }
  }

  async saveToStorage() {
    const data = {
      wallets: Object.fromEntries(this.wallets),
      balances: {}
    };
    
    await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
  }

  async createWallet() {
    const wallet = new Wallet();
    
    const walletData = {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      createdAt: Date.now()
    };
    
    this.wallets.set(wallet.address, walletData);
    await this.saveToStorage();
    
    return {
      address: wallet.address,
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey
    };
  }

  getWallet(address) {
    return this.wallets.get(address);
  }

  getAllWallets() {
    return Array.from(this.wallets.values());
  }

  validateAddress(address) {
    return address.startsWith('psn') && address.length === 43;
  }

  signTransaction(privateKey, transaction) {
    const hash = transaction.calculateHash();
    return crypto
      .createHash('sha256')
      .update(hash + privateKey)
      .digest('hex');
  }
}

module.exports = { Wallet, WalletManager };