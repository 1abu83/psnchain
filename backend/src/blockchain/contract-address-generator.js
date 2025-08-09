const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { TokenError, TOKEN_ERRORS } = require('./token-errors');

/**
 * ContractAddressGenerator class for generating unique contract addresses
 * Format: PSN + 40 hex characters
 */
class ContractAddressGenerator {
  constructor() {
    this.storageFile = path.join(__dirname, '../storage/tokens.json');
    this.usedAddresses = new Set();
    this.loadUsedAddresses();
  }

  /**
   * Load existing contract addresses from storage to prevent duplicates
   */
  async loadUsedAddresses() {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Load all existing contract addresses
      if (parsed.contractAddresses && Array.isArray(parsed.contractAddresses)) {
        parsed.contractAddresses.forEach(address => {
          this.usedAddresses.add(address);
        });
      }
      
      // Also load from tokens object keys
      if (parsed.tokens && typeof parsed.tokens === 'object') {
        Object.keys(parsed.tokens).forEach(address => {
          this.usedAddresses.add(address);
        });
      }
    } catch (error) {
      // File doesn't exist or is empty, start with empty set
      console.log('No existing contract addresses found, starting fresh');
    }
  }

  /**
   * Generate a unique contract address
   * @param {string} tokenName - Name of the token
   * @param {string} symbol - Symbol of the token
   * @param {string} creator - Address of the token creator
   * @param {number} timestamp - Creation timestamp (optional)
   * @returns {string} Unique contract address in format PSN + 40 hex characters
   */
  generateContractAddress(tokenName, symbol, creator, timestamp = Date.now()) {
    // Validate input parameters
    this.validateGenerationParameters(tokenName, symbol, creator);

    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      // Create unique data string
      const uniqueData = this.createUniqueDataString(tokenName, symbol, creator, timestamp, attempts);
      
      // Generate hash
      const hash = crypto.createHash('sha256').update(uniqueData).digest('hex');
      
      // Create contract address with PSN prefix + 40 hex characters
      const contractAddress = 'PSN' + hash.substring(0, 40);
      
      // Check if address is unique
      if (!this.usedAddresses.has(contractAddress)) {
        // Add to used addresses set
        this.usedAddresses.add(contractAddress);
        
        // Save to storage (async but don't wait to avoid blocking)
        this.saveContractAddress(contractAddress).catch(error => {
          console.error('Error saving contract address:', error);
        });
        
        return contractAddress;
      }
      
      attempts++;
    }
    
    // If we reach here, we couldn't generate a unique address
    throw new TokenError(
      'Failed to generate unique contract address after maximum attempts',
      TOKEN_ERRORS.DUPLICATE_CONTRACT_ADDRESS,
      { maxAttempts, tokenName, symbol, creator }
    );
  }

  /**
   * Create unique data string for hashing
   * @param {string} tokenName 
   * @param {string} symbol 
   * @param {string} creator 
   * @param {number} timestamp 
   * @param {number} nonce 
   * @returns {string}
   */
  createUniqueDataString(tokenName, symbol, creator, timestamp, nonce) {
    // Include multiple sources of entropy
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const processId = process.pid.toString();
    const memoryUsage = process.memoryUsage().heapUsed.toString();
    
    return [
      tokenName,
      symbol,
      creator,
      timestamp.toString(),
      nonce.toString(),
      randomBytes,
      processId,
      memoryUsage
    ].join('|');
  }

  /**
   * Validate parameters for contract address generation
   * @param {string} tokenName 
   * @param {string} symbol 
   * @param {string} creator 
   */
  validateGenerationParameters(tokenName, symbol, creator) {
    if (!tokenName || typeof tokenName !== 'string' || tokenName.trim().length === 0) {
      throw new TokenError(
        'Token name is required for contract address generation',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'tokenName', value: tokenName }
      );
    }

    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      throw new TokenError(
        'Token symbol is required for contract address generation',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'symbol', value: symbol }
      );
    }

    if (!creator || typeof creator !== 'string' || !this.isValidWalletAddress(creator)) {
      throw new TokenError(
        'Valid creator address is required for contract address generation',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'creator', value: creator }
      );
    }
  }

  /**
   * Validate wallet address format
   * @param {string} address 
   * @returns {boolean}
   */
  isValidWalletAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    return address.startsWith('psn') && address.length === 43;
  }

  /**
   * Validate contract address format
   * @param {string} address - Contract address to validate
   * @returns {boolean} True if valid format
   */
  validateContractAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    // Contract address format: PSN + 40 hex characters
    return /^PSN[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if contract address format is valid and throw error if not
   * @param {string} address 
   * @throws {TokenError}
   */
  validateContractAddressStrict(address) {
    if (!this.validateContractAddress(address)) {
      throw new TokenError(
        'Invalid contract address format. Must be PSN followed by 40 hex characters',
        TOKEN_ERRORS.INVALID_CONTRACT_ADDRESS,
        { 
          providedAddress: address, 
          expectedFormat: 'PSN + 40 hex characters',
          example: 'PSN1234567890abcdef1234567890abcdef12345678'
        }
      );
    }
    return true;
  }

  /**
   * Check if a contract address already exists
   * @param {string} contractAddress 
   * @returns {boolean}
   */
  isAddressUsed(contractAddress) {
    return this.usedAddresses.has(contractAddress);
  }

  /**
   * Check if contract address exists in storage
   * @param {string} contractAddress 
   * @returns {Promise<boolean>}
   */
  async contractExists(contractAddress) {
    try {
      const data = await fs.readFile(this.storageFile, 'utf8');
      const parsed = JSON.parse(data);
      
      // Check in tokens object
      if (parsed.tokens && parsed.tokens[contractAddress]) {
        return true;
      }
      
      // Check in contractAddresses array
      if (parsed.contractAddresses && parsed.contractAddresses.includes(contractAddress)) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save contract address to storage
   * @param {string} contractAddress 
   */
  async saveContractAddress(contractAddress) {
    try {
      let data;
      try {
        const fileData = await fs.readFile(this.storageFile, 'utf8');
        data = JSON.parse(fileData);
      } catch (error) {
        // File doesn't exist, create new structure
        data = {
          tokens: {},
          contractAddresses: []
        };
      }
      
      // Ensure contractAddresses array exists
      if (!data.contractAddresses) {
        data.contractAddresses = [];
      }
      
      // Add contract address if not already present
      if (!data.contractAddresses.includes(contractAddress)) {
        data.contractAddresses.push(contractAddress);
      }
      
      // Ensure storage directory exists
      const storageDir = path.dirname(this.storageFile);
      try {
        await fs.access(storageDir);
      } catch {
        await fs.mkdir(storageDir, { recursive: true });
      }
      
      // Save to file
      await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving contract address:', error);
      throw new TokenError(
        'Failed to save contract address to storage',
        TOKEN_ERRORS.TOKEN_CREATION_FAILED,
        { contractAddress, error: error.message }
      );
    }
  }

  /**
   * Get all used contract addresses
   * @returns {Array<string>}
   */
  getAllUsedAddresses() {
    return Array.from(this.usedAddresses);
  }

  /**
   * Get statistics about contract address generation
   * @returns {Object}
   */
  getStatistics() {
    return {
      totalAddressesGenerated: this.usedAddresses.size,
      addressFormat: 'PSN + 40 hex characters',
      totalPossibleAddresses: Math.pow(16, 40), // 16^40 possible hex combinations
      collisionProbability: this.usedAddresses.size / Math.pow(16, 40)
    };
  }

  /**
   * Generate multiple contract addresses for batch operations
   * @param {Array} tokenData - Array of {tokenName, symbol, creator} objects
   * @returns {Array<string>} Array of generated contract addresses
   */
  generateBatchContractAddresses(tokenData) {
    const results = [];
    
    for (const token of tokenData) {
      try {
        const contractAddress = this.generateContractAddress(
          token.tokenName,
          token.symbol,
          token.creator
        );
        results.push({
          success: true,
          contractAddress,
          tokenName: token.tokenName,
          symbol: token.symbol
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          tokenName: token.tokenName,
          symbol: token.symbol
        });
      }
    }
    
    return results;
  }

  /**
   * Reset the generator (for testing purposes)
   */
  reset() {
    this.usedAddresses.clear();
  }
}

module.exports = { ContractAddressGenerator };