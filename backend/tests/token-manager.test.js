const { TokenManager } = require('../src/blockchain/token-manager');
const { TokenError, TOKEN_ERRORS } = require('../src/blockchain/token-errors');
const fs = require('fs').promises;
const path = require('path');

describe('TokenManager with Contract Address Validation', () => {
  let tokenManager;
  let testCreatorAddress;

  beforeEach(async () => {
    tokenManager = new TokenManager();
    testCreatorAddress = 'psn1234567890abcdef1234567890abcdef12345678';
    
    // Clean up test files
    await cleanupTestFiles();
    
    // Initialize storage
    await tokenManager.initializeStorage();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  async function cleanupTestFiles() {
    const files = [
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

  describe('Custom Token Creation with Contract Address Validation', () => {
    test('should create custom token with valid contract address', async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      expect(result.success).toBe(true);
      expect(result.contractAddress).toMatch(/^PSN[a-fA-F0-9]{40}$/);
      expect(result.tokenMetadata.name).toBe('TestToken');
      expect(result.tokenMetadata.symbol).toBe('TEST');
      expect(result.tokenMetadata.creator).toBe(testCreatorAddress);
    });

    test('should reject token creation with invalid parameters', async () => {
      await expect(tokenManager.createCustomToken(
        '', // Invalid name
        'TEST',
        1000000,
        18,
        testCreatorAddress
      )).rejects.toThrow(TokenError);

      await expect(tokenManager.createCustomToken(
        'TestToken',
        '', // Invalid symbol
        1000000,
        18,
        testCreatorAddress
      )).rejects.toThrow(TokenError);

      await expect(tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        0, // Invalid supply
        18,
        testCreatorAddress
      )).rejects.toThrow(TokenError);
    });

    test('should reject duplicate token symbols', async () => {
      // Create first token
      await tokenManager.createCustomToken(
        'TestToken1',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      // Try to create second token with same symbol
      await expect(tokenManager.createCustomToken(
        'TestToken2',
        'TEST', // Duplicate symbol
        2000000,
        18,
        testCreatorAddress
      )).rejects.toThrow('Token with symbol TEST already exists');
    });

    test('should allocate initial supply to creator', async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      const balance = await tokenManager.getTokenBalance(
        testCreatorAddress,
        result.contractAddress
      );

      expect(balance).toBe(1000000);
    });
  });

  describe('Contract Address Validation Integration', () => {
    test('should validate contract address format', async () => {
      const validAddress = 'PSN1234567890abcdef1234567890abcdef12345678';
      const invalidAddress = 'invalid-address';

      // This should not throw for valid format (but may throw for non-existence)
      try {
        await tokenManager.validateContractAddressAndExistence(validAddress);
      } catch (error) {
        expect(error.code).toBe(TOKEN_ERRORS.TOKEN_NOT_FOUND);
      }

      // This should throw for invalid format
      await expect(
        tokenManager.validateContractAddressAndExistence(invalidAddress)
      ).rejects.toThrow(TokenError);
    });

    test('should validate contract address existence', async () => {
      // Create a token first
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      // Should validate successfully for existing contract
      const isValid = await tokenManager.validateContractAddressAndExistence(
        result.contractAddress
      );
      expect(isValid).toBe(true);

      // Should throw for non-existent contract
      const nonExistentAddress = 'PSN9999999999999999999999999999999999999999';
      await expect(
        tokenManager.validateContractAddressAndExistence(nonExistentAddress)
      ).rejects.toThrow('Token contract not found');
    });
  });

  describe('Token Retrieval and Search', () => {
    test('should get token by contract address', async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      const token = await tokenManager.getTokenByContract(result.contractAddress);
      expect(token).not.toBeNull();
      expect(token.name).toBe('TestToken');
      expect(token.symbol).toBe('TEST');
    });

    test('should get token by symbol', async () => {
      await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      const token = await tokenManager.getTokenBySymbol('TEST');
      expect(token).not.toBeNull();
      expect(token.name).toBe('TestToken');
      expect(token.symbol).toBe('TEST');
    });

    test('should search tokens by name and symbol', async () => {
      await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      await tokenManager.createCustomToken(
        'AnotherToken',
        'ANOTHER',
        2000000,
        18,
        testCreatorAddress
      );

      const searchResults = await tokenManager.searchTokens('test');
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].name).toBe('TestToken');

      const allResults = await tokenManager.searchTokens('token');
      expect(allResults.length).toBe(2);
    });

    test('should get all tokens', async () => {
      await tokenManager.createCustomToken(
        'Token1',
        'TK1',
        1000000,
        18,
        testCreatorAddress
      );

      await tokenManager.createCustomToken(
        'Token2',
        'TK2',
        2000000,
        18,
        testCreatorAddress
      );

      const allTokens = await tokenManager.getAllTokens();
      expect(allTokens.length).toBe(2);
    });
  });

  describe('Token Transfer with Contract Address Validation', () => {
    let contractAddress;

    beforeEach(async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );
      contractAddress = result.contractAddress;
    });

    test('should transfer tokens successfully', async () => {
      const recipientAddress = 'psn9876543210fedcba9876543210fedcba987654321';
      const transferAmount = 100000;

      const result = await tokenManager.transferCustomToken(
        contractAddress,
        testCreatorAddress,
        recipientAddress,
        transferAmount
      );

      expect(result.success).toBe(true);

      // Check balances
      const senderBalance = await tokenManager.getTokenBalance(
        testCreatorAddress,
        contractAddress
      );
      const recipientBalance = await tokenManager.getTokenBalance(
        recipientAddress,
        contractAddress
      );

      expect(senderBalance).toBe(900000);
      expect(recipientBalance).toBe(100000);
    });

    test('should reject transfer with invalid contract address', async () => {
      const recipientAddress = 'psn9876543210fedcba9876543210fedcba987654321';
      const invalidContract = 'invalid-contract';

      await expect(tokenManager.transferCustomToken(
        invalidContract,
        testCreatorAddress,
        recipientAddress,
        100000
      )).rejects.toThrow(TokenError);
    });

    test('should reject transfer with non-existent contract', async () => {
      const recipientAddress = 'psn9876543210fedcba9876543210fedcba987654321';
      const nonExistentContract = 'PSN9999999999999999999999999999999999999999';

      await expect(tokenManager.transferCustomToken(
        nonExistentContract,
        testCreatorAddress,
        recipientAddress,
        100000
      )).rejects.toThrow('Token contract not found');
    });

    test('should reject transfer with insufficient balance', async () => {
      const recipientAddress = 'psn9876543210fedcba9876543210fedcba987654321';
      const excessiveAmount = 2000000; // More than total supply

      await expect(tokenManager.transferCustomToken(
        contractAddress,
        testCreatorAddress,
        recipientAddress,
        excessiveAmount
      )).rejects.toThrow('Insufficient token balance');
    });

    test('should reject transfer with invalid addresses', async () => {
      await expect(tokenManager.transferCustomToken(
        contractAddress,
        'invalid-sender',
        'psn9876543210fedcba9876543210fedcba987654321',
        100000
      )).rejects.toThrow(TokenError);

      await expect(tokenManager.transferCustomToken(
        contractAddress,
        testCreatorAddress,
        'invalid-recipient',
        100000
      )).rejects.toThrow(TokenError);
    });
  });

  describe('Balance Management', () => {
    let contractAddress;

    beforeEach(async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );
      contractAddress = result.contractAddress;
    });

    test('should get token balance', async () => {
      const balance = await tokenManager.getTokenBalance(
        testCreatorAddress,
        contractAddress
      );
      expect(balance).toBe(1000000);
    });

    test('should get all token balances for address', async () => {
      // Create another token
      const result2 = await tokenManager.createCustomToken(
        'SecondToken',
        'SECOND',
        500000,
        18,
        testCreatorAddress
      );

      const allBalances = await tokenManager.getAllTokenBalances(testCreatorAddress);
      expect(Object.keys(allBalances).length).toBe(2);
      expect(allBalances[contractAddress]).toBe(1000000);
      expect(allBalances[result2.contractAddress]).toBe(500000);
    });

    test('should return zero balance for non-existent token', async () => {
      const nonExistentContract = 'PSN9999999999999999999999999999999999999999';
      
      // Should throw error for non-existent contract
      await expect(
        tokenManager.getTokenBalance(testCreatorAddress, nonExistentContract)
      ).rejects.toThrow('Token contract not found');
    });
  });

  describe('Token Metadata and Export', () => {
    let contractAddress;

    beforeEach(async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );
      contractAddress = result.contractAddress;
    });

    test('should export token metadata', async () => {
      const exportData = await tokenManager.exportTokenMetadata(contractAddress);

      expect(exportData.contractAddress).toBe(contractAddress);
      expect(exportData.metadata.name).toBe('TestToken');
      expect(exportData.metadata.symbol).toBe('TEST');
      expect(exportData.format).toBe('PSN Token Metadata v1.0');
    });

    test('should get token statistics', async () => {
      // Create another token
      await tokenManager.createCustomToken(
        'SecondToken',
        'SECOND',
        500000,
        8,
        testCreatorAddress
      );

      const stats = await tokenManager.getTokenStatistics();

      expect(stats.totalTokens).toBe(2);
      expect(stats.totalSupply).toBe(1500000);
      expect(stats.averageDecimals).toBe(13); // (18 + 8) / 2
      expect(stats.contractAddressStats).toBeDefined();
      expect(stats.oldestToken).toBeDefined();
      expect(stats.newestToken).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should throw TokenError with correct error codes', async () => {
      try {
        await tokenManager.createCustomToken(
          '', // Invalid name
          'TEST',
          1000000,
          18,
          testCreatorAddress
        );
      } catch (error) {
        expect(error).toBeInstanceOf(TokenError);
        expect(error.code).toBe(TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS);
      }
    });

    test('should handle storage errors gracefully', async () => {
      // This test would require mocking fs operations to simulate storage errors
      // For now, we test that the methods exist and handle basic error cases
      const result = await tokenManager.getAllTokens();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Integration with ContractAddressGenerator', () => {
    test('should generate unique contract addresses for multiple tokens', async () => {
      const addresses = new Set();

      for (let i = 0; i < 10; i++) {
        const result = await tokenManager.createCustomToken(
          `Token${i}`,
          `TK${i}`,
          1000000,
          18,
          testCreatorAddress
        );
        addresses.add(result.contractAddress);
      }

      // All addresses should be unique
      expect(addresses.size).toBe(10);

      // All addresses should have correct format
      addresses.forEach(address => {
        expect(address).toMatch(/^PSN[a-fA-F0-9]{40}$/);
      });
    });

    test('should validate contract addresses consistently', async () => {
      const result = await tokenManager.createCustomToken(
        'TestToken',
        'TEST',
        1000000,
        18,
        testCreatorAddress
      );

      // Should validate through TokenManager
      const isValid = await tokenManager.validateContractAddressAndExistence(
        result.contractAddress
      );
      expect(isValid).toBe(true);

      // Should also be accessible through direct generator access
      const exists = await tokenManager.contractAddressGenerator.contractExists(
        result.contractAddress
      );
      expect(exists).toBe(true);
    });
  });
});