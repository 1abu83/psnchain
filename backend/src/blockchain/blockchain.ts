import { Block, Transaction } from './block';
import { verifySignature } from '../utils/wallet';
import sha256 from 'sha256';

export class Blockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: Transaction[];
  public miningReward: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock(): Block {
    return new Block(0, Date.now(), [], '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress: string): void {
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
      {
        sender: 'PSNCHAIN_MINING_REWARD',
        recipient: miningRewardAddress,
        amount: this.miningReward,
        timestamp: Date.now()
      }
    ];
  }

  createTransaction(transaction: Transaction): void {
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

  getBalanceOfAddress(address: string): number {
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

  isChainValid(): boolean {
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