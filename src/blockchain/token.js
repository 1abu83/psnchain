class TokenManager {
  constructor() {
    this.tokens = new Map();
    this.balances = new Map(); // address_tokenId -> balance
  }

  createToken(name, symbol, totalSupply, decimals, creator) {
    // Generate unique token ID
    const tokenId = `${name}_${symbol}_${Date.now()}`;
    
    // Create token info
    const tokenInfo = {
      id: tokenId,
      name,
      symbol,
      totalSupply,
      decimals,
      creator
    };
    
    // Add token to registry
    this.tokens.set(tokenId, tokenInfo);
    
    // Assign total supply to creator
    const balanceKey = `${creator}_${tokenId}`;
    this.balances.set(balanceKey, totalSupply);
    
    return tokenId;
  }

  transferToken(tokenId, fromAddress, toAddress, amount) {
    // Check if token exists
    if (!this.tokens.has(tokenId)) {
      throw new Error('Token does not exist');
    }
    
    // Check if fromAddress has enough balance
    const fromBalanceKey = `${fromAddress}_${tokenId}`;
    const fromBalance = this.balances.get(fromBalanceKey) || 0;
    
    if (fromBalance < amount) {
      throw new Error('Insufficient token balance');
    }
    
    // Update balances
    this.balances.set(fromBalanceKey, fromBalance - amount);
    
    const toBalanceKey = `${toAddress}_${tokenId}`;
    const toBalance = this.balances.get(toBalanceKey) || 0;
    this.balances.set(toBalanceKey, toBalance + amount);
  }

  getBalance(address, tokenId) {
    const balanceKey = `${address}_${tokenId}`;
    return this.balances.get(balanceKey) || 0;
  }

  getAllTokens() {
    return Array.from(this.tokens.values());
  }

  getTokenInfo(tokenId) {
    return this.tokens.get(tokenId);
  }
}

module.exports = {
  TokenManager
};