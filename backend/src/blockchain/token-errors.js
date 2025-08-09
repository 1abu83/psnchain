// Token-specific error handling system

class TokenError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'TokenError';
    this.code = code;
    this.details = details;
  }
}

// Error codes for token operations
const TOKEN_ERRORS = {
  INVALID_CONTRACT_ADDRESS: 'INVALID_CONTRACT_ADDRESS',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  INSUFFICIENT_TOKEN_BALANCE: 'INSUFFICIENT_TOKEN_BALANCE',
  INSUFFICIENT_GAS_BALANCE: 'INSUFFICIENT_GAS_BALANCE',
  DUPLICATE_CONTRACT_ADDRESS: 'DUPLICATE_CONTRACT_ADDRESS',
  INVALID_TOKEN_PARAMETERS: 'INVALID_TOKEN_PARAMETERS',
  INVALID_TRANSACTION_TYPE: 'INVALID_TRANSACTION_TYPE',
  INVALID_GAS_PRICE: 'INVALID_GAS_PRICE',
  TOKEN_CREATION_FAILED: 'TOKEN_CREATION_FAILED',
  TOKEN_TRANSFER_FAILED: 'TOKEN_TRANSFER_FAILED'
};

// Gas fee validation class
class GasValidator {
  constructor(blockchain) {
    this.blockchain = blockchain;
  }

  validateGasPayment(senderAddress, requiredGas) {
    const psnBalance = this.blockchain.getBalanceOfAddress(senderAddress);
    if (psnBalance < requiredGas) {
      throw new TokenError(
        `Insufficient PSN for gas fee. Required: ${requiredGas}, Available: ${psnBalance}`,
        TOKEN_ERRORS.INSUFFICIENT_GAS_BALANCE,
        { required: requiredGas, available: psnBalance, address: senderAddress }
      );
    }
    return true;
  }

  calculateGasFee(transactionType, dataSize = 0) {
    const baseFee = 0.001; // PSN
    
    let typeFee = 0;
    switch (transactionType) {
      case 'PSN_TRANSFER':
        typeFee = 0;
        break;
      case 'TOKEN_TRANSFER':
        typeFee = 0.0005;
        break;
      case 'TOKEN_CREATION':
        typeFee = 0.01;
        break;
      default:
        typeFee = 0.001;
    }
    
    const dataFee = dataSize * 0.0001; // PSN per byte
    return baseFee + typeFee + dataFee;
  }
}

// Contract address validation class
class ContractValidator {
  constructor(blockchain) {
    this.blockchain = blockchain;
  }

  validateContractAddress(address) {
    if (!this.isValidFormat(address)) {
      throw new TokenError(
        'Invalid contract address format. Must be PSN followed by 40 hex characters',
        TOKEN_ERRORS.INVALID_CONTRACT_ADDRESS,
        { providedAddress: address, expectedFormat: 'PSN + 40 hex characters' }
      );
    }
    return true;
  }

  async validateContractExists(address) {
    const exists = await this.blockchain.validateTokenContract(address);
    if (!exists) {
      throw new TokenError(
        'Token contract not found',
        TOKEN_ERRORS.TOKEN_NOT_FOUND,
        { contractAddress: address }
      );
    }
    return true;
  }

  isValidFormat(address) {
    // Contract address format: PSN + 40 hex characters
    return /^PSN[a-fA-F0-9]{40}$/.test(address);
  }

  isValidTokenSymbol(symbol) {
    // Token symbol: 2-10 uppercase letters
    return /^[A-Z]{2,10}$/.test(symbol);
  }

  isValidTokenName(name) {
    // Token name: 1-50 characters, letters, numbers, spaces
    return /^[a-zA-Z0-9\s]{1,50}$/.test(name);
  }
}

// Token parameter validation class
class TokenParameterValidator {
  validateTokenCreationParameters(params) {
    const { name, symbol, totalSupply, decimals, creator } = params;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new TokenError(
        'Token name is required and must be a non-empty string',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'name', value: name }
      );
    }

    if (name.length > 50) {
      throw new TokenError(
        'Token name must be 50 characters or less',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'name', value: name, maxLength: 50 }
      );
    }

    // Validate symbol
    if (!symbol || typeof symbol !== 'string') {
      throw new TokenError(
        'Token symbol is required and must be a string',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'symbol', value: symbol }
      );
    }

    if (!/^[A-Z]{2,10}$/.test(symbol)) {
      throw new TokenError(
        'Token symbol must be 2-10 uppercase letters',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'symbol', value: symbol, expectedFormat: '2-10 uppercase letters' }
      );
    }

    // Validate total supply
    if (!totalSupply || typeof totalSupply !== 'number' || totalSupply <= 0) {
      throw new TokenError(
        'Total supply must be a positive number',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'totalSupply', value: totalSupply }
      );
    }

    if (totalSupply > 1e18) {
      throw new TokenError(
        'Total supply cannot exceed 1,000,000,000,000,000,000',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'totalSupply', value: totalSupply, maxValue: 1e18 }
      );
    }

    // Validate decimals
    if (decimals === undefined || typeof decimals !== 'number' || decimals < 0 || decimals > 18) {
      throw new TokenError(
        'Decimals must be a number between 0 and 18',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'decimals', value: decimals, range: '0-18' }
      );
    }

    // Validate creator address
    if (!creator || typeof creator !== 'string') {
      throw new TokenError(
        'Creator address is required',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'creator', value: creator }
      );
    }

    if (!creator.startsWith('psn') || creator.length !== 43) {
      throw new TokenError(
        'Invalid creator address format',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'creator', value: creator, expectedFormat: 'psn + 40 characters' }
      );
    }

    return true;
  }

  validateTransferParameters(params) {
    const { contractAddress, fromAddress, toAddress, amount } = params;

    // Validate contract address (if provided)
    if (contractAddress && !/^PSN[a-fA-F0-9]{40}$/.test(contractAddress)) {
      throw new TokenError(
        'Invalid contract address format',
        TOKEN_ERRORS.INVALID_CONTRACT_ADDRESS,
        { contractAddress, expectedFormat: 'PSN + 40 hex characters' }
      );
    }

    // Validate addresses
    if (!fromAddress || !fromAddress.startsWith('psn') || fromAddress.length !== 43) {
      throw new TokenError(
        'Invalid sender address format',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'fromAddress', value: fromAddress }
      );
    }

    if (!toAddress || !toAddress.startsWith('psn') || toAddress.length !== 43) {
      throw new TokenError(
        'Invalid recipient address format',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'toAddress', value: toAddress }
      );
    }

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new TokenError(
        'Transfer amount must be a positive number',
        TOKEN_ERRORS.INVALID_TOKEN_PARAMETERS,
        { field: 'amount', value: amount }
      );
    }

    return true;
  }
}

module.exports = {
  TokenError,
  TOKEN_ERRORS,
  GasValidator,
  ContractValidator,
  TokenParameterValidator
};