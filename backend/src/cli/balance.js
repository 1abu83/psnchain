const { blockchain, tokenManager } = require('../index');

const getBalanceCommand = (address) => {
  try {
    // Validate address format
    if (!address || address.length !== 40) {
      console.error('Invalid address format. Address must be 40 characters long.');
      return;
    }
    
    // Get PSN balance
    const psnBalance = blockchain.getBalanceOfAddress(address);
    console.log(`PSN Balance: ${psnBalance}`);
    
    // Get token balances
    console.log('\nToken Balances:');
    const tokens = tokenManager.getAllTokens();
    
    if (tokens.length === 0) {
      console.log('No tokens found.');
      return;
    }
    
    let hasTokenBalance = false;
    for (const token of tokens) {
      const balance = tokenManager.getBalance(address, token.id);
      if (balance > 0) {
        console.log(`${token.symbol}: ${balance}`);
        hasTokenBalance = true;
      }
    }
    
    if (!hasTokenBalance) {
      console.log('No token balances found.');
    }
  } catch (error) {
    console.error('Failed to get balance:', error);
  }
};

module.exports = {
  getBalanceCommand
};