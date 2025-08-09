const fs = require('fs').promises;
const path = require('path');
const { ContractAddressGenerator } = require('./contract-address-generator');
const { TokenError, TOKEN_ERRORS, TokenParameterValidator } = require('./token-errors');

/**
 * TokenManager class for managing custom tokens with contract addresses
 */
class TokenManager {
  constructor() {
    this.tokenStorage = path.join(__dirname, '../storage/tokens.json');
    this.balanceStorage = path.join(__dirname, '../storage/balances.json');
    this.contractAddressGenerator = new ContractAddressGenerator();
    this.parameterValidator = new TokenParameterValidator();
    
    this.initializeStorage();
  }

  /**
   * Initialize storage files
   */
  async initializeStorage() {
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

  /**
   * Create a new custom token with contract address
   * @param {string} name - Token name
   * @param {string} symbol - Token symbol
   * @param {number} totalSupply - Total supply
   * @param {number} decimals - Number of decimals
   * @param {string} creator - Creator wallet address
   * @returns {Object} Token creation result with contract address
   */
  async createCustomToken(name, symbol, totalSupply, decimals, creator) {
    try {
      // Validate token parameters
      this.parameterValidator.validateTokenCreationParameters({
        name, symbol, totalSupply, decimals, creator
      });

      // Check if token symbol already exists
      const existingToken = await this.getTokenBySymbol(symbol);
      if (existingToken) {
        throw new TokenError(
          `Token with symbol ${symbol} already exists`,
          TOKEN_ERRORS.DUPLICATE_CONTRACT_ADDRESS,
          { symbol, existingContract: existingToken.contractAddress }
        );
      }

      // Generate unique contract address
      const contractAddress = this.contractAddressGenerator.generateContractAddress(
        name, symbol, creator
      );

      // Create token metadata
      const tokenMetadata = {
        name,
        symbol,
        totalSupply,
        decimals,
        creator,
        contractAddress,
        createdAt: Date.now(),
        isNative: false
      };

      // Save token to storage
      await this.saveTokenToStorage(contractAddress, tokenMetadata);

      // Allocate initial supply to creator
      await this.allocateInitialSupply(creator, contractAddress, totalSupply);

      return {
        success: true,
        contractAddress,
        tokenMetadata,
        message: `Token ${name} (${symbol}) created successfully`
      };

    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      
      throw new TokenError(
        `Failed to create token: ${error.message}`,
        TOKEN_ERRORS.TOKEN_CREATION_FAILED,
        { name, symbol, creator, error: error.message }
      );
    }
  }

  /**
   * Get token by contract address
   * @param {string} contractAddress 
   * @returns {Object|null} Token metadata or null if not found
   */
  async getTokenByContract(contractAddress) {
    try {
      // Validate contract address format
      this.contractAddressGenerator.validateContractAddressStrict(contractAddress);

      const tokenData = await fs.readFile(this.tokenStorage, 'utf8');
      const parsed = JSON.parse(tokenData);

      return parsed.tokens[contractAddress] || null;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Get token by symbol
   * @param {string} symbol 
   * @returns {Object|null} Token metadata or null if not found
   */
  async getTokenBySymbol(symbol) {
    try {
      const tokenData = await fs.readFile(this.tokenStorage, 'utf8');
      const parsed = JSON.parse(tokenData);

      // Search through all tokens for matching symbol
      for (const [contractAddress, tokenInfo] of Object.entries(parsed.tokens)) {
        if (tokenInfo.symbol === symbol) {
          return tokenInfo;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all tokens
   * @returns {Array} Array of all token metadata
   */
  async getAllTokens() {
    try {
      const tokenData = await fs.readFile(this.tokenStorage, 'utf8');
      const parsed = JSON.parse(tokenData);

      return Object.values(parsed.tokens);
    } catch (error) {
      return [];
    }
  }

  /**
   * Search tokens by name or symbol
   * @param {string} query - Search query
   * @returns {Array} Array of matching tokens
   */
  async searchTokens(query) {
    try {
      const allTokens = await this.getAllTokens();
      const lowerQuery = query.toLowerCase();

      return allTokens.filter(token => 
        token.name.toLowerCase().includes(lowerQuery) ||
        token.symbol.toLowerCase().includes(lowerQuery) ||
        token.contractAddress.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Validate contract address and check existence
   * @param {string} contractAddress 
   * @returns {boolean} True if valid and exists
   */
  async validateContractAddressAndExistence(contractAddress) {
    try {
      // Format validation
      this.contractAddressGenerator.validateContractAddressStrict(contractAddress);
      
      // Existence check
      const exists = await this.contractAddressGenerator.contractExists(contractAddress);
      if (!exists) {
        throw new TokenError(
          'Token contract not found',
          TOKEN_ERRORS.TOKEN_NOT_FOUND,
          { contractAddress }
        );
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get token balance for specific address and contract
   * @param {string} address - Wallet address
   * @param {string} contractAddress - Token contract address
   * @returns {number} Token balance
   */
  async getTokenBalance(address, contractAddress) {
    try {
      // Validate contract address
      await this.validateContractAddressAndExistence(contractAddress);

      const balanceData = await fs.readFile(this.balanceStorage, 'utf8');
      const parsed = JSON.parse(balanceData);

      if (parsed.balances[address] && parsed.balances[address][contractAddress]) {
        return parsed.balances[address][contractAddress];
      }

      return 0;
    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }
      return 0;
    }
  }

  /**
   * Transfer custom token
   * @param {string} contractAddress - Token contract address
   * @param {string} fromAddress - Sender address
   * @param {string} toAddress - Recipient address
   * @param {number} amount - Amount to transfer
   * @returns {Object} Transfer result
   */
  async transferCustomToken(contractAddress, fromAddress, toAddress, amount) {
    try {
      // Validate parameters
      this.parameterValidator.validateTransferParameters({
        contractAddress, fromAddress, toAddress, amount
      });

      // Validate contract address and existence
      await this.validateContractAddressAndExistence(contractAddress);

      // Check sender balance
      const senderBalance = await this.getTokenBalance(fromAddress, contractAddress);
      if (senderBalance < amount) {
        throw new TokenError(
          `Insufficient token balance. Available: ${senderBalance}, Required: ${amount}`,
          TOKEN_ERRORS.INSUFFICIENT_TOKEN_BALANCE,
          { 
            contractAddress, 
            fromAddress, 
            available: senderBalance, 
            required: amount 
          }
        );
      }

      // Update balances
      await this.updateTokenBalance(fromAddress, contractAddress, -amount);
      await this.updateTokenBalance(toAddress, contractAddress, amount);

      return {
        success: true,
        contractAddress,
        fromAddress,
        toAddress,
        amount,
        message: 'Token transfer completed successfully'
      };

    } catch (error) {
      if (error instanceof TokenError) {
        throw error;
      }

      throw new TokenError(
        `Token transfer failed: ${error.message}`,
        TOKEN_ERRORS.TOKEN_TRANSFER_FAILED,
        { contractAddress, fromAddress, toAddress, amount, error: error.message }
      );
    }
  }

  /**
   * Save token to storage
   * @param {string} contractAddress 
   * @param {Object} tokenMetadata 
   */
  async saveTokenToStorage(contractAddress, tokenMetadata) {
    try {
      let tokenData;
      try {
        const fileData = await fs.readFile(this.tokenStorage, 'utf8');
        tokenData = JSON.parse(fileData);
      } catch (error) {
        tokenData = { tokens: {}, contractAddresses: [] };
      }

      // Add token metadata
      tokenData.tokens[contractAddress] = tokenMetadata;

      // Add to contract addresses array if not present
      if (!tokenData.contractAddresses.includes(contractAddress)) {
        tokenData.contractAddresses.push(contractAddress);
      }

      await fs.writeFile(this.tokenStorage, JSON.stringify(tokenData, null, 2));
    } catch (error) {
      throw new TokenError(
        'Failed to save token to storage',
        TOKEN_ERRORS.TOKEN_CREATION_FAILED,
        { contractAddress, error: error.message }
      );
    }
  }

  /**
   * Allocate initial supply to creator
   * @param {string} creatorAddress 
   * @param {string} contractAddress 
   * @param {number} totalSupply 
   */
  async allocateInitialSupply(creatorAddress, contractAddress, totalSupply) {
    try {
      await this.updateTokenBalance(creatorAddress, contractAddress, totalSupply);
    } catch (error) {
      throw new TokenError(
        'Failed to allocate initial supply',
        TOKEN_ERRORS.TOKEN_CREATION_FAILED,
        { creatorAddress, contractAddress, totalSupply, error: error.message }
      );
    }
  }

  /**
   * Update token balance
   * @param {string} address 
   * @param {string} contractAddress 
   * @param {number} amount - Can be positive or negative
   */
  async updateTokenBalance(address, contractAddress, amount) {
    try {
      let balanceData;
      try {
        const fileData = await fs.readFile(this.balanceStorage, 'utf8');
        balanceData = JSON.parse(fileData);
      } catch (error) {
        balanceData = { balances: {} };
      }

      // Initialize address if not exists
      if (!balanceData.balances[address]) {
        balanceData.balances[address] = {};
      }

      // Initialize token balance if not exists
      if (!balanceData.balances[address][contractAddress]) {
        balanceData.balances[address][contractAddress] = 0;
      }

      // Update balance
      balanceData.balances[address][contractAddress] += amount;

      // Ensure balance doesn't go negative
      if (balanceData.balances[address][contractAddress] < 0) {
        balanceData.balances[address][contractAddress] = 0;
      }

      await fs.writeFile(this.balanceStorage, JSON.stringify(balanceData, null, 2));
    } catch (error) {
      throw new TokenError(
        'Failed to update token balance',
        TOKEN_ERRORS.TOKEN_TRANSFER_FAILED,
        { address, contractAddress, amount, error: error.message }
      );
    }
  }

  /**
   * Get all token balances for an address
   * @param {string} address 
   * @returns {Object} Object with contract addresses as keys and balances as values
   */
  async getAllTokenBalances(address) {
    try {
      const balanceData = await fs.readFile(this.balanceStorage, 'utf8');
      const parsed = JSON.parse(balanceData);

      return parsed.balances[address] || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Export token metadata as JSON
   * @param {string} contractAddress 
   * @returns {Object} Token metadata in JSON format
   */
  async exportTokenMetadata(contractAddress) {
    try {
      const tokenMetadata = await this.getTokenByContract(contractAddress);
      if (!tokenMetadata) {
        throw new TokenError(
          'Token not found for export',
          TOKEN_ERRORS.TOKEN_NOT_FOUND,
          { contractAddress }
        );
      }

      return {
        contractAddress,
        metadata: tokenMetadata,
        exportedAt: Date.now(),
        format: 'PSN Token Metadata v1.0'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get token statistics
   * @returns {Object} Token system statistics
   */
  async getTokenStatistics() {
    try {
      const allTokens = await this.getAllTokens();
      const contractStats = this.contractAddressGenerator.getStatistics();

      return {
        totalTokens: allTokens.length,
        totalSupply: allTokens.reduce((sum, token) => sum + token.totalSupply, 0),
        averageDecimals: allTokens.length > 0 
          ? allTokens.reduce((sum, token) => sum + token.decimals, 0) / allTokens.length 
          : 0,
        contractAddressStats: contractStats,
        oldestToken: allTokens.length > 0 
          ? allTokens.reduce((oldest, token) => 
              token.createdAt < oldest.createdAt ? token : oldest
            )
          : null,
        newestToken: allTokens.length > 0 
          ? allTokens.reduce((newest, token) => 
              token.createdAt > newest.createdAt ? token : newest
            )
          : null
      };
    } catch (error) {
      return {
        totalTokens: 0,
        totalSupply: 0,
        averageDecimals: 0,
        contractAddressStats: this.contractAddressGenerator.getStatistics(),
        oldestToken: null,
        newestToken: null,
        error: error.message
      };
    }
  }
}

module.exports = { TokenManager };