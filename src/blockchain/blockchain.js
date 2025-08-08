const { Block, Transaction } = require('./block');
const { verifySignature } = require('../utils/wallet');
const sha256 = require('sha256');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    // Create a new block with pending transactions
    const block = new Block(
      this.chain.length,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    
    // Mine the block
    block.mineBlock(this.difficulty);
    
    // Add the block to the chain
    this.chain.push(block);
    
    // Reset pending transactions and add mining reward
    this.pendingTransactions = [
      new Transaction(
        'PSNCHAIN_MINING_REWARD',
        miningRewardAddress,
        this.miningReward,
        Date.now()
      )
    ];
  }

  createTransaction(transaction) {
    // Verify transaction signature
    if (!transaction.sender || !transaction.recipient) {
      throw new Error('Transaction must include sender and recipient');
    }
    
    if (transaction.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0');
    }
    
    // Verify signature if it's not a mining reward
    if (transaction.sender !== 'PSNCHAIN_MINING_REWARD') {
      if (!transaction.signature) {
        throw new Error('Transaction must be signed');
      }
      
      // Remove signature from transaction for verification
      const { signature, ...unsignedTransaction } = transaction;
      
      if (!verifySignature(unsignedTransaction, signature, transaction.sender)) {
        throw new Error('Invalid transaction signature');
      }
    }
    
    // Add transaction to pending transactions
    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;
    
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.sender === address) {
          balance -= transaction.amount;
        }
        
        if (transaction.recipient === address) {
          balance += transaction.amount;
        }
      }
    }
    
    return balance;
  }

  isChainValid() {
    // Check genesis block
    const genesis = JSON.stringify(this.createGenesisBlock());
    const firstBlock = JSON.stringify(this.chain[0]);
    
    if (genesis !== firstBlock) {
      return false;
    }
    
    // Check all blocks in the chain
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check if block hash is valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      
      // Check if previous hash is correct
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }
}

module.exports = {
  Blockchain
};