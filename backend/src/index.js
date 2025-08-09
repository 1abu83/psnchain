const { EnhancedBlockchain } = require('./blockchain/enhanced-blockchain');
const { TokenManager } = require('./blockchain/token');
const { AMM } = require('./blockchain/amm');
const { createWallet, signTransaction } = require('./utils/wallet');

// Create instances
const blockchain = new EnhancedBlockchain();
const tokenManager = new TokenManager();
const amm = new AMM();

// Export for use in other modules
module.exports = { blockchain, tokenManager, amm, createWallet, signTransaction };