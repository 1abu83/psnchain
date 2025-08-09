const { ContractAddressGenerator } = require('../src/blockchain/contract-address-generator');
const { TokenError, TOKEN_ERRORS } = require('../src/blockchain/token-errors');
const fs = require('fs').promises;
const path = require('path');

describe('ContractAddressGenerator', () => {
  let generator;
  let testCreatorAddress;

  beforeEach(async () => {
    generator = new ContractAddressGenerator();
    testCreatorAddress = 'psn1234567890abcdef1234567890abcdef12345678'; // 43 characters total
    
    // Clean up test files
    await cleanupTestFiles();
    
    // Reset generator state
    generator.reset();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  async function cleanupTestFiles() {
    const files = [
      path.join(__dirname, '../src/storage/tokens.json')
    ];

    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }
  }

  describe('Contract Address Generation', () => {
    test('should generate valid contract address format', () => {
      const contractAddress = generator.generateContractAddress(
        'TestToken',
        'TEST',
        testCreatorAddress
      );

      expect(contractAddress).toMatch(/^PSN[a-fA-F0-9]{40}$/);
      expect(contractAddress.length).toBe(43); // PSN + 40 hex chars
    });

    test('should generate unique contract addresses', () => {
      const address1 = generator.generateContractAddress(
        'TestToken1',
        'TEST1',
        testCreatorAddress
      );

      const address2 = generator.generateContractAddress(
        'TestToken2',
        'TEST2',
        testCreatorAddress
      );

      expect(address1).not.toBe(address2);
      expect(generator.validateContractAddress(address1)).toBe(true);
      expect(generator.validateContractAddress(address2)).toBe(true);
    });

    test('should generate different addresses for same token with different creators', () => {
      const creator1 = 'psn1111111111111111111111111111111111111111'; // 43 chars
      const creator2 = 'psn2222222222222222222222222222222222222222'; // 43 chars

      const address1 = generator.generateContractAddress('SameToken', 'SAME', creator1);
      const address2 = generator.generateContractAddress('SameToken', 'SAME', creator2);

      expect(address1).not.toBe(address2);
    });

    test('should track used addresses to prevent duplicates', () => {
      const address1 = generator.generateContractAddress(
        'TestToken',
        'TEST',
        testCreatorAddress
      );

      expect(generator.isAddressUsed(address1)).toBe(true);
      expect(generator.getAllUsedAddresses()).toContain(address1);
    });

    test('should handle collision prevention', () => {
      // Generate many addresses to test collision prevention
      const addresses = new Set();
      const count = 100;

      for (let i = 0; i < count; i++) {
        const address = generator.generateContractAddress(
          `TestToken${i}`,
          `TEST${i}`,
          testCreatorAddress
        );
        addresses.add(address);
      }

      // All addresses should be unique
      expect(addresses.size).toBe(count);
    });
  });

  describe('Parameter Validation', () => {
    test('should reject empty token name', () => {
      expect(() => {
        generator.generateContractAddress('', 'TEST', testCreatorAddress);
      }).toThrow(TokenError);

      expect(() => {
        generator.generateContractAddress(null, 'TEST', testCreatorAddress);
      }).toThrow('Token name is required');
    });

    test('should reject empty token symbol', () => {
      expect(() => {
        generator.generateContractAddress('TestToken', '', testCreatorAddress);
      }).toThrow(TokenError);

      expect(() => {
        generator.generateContractAddress('TestToken', null, testCreatorAddress);
      }).toThrow('Token symbol is required');
    });

    test('should reject invalid creator address', () => {
      expect(() => {
        generator.generateContractAddress('TestToken', 'TEST', 'invalid-address');
      }).toThrow(TokenError);

      expect(() => {
        generator.generateContractAddress('TestToken', 'TEST', null);
      }).toThrow('Valid creator address is required');
    });

    test('should accept valid parameters', () => {
      expect(() => {
        generator.generateContractAddress('TestToken', 'TEST', testCreatorAddress);
      }).not.toThrow();
    });
  });

  describe('Contract Address Validation', () => {
    test('should validate correct contract address format', () => {
      const validAddress = 'PSN1234567890abcdef1234567890abcdef12345678';
      expect(generator.validateContractAddress(validAddress)).toBe(true);
    });

    test('should reject invalid contract address formats', () => {
      const invalidAddresses = [
        'PSN123', // Too short
        'PSN1234567890abcdef1234567890abcdef123456789', // Too long
        'ABC1234567890abcdef1234567890abcdef12345678', // Wrong prefix
        'psn1234567890abcdef1234567890abcdef12345678', // Lowercase prefix
        'PSN1234567890abcdef1234567890abcdef1234567g', // Invalid hex character
        '', // Empty
        null, // Null
        undefined // Undefined
      ];

      invalidAddresses.forEach(address => {
        expect(generator.validateContractAddress(address)).toBe(false);
      });
    });

    test('should throw error for invalid address in strict validation', () => {
      expect(() => {
        generator.validateContractAddressStrict('invalid-address');
      }).toThrow(TokenError);

      expect(() => {
        generator.validateContractAddressStrict('PSN1234567890abcdef1234567890abcdef12345678');
      }).not.toThrow();
    });
  });

  describe('Storage Operations', () => {
    test('should save contract address to storage', async () => {
      const contractAddress = generator.generateContractAddress(
        'TestToken',
        'TEST',
        testCreatorAddress
      );

      // Wait a bit for async save operation to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if address was saved
      const exists = await generator.contractExists(contractAddress);
      expect(exists).toBe(true);
    });

    test('should load existing addresses from storage', async () => {
      // Create initial storage with some addresses
      const storageData = {
        tokens: {
          'PSN1111111111111111111111111111111111111111': {
            name: 'ExistingToken',
            symbol: 'EXIST'
          }
        },
        contractAddresses: [
          'PSN1111111111111111111111111111111111111111',
          'PSN2222222222222222222222222222222222222222'
        ]
      };

      const storageDir = path.dirname(generator.storageFile);
      await fs.mkdir(storageDir, { recursive: true });
      await fs.writeFile(generator.storageFile, JSON.stringify(storageData, null, 2));

      // Create new generator to test loading
      const newGenerator = new ContractAddressGenerator();
      await newGenerator.loadUsedAddresses();

      expect(newGenerator.isAddressUsed('PSN1111111111111111111111111111111111111111')).toBe(true);
      expect(newGenerator.isAddressUsed('PSN2222222222222222222222222222222222222222')).toBe(true);
    });

    test('should handle missing storage file gracefully', async () => {
      const newGenerator = new ContractAddressGenerator();
      
      // Should not throw error when storage file doesn't exist
      await expect(newGenerator.loadUsedAddresses()).resolves.not.toThrow();
      
      // Should be able to generate addresses
      const address = newGenerator.generateContractAddress(
        'TestToken',
        'TEST',
        testCreatorAddress
      );
      expect(newGenerator.validateContractAddress(address)).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    test('should generate multiple contract addresses in batch', () => {
      const tokenData = [
        { tokenName: 'Token1', symbol: 'TK1', creator: testCreatorAddress },
        { tokenName: 'Token2', symbol: 'TK2', creator: testCreatorAddress },
        { tokenName: 'Token3', symbol: 'TK3', creator: testCreatorAddress }
      ];

      const results = generator.generateBatchContractAddresses(tokenData);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.contractAddress).toMatch(/^PSN[a-fA-F0-9]{40}$/);
      });

      // All addresses should be unique
      const addresses = results.map(r => r.contractAddress);
      const uniqueAddresses = new Set(addresses);
      expect(uniqueAddresses.size).toBe(addresses.length);
    });

    test('should handle batch generation with invalid data', () => {
      const tokenData = [
        { tokenName: 'ValidToken', symbol: 'VALID', creator: testCreatorAddress },
        { tokenName: '', symbol: 'INVALID', creator: testCreatorAddress }, // Invalid name
        { tokenName: 'AnotherValid', symbol: 'VALID2', creator: testCreatorAddress }
      ];

      const results = generator.generateBatchContractAddresses(tokenData);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);

      expect(results[1].error).toContain('Token name is required');
    });
  });

  describe('Statistics and Utilities', () => {
    test('should provide generation statistics', () => {
      // Generate some addresses
      generator.generateContractAddress('Token1', 'TK1', testCreatorAddress);
      generator.generateContractAddress('Token2', 'TK2', testCreatorAddress);

      const stats = generator.getStatistics();

      expect(stats.totalAddressesGenerated).toBe(2);
      expect(stats.addressFormat).toBe('PSN + 40 hex characters');
      expect(stats.totalPossibleAddresses).toBe(Math.pow(16, 40));
      expect(stats.collisionProbability).toBeGreaterThan(0);
    });

    test('should return all used addresses', () => {
      const address1 = generator.generateContractAddress('Token1', 'TK1', testCreatorAddress);
      const address2 = generator.generateContractAddress('Token2', 'TK2', testCreatorAddress);

      const usedAddresses = generator.getAllUsedAddresses();

      expect(usedAddresses).toContain(address1);
      expect(usedAddresses).toContain(address2);
      expect(usedAddresses).toHaveLength(2);
    });

    test('should reset generator state', () => {
      generator.generateContractAddress('Token1', 'TK1', testCreatorAddress);
      expect(generator.getAllUsedAddresses()).toHaveLength(1);

      generator.reset();
      expect(generator.getAllUsedAddresses()).toHaveLength(0);
    });
  });

  describe('Wallet Address Validation', () => {
    test('should validate correct wallet address format', () => {
      const validAddresses = [
        'psn1234567890abcdef1234567890abcdef12345678', // 43 chars
        'psn0000000000000000000000000000000000000000', // 43 chars
        'psnabcdefabcdefabcdefabcdefabcdefabcdefabcd'  // 43 chars
      ];

      validAddresses.forEach(address => {
        expect(generator.isValidWalletAddress(address)).toBe(true);
      });
    });

    test('should reject invalid wallet address formats', () => {
      const invalidAddresses = [
        'PSN1234567890abcdef1234567890abcdef12345678', // Wrong prefix case
        'psn123', // Too short
        'psn1234567890abcdef1234567890abcdef123456789', // Too long
        'abc1234567890abcdef1234567890abcdef12345678', // Wrong prefix
        '', // Empty
        null, // Null
        undefined // Undefined
      ];

      invalidAddresses.forEach(address => {
        expect(generator.isValidWalletAddress(address)).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    test('should throw TokenError with correct error code for invalid parameters', () => {
      try {
        generator.generateContractAddress('', 'TEST', testCreatorAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(TokenError);
        expect(error.code).toBe(TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS);
        expect(error.details.field).toBe('tokenName');
      }
    });

    test('should throw TokenError for invalid contract address validation', () => {
      try {
        generator.validateContractAddressStrict('invalid-address');
      } catch (error) {
        expect(error).toBeInstanceOf(TokenError);
        expect(error.code).toBe(TOKEN_ERRORS.INVALID_CONTRACT_ADDRESS);
        expect(error.details.expectedFormat).toBe('PSN + 40 hex characters');
      }
    });
  });
});