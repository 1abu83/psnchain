const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { Blockchain, Transaction, Block } = require('./blockchain');
const { ContractAddressGenerator } = require('./contract-address-generator');

// Enhanced Transaction class with token support
class TokenTransaction extends Transaction {
  constructor(sender, recipient, amount, tokenContract = null, gasPrice = 0.001, timestamp = Date.now()) {
    super(sender, recipient, amount, timestamp);
    
    // Validate contract address format if provided
    if (tokenContract && !this.isValidContractAddress(tokenContract)) {
      throw new Error('Invalid contract address format');
    }
    
    this.tokenContract = tokenContract; // null for PSN, contract address for custom tokens
    this.gasPrice = gasPrice;
    this.gasFee = this.calculateGasFee();
    this.transactionType = tokenContract ? 'TOKEN_TRANSFER' : 'PSN_TRANSFER';
    this.txHash = this.calculateHash(); // Recalculate hash with new fields
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.sender + 
        this.recipient + 
        this.amount + 
        this.timestamp + 
        (this.tokenContract || '') + 
        this.gasPrice + 
        this.transactionType
      )
      .digest('hex');
  }

  calculateGasFee() {
    // Base fee for transaction
    const baseFee = 0.001; // PSN
    
    // Additional fee for token transfers
    const tokenFee = this.tokenContract ? 0.0005 : 0;
    
    // Data size fee (simplified) - much smaller multiplier
    const dataSize = JSON.stringify(this).length;
    const dataFee = dataSize * 0.000001; // Reduced from 0.0001 to 0.000001
    
    return baseFee + tokenFee + dataFee;
  }

  isValid() {
    // Call parent validation first
    if (this.sender !== null) {
      if (!this.signature || this.signature.length === 0) {
        throw new Error('No signature in this transaction');
      }
    }

    // Token-specific validation
    if (this.tokenContract) {
      // Validate contract address format
      if (!this.isValidContractAddress(this.tokenContract)) {
        throw new Error('Invalid contract address format');
      }
    }

    // Validate gas price
    if (this.gasPrice < 0) {
      throw new Error('Gas price cannot be negative');
    }

    return true;
  }

  isValidContractAddress(address) {
    // Contract address format: PSN + 40 hex characters
    return /^PSN[a-fA-F0-9]{40}$/.test(address);
  }
}

// Enhanced Blockchain class with token support
class EnhancedBlockchain extends Blockchain {
  constructor() {
    super();
    this.nativeTokenSymbol = 'PSN';
    this.tokenStorage = path.join(__dirname, '../storage/tokens.json');
    this.balanceStorage = path.join(__dirname, '../storage/balances.json');
    
    // Initialize contract address generator
    this.contractAddressGenerator = new ContractAddressGenerator();
    
    // Initialize token-related storage
    this.initializeTokenStorage();
  }

  async initializeTokenStorage() {
    try {
      // Ensure storage directory exists
      const storageDir = path.dirname(this.tokenStorage);
      try {
        await fs.access(storageDir);
      } catch {
        await fs.mkdir(storageDir, { recursive: true });
      }

      // Initialize tokens.json if it doesn't exist
      try {
        await fs.access(this.tokenStorage);
      } catch {
        const initialTokenData = {
          tokens: {},
          contractAddresses: []
        };
        await fs.writeFile(this.tokenStorage, JSON.stringify(initialTokenData, null, 2));
      }

      // Initialize balances.json if it doesn't exist
      try {
        await fs.access(this.balanceStorage);
      } catch {
        const initialBalanceData = {
          balances: {}
        };
        await fs.writeFile(this.balanceStorage, JSON.stringify(initialBalanceData, null, 2));
      }
    } catch (error) {
      console.error('Error initializing token storage:', error);
    }
  }

  // Enhanced transaction creation with token support
  async createTokenTransaction(transaction) {
    console.log('Creating token transaction:', transaction);
    
    // Validate transaction
    if (!transaction.sender || !transaction.recipient) {
      throw new Error('Transaction must include sender and recipient address');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    // Validate transaction signature
    if (!transaction.signature) {
      throw new Error('Transaction must be signed');
    }

    // For token transfers, validate contract address exists
    if (transaction.tokenContract) {
      const tokenExists = await this.validateTokenContract(transaction.tokenContract);
      if (!tokenExists) {
        throw new Error(`Token contract ${transaction.tokenContract} not found`);
      }
    }

    // Validate balances
    await this.validateTransactionBalances(transaction);

    // Add to pending transactions
    this.pendingTransactions.push(transaction);
    await this.saveToStorage();
    
    console.log('Token transaction added to pending pool:', transaction.txHash);
    return transaction.txHash;
  }

  // Validate transaction balances (both token and gas fee)
  async validateTransactionBalances(transaction) {
    const senderAddress = transaction.sender;
    
    if (transaction.tokenContract) {
      // Custom token transfer - check token balance
      const tokenBalance = await this.getTokenBalance(senderAddress, transaction.tokenContract);
      if (tokenBalance < transaction.amount) {
        throw new Error(`Insufficient token balance. Available: ${tokenBalance}, Required: ${transaction.amount}`);
      }
      
      // Check PSN balance for gas fee
      const psnBalance = this.getBalanceOfAddress(senderAddress);
      if (psnBalance < transaction.gasFee) {
        throw new Error(`Insufficient PSN for gas fee. Required: ${transaction.gasFee}, Available: ${psnBalance}`);
      }
    } else {
      // PSN transfer - check PSN balance (amount + gas fee)
      const psnBalance = this.getBalanceOfAddress(senderAddress);
      const totalRequired = transaction.amount + transaction.gasFee;
      if (psnBalance < totalRequired) {
        throw new Error(`Insufficient PSN balance. Available: ${psnBalance}, Required: ${totalRequired}`);
      }
    }
  }

  // Validate if token contract exists
  async validateTokenContract(contractAddress) {
    try {
      // First validate contract address format
      if (!this.contractAddressGenerator.validateContractAddress(contractAddress)) {
        return false;
      }
      
      // Then check if contract exists in storage
      return await this.contractAddressGenerator.contractExists(contractAddress);
    } catch (error) {
      console.error('Error validating token contract:', error);
      return false;
    }
  }

  // Validate contract address format and existence
  async validateContractAddressWithValidation(contractAddress) {
    try {
      // Strict format validation (throws error if invalid)
      this.contractAddressGenerator.validateContractAddressStrict(contractAddress);
      
      // Check existence
      const exists = await this.contractAddressGenerator.contractExists(contractAddress);
      if (!exists) {
        throw new Error(`Token contract ${contractAddress} not found`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get token balance for specific address and contract
  async getTokenBalance(address, contractAddress) {
    try {
      const balanceData = await fs.readFile(this.balanceStorage, 'utf8');
      const parsed = JSON.parse(balanceData);
      
      if (parsed.balances[address] && parsed.balances[address][contractAddress]) {
        return parsed.balances[address][contractAddress];
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  // Get all balances for an address (PSN + all tokens)
  async getAllBalances(address) {
    const balances = {
      PSN: this.getBalanceOfAddress(address)
    };

    try {
      const balanceData = await fs.readFile(this.balanceStorage, 'utf8');
      const parsed = JSON.parse(balanceData);
      
      if (parsed.balances[address]) {
        Object.assign(balances, parsed.balances[address]);
      }
    } catch (error) {
      console.error('Error getting all balances:', error);
    }

    return balances;
  }

  // Enhanced mining with gas fee processing
  async minePendingTransactions(miningRewardAddress) {
    // Process gas fees before mining
    await this.processGasFees();
    
    // Add mining reward transaction
    const rewardTransaction = new TokenTransaction(null, miningRewardAddress, this.miningReward);
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
    
    // Update balances after mining
    await this.updateBalancesAfterMining(block);
    
    this.pendingTransactions = [];
    await this.saveToStorage();
    
    return block;
  }

  // Process gas fees for all pending transactions
  async processGasFees() {
    for (const tx of this.pendingTransactions) {
      if (tx.sender && tx.gasFee > 0) {
        // Gas fees are already validated in createTokenTransaction
        // They will be deducted when balances are updated after mining
      }
    }
  }

  // Update balances after mining (including token transfers and gas fees)
  async updateBalancesAfterMining(block) {
    try {
      const balanceData = await fs.readFile(this.balanceStorage, 'utf8');
      const balances = JSON.parse(balanceData);

      for (const tx of block.transactions) {
        if (tx.tokenContract) {
          // Custom token transfer
          await this.updateTokenBalance(balances, tx.sender, tx.tokenContract, -tx.amount);
          await this.updateTokenBalance(balances, tx.recipient, tx.tokenContract, tx.amount);
        }
        
        // Deduct gas fee from sender's PSN balance (handled by parent class for PSN balance)
        // Token transfers don't affect PSN balance directly, only gas fees do
      }

      await fs.writeFile(this.balanceStorage, JSON.stringify(balances, null, 2));
    } catch (error) {
      console.error('Error updating balances after mining:', error);
    }
  }

  // Update token balance helper
  async updateTokenBalance(balances, address, contractAddress, amount) {
    if (!balances.balances[address]) {
      balances.balances[address] = {};
    }
    
    if (!balances.balances[address][contractAddress]) {
      balances.balances[address][contractAddress] = 0;
    }
    
    balances.balances[address][contractAddress] += amount;
    
    // Ensure balance doesn't go negative
    if (balances.balances[address][contractAddress] < 0) {
      balances.balances[address][contractAddress] = 0;
    }
  }

  // Get transaction type for display
  getTransactionType(transaction) {
    if (transaction.tokenContract) {
      return 'TOKEN_TRANSFER';
    }
    return 'PSN_TRANSFER';
  }

  // Enhanced transaction history with token information
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
            confirmations: this.chain.length - block.index,
            transactionType: this.getTransactionType(tx),
            tokenContract: tx.tokenContract || null,
            gasFee: tx.gasFee || 0
          });
        }
      }
    }

    return txs.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Enhanced storage save with token data
  async saveToStorage() {
    const data = {
      chain: this.chain,
      pendingTransactions: this.pendingTransactions,
      difficulty: this.difficulty,
      miningReward: this.miningReward,
      nativeTokenSymbol: this.nativeTokenSymbol
    };
    
    await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
  }

  // Create genesis block with developer funds allocation
  createGenesisBlockWithDeveloperFunds(developerAddress) {
    const genesis = new Block(Date.now(), [], '0');
    genesis.index = 0;
    
    // Developer allocation transaction (1B PSN)
    const developerAllocation = new TokenTransaction(
      null, // sender = null (minting from genesis)
      developerAddress,
      1000000000, // 1B PSN
      null, // native PSN (no token contract)
      0, // no gas fee for genesis
      Date.now()
    );
    
    genesis.transactions = [developerAllocation];
    genesis.hash = genesis.calculateHash();
    
    console.log(`🎉 Genesis block created with ${developerAllocation.amount.toLocaleString()} PSN for developer: ${developerAddress}`);
    return genesis;
  }

  // Enhanced load from storage with token data
  async loadFromStorage() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const parsed = JSON.parse(data);
      
      this.chain = parsed.chain.map(blockData => {
        const transactions = blockData.transactions.map(txData => {
          if (txData.tokenContract !== undefined) {
            // This is a token transaction
            const tx = new TokenTransaction(
              txData.sender, 
              txData.recipient, 
              txData.amount, 
              txData.tokenContract,
              txData.gasPrice,
              txData.timestamp
            );
            tx.signature = txData.signature;
            tx.txHash = txData.txHash;
            tx.gasFee = txData.gasFee;
            tx.transactionType = txData.transactionType;
            return tx;
          } else {
            // This is a regular PSN transaction
            const tx = new Transaction(txData.sender, txData.recipient, txData.amount, txData.timestamp);
            tx.signature = txData.signature;
            tx.txHash = txData.txHash;
            return tx;
          }
        });
        
        const block = new Block(blockData.timestamp, transactions, blockData.previousHash);
        block.index = blockData.index;
        block.hash = blockData.hash;
        block.nonce = blockData.nonce;
        return block;
      });
      
      this.pendingTransactions = parsed.pendingTransactions.map(txData => {
        if (txData.tokenContract !== undefined) {
          const tx = new TokenTransaction(
            txData.sender, 
            txData.recipient, 
            txData.amount, 
            txData.tokenContract,
            txData.gasPrice,
            txData.timestamp
          );
          tx.signature = txData.signature;
          tx.txHash = txData.txHash;
          tx.gasFee = txData.gasFee;
          tx.transactionType = txData.transactionType;
          return tx;
        } else {
          const tx = new Transaction(txData.sender, txData.recipient, txData.amount, txData.timestamp);
          tx.signature = txData.signature;
          tx.txHash = txData.txHash;
          return tx;
        }
      });
      
      this.difficulty = parsed.difficulty || 2;
      this.miningReward = parsed.miningReward || 100;
      this.nativeTokenSymbol = parsed.nativeTokenSymbol || 'PSN';
      
      if (this.chain.length === 0) {
        this.chain = [this.createGenesisBlock()];
        await this.saveToStorage();
      }
    } catch (error) {
      console.log('Creating new enhanced blockchain...');
      this.chain = [this.createGenesisBlock()];
      await this.saveToStorage();
    }
  }
}

module.exports = { EnhancedBlockchain, TokenTransaction };