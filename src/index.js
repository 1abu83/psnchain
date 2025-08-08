const { Blockchain } = require('./blockchain/blockchain');
const { TokenManager } = require('./blockchain/token');
const { AMM } = require('./blockchain/amm');
const { createWallet, signTransaction } = require('./utils/wallet');

// Create instances
const blockchain = new Blockchain();
const tokenManager = new TokenManager();
const amm = new AMM();

// Export for use in other modules
module.exports = { blockchain, tokenManager, amm, createWallet, signTransaction };

// Example usage
console.log('PSNChain initialized successfully!');

// Create a test wallet
const wallet = createWallet();
console.log('Test wallet created:');
console.log(`Address: ${wallet.address}`);
console.log(`Public Key: ${wallet.publicKey}`);
console.log(`Private Key: ${wallet.privateKey}`);

// Mine a block to get some rewards
blockchain.minePendingTransactions(wallet.address);
console.log(`Wallet balance: ${blockchain.getBalanceOfAddress(wallet.address)} PSN`);

// Example token creation
const tokenId = tokenManager.createToken(
  'Test Token',
  'TST',
  1000000,
  18,
  wallet.address
);
console.log(`Created token with ID: ${tokenId}`);

// Example AMM pool creation
const poolId = amm.createPool('PSN', tokenId, 1000, 2000);
console.log(`Created liquidity pool with ID: ${poolId}`);