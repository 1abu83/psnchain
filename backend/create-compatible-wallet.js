const { createWallet } = require('./src/utils/wallet.js');

console.log('🔧 Creating Backend-Compatible Wallet\n');

// Create wallet using backend algorithm
const wallet = createWallet();

console.log('📋 Backend-Compatible Wallet Created:');
console.log('=====================================');
console.log(`Private Key: ${wallet.privateKey}`);
console.log(`Public Key: ${wallet.publicKey}`);
console.log(`Address: ${wallet.address}`);
console.log(`Frontend Address: psn${wallet.address}`);
console.log('');

console.log('💡 Instructions:');
console.log('1. Copy the private key above');
console.log('2. Go to your frontend wallet page');
console.log('3. Click "Import Wallet"');
console.log('4. Paste the private key');
console.log('5. This wallet will be compatible with the backend blockchain');
console.log('');

console.log('⚠️  Note: This wallet will start with 0 PSN balance');
console.log('   To get the 1B PSN, you need to use the developer wallet');
console.log('   or transfer funds from the developer wallet to this one.');

// Also show the developer wallet info for comparison
console.log('\n🔍 Developer Wallet (for comparison):');
console.log('=====================================');
console.log('Private Key: 63c4c418f196d6b537435397b0698bf333bfa849c0e51907a5188a1aa18ce091');
console.log('Address: fd242e4b83661362f1ff1b764d99355773f2f41f');
console.log('Frontend Address: psnfd242e4b83661362f1ff1b764d99355773f2f41f');
console.log('Balance: 1,000,000,000 PSN (1 Billion PSN)');
