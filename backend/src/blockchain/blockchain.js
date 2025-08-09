const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class Transaction {
  constructor(sender, recipient, amount, timestamp = Date.now()) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.timestamp = timestamp;
    this.signature = null;
    this.txHash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.sender + this.recipient + this.amount + this.timestamp)
      .digest('hex');
  }

  signTransaction(privateKey) {
    const hash = this.calculateHash();
    this.signature = crypto
      .createHash('sha256')
      .update(hash + privateKey)
      .digest('hex');
  }

  isValid() {
    if (this.sender === null) return true; // Mining reward transaction
    
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    return true; // Simplified validation
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.index = 0;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.storageFile = path.join(__dirname, '../storage/blockchain.json');
    this.walletsFile = path.join(__dirname, '../storage/wallets.json');
    
    this.loadFromStorage();
  }

  async loadFromStorage() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const parsed = JSON.parse(data);
      
      this.chain = parsed.chain.map(blockData => {
        const block = new Block(blockData.timestamp, blockData.transactions, blockData.previousHash);
        block.index = blockData.index;
        block.hash = blockData.hash;
        block.nonce = blockData.nonce;
        return block;
      });
      
      this.pendingTransactions = parsed.pendingTransactions.map(txData => {
        const tx = new Transaction(txData.sender, txData.recipient, txData.amount, txData.timestamp);
        tx.signature = txData.signature;
        tx.txHash = txData.txHash;
        return tx;
      });
      
      this.difficulty = parsed.difficulty;
      this.miningReward = parsed.miningReward;
      
      if (this.chain.length === 0) {
        this.chain = [this.createGenesisBlock()];
        await this.saveToStorage();
      }
    } catch (error) {
      console.log('Creating new blockchain...');
      this.chain = [this.createGenesisBlock()];
      await this.saveToStorage();
    }
  }

  async saveToStorage() {
    const data = {
      chain: this.chain,
      pendingTransactions: this.pendingTransactions,
      difficulty: this.difficulty,
      miningReward: this.miningReward
    };
    
    await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
  }

  createGenesisBlock() {
    const genesis = new Block(Date.now(), [], '0');
    genesis.index = 0;
    genesis.hash = genesis.calculateHash();
    return genesis;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async minePendingTransactions(miningRewardAddress) {
    const rewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTransaction);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    block.index = this.chain.length;
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);
    this.pendingTransactions = [];
    
    await this.saveToStorage();
    return block;
  }

  async createTransaction(transaction) {
    console.log('Creating transaction:', transaction);
    
    if (!transaction.sender || !transaction.recipient) {
      throw new Error('Transaction must include sender and recipient address');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    const walletBalance = this.getBalanceOfAddress(transaction.sender);
    console.log(`Sender balance: ${walletBalance}, Transaction amount: ${transaction.amount}`);
    
    if (walletBalance < transaction.amount) {
      throw new Error(`Not enough balance. Available: ${walletBalance}, Required: ${transaction.amount}`);
    }

    // Validate transaction (simplified)
    if (!transaction.signature) {
      throw new Error('Transaction must be signed');
    }

    this.pendingTransactions.push(transaction);
    await this.saveToStorage();
    
    console.log('Transaction added to pending pool:', transaction.txHash);
    return transaction.txHash;
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.sender === address) {
          balance -= trans.amount;
        }

        if (trans.recipient === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  getAllTransactionsForWallet(address) {
    const txs = [];

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.sender === address || tx.recipient === address) {
          txs.push({
            ...tx,
            blockIndex: block.index,
            blockHash: block.hash,
            blockTimestamp: block.timestamp,
            confirmations: this.chain.length - block.index
          });
        }
      }
    }

    return txs.sort((a, b) => b.timestamp - a.timestamp);
  }

  isChainValid() {
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (previousBlock.hash !== currentBlock.previousHash) {
        return false;
      }

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }

  getBlockByHash(hash) {
    return this.chain.find(block => block.hash === hash);
  }

  getTransactionByHash(hash) {
    for (const block of this.chain) {
      const tx = block.transactions.find(tx => tx.txHash === hash);
      if (tx) {
        return {
          ...tx,
          blockIndex: block.index,
          blockHash: block.hash,
          blockTimestamp: block.timestamp,
          confirmations: this.chain.length - block.index
        };
      }
    }
    return null;
  }
}

module.exports = { Blockchain, Transaction, Block };