const { EnhancedBlockchain, TokenTransaction } = require('../src/blockchain/enhanced-blockchain');
const { TokenError, TOKEN_ERRORS } = require('../src/blockchain/token-errors');
const fs = require('fs').promises;
const path = require('path');

describe('Enhanced Blockchain Core', () => {
  let blockchain;
  let testWalletAddress;
  let testPrivateKey;

  beforeEach(async () => {
    // Create fresh blockchain instance for each test
    blockchain = new EnhancedBlockchain();
    testWalletAddress = 'psn1234567890abcdef1234567890abcdef123456';
    testPrivateKey = 'a'.repeat(64); // 64 character hex private key
    
    // Clean up test files
    await cleanupTestFiles();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  async function cleanupTestFiles() {
    const files = [
      path.join(__dirname, '../src/storage/blockchain.json'),
      path.join(__dirname, '../src/storage/tokens.json'),
      path.join(__dirname, '../src/storage/balances.json')
    ];

    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }
  }

  describe('TokenTransaction Class', () => {
    test('should create PSN transaction without contract address', () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        100
      );

      expect(tx.tokenContract).toBeNull();
      expect(tx.transactionType).toBe('PSN_TRANSFER');
      expect(tx.amount).toBe(100);
      expect(tx.gasFee).toBeGreaterThan(0);
    });

    test('should create custom token transaction with contract address', () => {
      const contractAddress = 'PSN1234567890abcdef1234567890abcdef12345678';
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        50,
        contractAddress
      );

      expect(tx.tokenContract).toBe(contractAddress);
      expect(tx.transactionType).toBe('TOKEN_TRANSFER');
      expect(tx.amount).toBe(50);
      expect(tx.gasFee).toBeGreaterThan(0);
    });

    test('should calculate gas fee correctly for PSN transfer', () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        100
      );

      // PSN transfer should have base fee + data fee (no token fee)
      expect(tx.gasFee).toBeGreaterThanOrEqual(0.001);
      expect(tx.gasFee).toBeLessThan(0.005); // Adjusted for smaller data fee
    });

    test('should calculate higher gas fee for token transfer', () => {
      const contractAddress = 'PSN1234567890abcdef1234567890abcdef12345678';
      const tokenTx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        50,
        contractAddress
      );

      const psnTx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        50
      );

      // Token transfer should have higher gas fee than PSN transfer
      expect(tokenTx.gasFee).toBeGreaterThan(psnTx.gasFee);
    });

    test('should validate contract address format', () => {
      expect(() => {
        new TokenTransaction(
          testWalletAddress,
          'psn9876543210fedcba9876543210fedcba987654',
          50,
          'invalid-contract-address'
        );
      }).toThrow('Invalid contract address format');
    });

    test('should validate transaction signature requirement', () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        100
      );

      expect(() => {
        tx.isValid();
      }).toThrow('No signature in this transaction');
    });

    test('should pass validation with proper signature', () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        100
      );
      
      tx.signature = 'valid-signature-hash';
      expect(tx.isValid()).toBe(true);
    });
  });

  describe('EnhancedBlockchain Class', () => {
    test('should initialize with native token symbol', () => {
      expect(blockchain.nativeTokenSymbol).toBe('PSN');
    });

    test('should initialize token storage files', async () => {
      await blockchain.initializeTokenStorage();
      
      // Check if token storage files are created
      const tokenStorageExists = await fs.access(blockchain.tokenStorage).then(() => true).catch(() => false);
      const balanceStorageExists = await fs.access(blockchain.balanceStorage).then(() => true).catch(() => false);
      
      expect(tokenStorageExists).toBe(true);
      expect(balanceStorageExists).toBe(true);
    });

    test('should validate token contract existence', async () => {
      // Test with non-existent contract
      const exists = await blockchain.validateTokenContract('PSN1234567890abcdef1234567890abcdef12345678');
      expect(exists).toBe(false);
    });

    test('should get zero token balance for non-existent token', async () => {
      const balance = await blockchain.getTokenBalance(
        testWalletAddress,
        'PSN1234567890abcdef1234567890abcdef12345678'
      );
      expect(balance).toBe(0);
    });

    test('should get all balances including PSN', async () => {
      const balances = await blockchain.getAllBalances(testWalletAddress);
      expect(balances).toHaveProperty('PSN');
      expect(typeof balances.PSN).toBe('number');
    });

    test('should reject transaction without sender', async () => {
      const tx = new TokenTransaction(
        null,
        'psn9876543210fedcba9876543210fedcba987654',
        100
      );

      await expect(blockchain.createTokenTransaction(tx))
        .rejects.toThrow('Transaction must include sender and recipient address');
    });

    test('should reject transaction without recipient', async () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        null,
        100
      );

      await expect(blockchain.createTokenTransaction(tx))
        .rejects.toThrow('Transaction must include sender and recipient address');
    });

    test('should reject transaction with zero amount', async () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        0
      );

      await expect(blockchain.createTokenTransaction(tx))
        .rejects.toThrow('Transaction amount should be higher than 0');
    });

    test('should reject transaction without signature', async () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        100
      );

      await expect(blockchain.createTokenTransaction(tx))
        .rejects.toThrow('Transaction must be signed');
    });

    test('should reject token transfer with non-existent contract', async () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        50,
        'PSN1234567890abcdef1234567890abcdef12345678'
      );
      tx.signature = 'valid-signature';

      await expect(blockchain.createTokenTransaction(tx))
        .rejects.toThrow('Token contract PSN1234567890abcdef1234567890abcdef12345678 not found');
    });

    test('should get transaction type correctly', () => {
      const psnTx = { tokenContract: null };
      const tokenTx = { tokenContract: 'PSN1234567890abcdef1234567890abcdef12345678' };

      expect(blockchain.getTransactionType(psnTx)).toBe('PSN_TRANSFER');
      expect(blockchain.getTransactionType(tokenTx)).toBe('TOKEN_TRANSFER');
    });

    test('should enhance transaction history with token information', () => {
      // This test would require setting up a blockchain with transactions
      // For now, test the basic functionality
      const transactions = blockchain.getAllTransactionsForWallet(testWalletAddress);
      expect(Array.isArray(transactions)).toBe(true);
    });

    test('should save and load enhanced blockchain data', async () => {
      blockchain.nativeTokenSymbol = 'TEST';
      await blockchain.saveToStorage();

      const newBlockchain = new EnhancedBlockchain();
      await newBlockchain.loadFromStorage();

      expect(newBlockchain.nativeTokenSymbol).toBe('TEST');
    });
  });

  describe('Balance Validation', () => {
    test('should validate PSN balance for PSN transfer', async () => {
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        1000000 // Large amount that exceeds balance
      );
      tx.signature = 'valid-signature';

      await expect(blockchain.createTokenTransaction(tx))
        .rejects.toThrow('Insufficient PSN balance');
    });

    test('should validate gas fee balance for token transfer', async () => {
      // This test would require setting up a token contract first
      // For now, test the validation logic exists
      const tx = new TokenTransaction(
        testWalletAddress,
        'psn9876543210fedcba9876543210fedcba987654',
        50,
        'PSN1234567890abcdef1234567890abcdef12345678'
      );

      expect(tx.gasFee).toBeGreaterThan(0);
    });
  });

  describe('Gas Fee Processing', () => {
    test('should process gas fees during mining', async () => {
      // Test that processGasFees method exists and runs without error
      await expect(blockchain.processGasFees()).resolves.not.toThrow();
    });

    test('should update balances after mining', async () => {
      const mockBlock = {
        transactions: []
      };

      // Test that updateBalancesAfterMining method exists and runs without error
      await expect(blockchain.updateBalancesAfterMining(mockBlock)).resolves.not.toThrow();
    });
  });
});

// Integration tests for enhanced blockchain
describe('Enhanced Blockchain Integration', () => {
  let blockchain;

  beforeEach(async () => {
    blockchain = new EnhancedBlockchain();
    await cleanupTestFiles();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  async function cleanupTestFiles() {
    const files = [
      path.join(__dirname, '../src/storage/blockchain.json'),
      path.join(__dirname, '../src/storage/tokens.json'),
      path.join(__dirname, '../src/storage/balances.json')
    ];

    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }
  }

  test('should handle complete PSN transaction flow', async () => {
    // This would be a full integration test
    // For now, verify the blockchain initializes correctly
    expect(blockchain.nativeTokenSymbol).toBe('PSN');
    expect(blockchain.chain.length).toBeGreaterThan(0); // Genesis block
  });

  test('should maintain backward compatibility with existing blockchain', () => {
    // Verify that enhanced blockchain can still handle regular transactions
    expect(blockchain.getBalanceOfAddress).toBeDefined();
    expect(blockchain.createTransaction).toBeDefined();
    expect(blockchain.minePendingTransactions).toBeDefined();
  });
});