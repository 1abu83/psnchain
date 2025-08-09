const { createWallet } = require('./src/utils/wallet');
const { EnhancedBlockchain } = require('./src/blockchain/enhanced-blockchain');
const fs = require('fs').promises;
const path = require('path');

async function setupDeveloperWallet() {
  console.log('🚀 Setting up Developer Wallet with 100M PSN...\n');

  try {
    // 1. Create developer wallet
    console.log('📝 Step 1: Creating developer wallet...');
    const developerWallet = createWallet();
    
    console.log('✅ Developer Wallet Created:');
    console.log(`   Address: ${developerWallet.address}`);
    console.log(`   Private Key: ${developerWallet.privateKey}`);
    console.log(`   Public Key: ${developerWallet.publicKey}\n`);

    // 2. Save developer wallet info
    console.log('💾 Step 2: Saving developer wallet info...');
    const walletInfo = {
      developer: {
        address: developerWallet.address,
        privateKey: developerWallet.privateKey,
        publicKey: developerWallet.publicKey,
        balance: 100000000,
        createdAt: new Date().toISOString()
      }
    };

    const walletFile = path.join(__dirname, 'src/storage/developer-wallet.json');
    await fs.writeFile(walletFile, JSON.stringify(walletInfo, null, 2));
    console.log('✅ Developer wallet info saved to:', walletFile, '\n');

    // 3. Create new blockchain with genesis allocation
    console.log('⛓️ Step 3: Creating blockchain with genesis allocation...');
    
    // Clear existing blockchain storage
    const blockchainFile = path.join(__dirname, 'src/storage/blockchain.json');
    try {
      await fs.unlink(blockchainFile);
      console.log('🗑️ Cleared existing blockchain storage');
    } catch (error) {
      console.log('ℹ️ No existing blockchain to clear');
    }

    // Create new enhanced blockchain
    const blockchain = new EnhancedBlockchain();
    
    // Create genesis block with developer funds
    const genesisBlock = blockchain.createGenesisBlockWithDeveloperFunds(developerWallet.address);
    
    // Replace the first block with our genesis
    blockchain.chain = [genesisBlock];
    
    // Save to storage
    await blockchain.saveToStorage();
    console.log('✅ Blockchain created with genesis allocation\n');

    // 4. Verify setup
    console.log('🔍 Step 4: Verifying setup...');
    const balance = blockchain.getBalanceOfAddress(developerWallet.address);
    console.log(`   Developer balance: ${balance.toLocaleString()} PSN`);
    
    if (balance === 100000000) {
      console.log('✅ Setup successful! Developer wallet has 100M PSN\n');
    } else {
      console.log('❌ Setup failed! Balance mismatch\n');
      return;
    }

    // 5. Display final info
    console.log('🎯 Developer Wallet Setup Complete!');
    console.log('=====================================');
    console.log(`Address: ${developerWallet.address}`);
    console.log(`Balance: ${balance.toLocaleString()} PSN`);
    console.log(`Private Key: ${developerWallet.privateKey}`);
    console.log('\n⚠️  IMPORTANT: Save your private key securely!');
    console.log('   This is your access to 100M PSN coins.\n');

    // 6. Create environment file
    console.log('📋 Step 5: Creating environment configuration...');
    const envContent = `# Developer Wallet Configuration
DEVELOPER_ADDRESS=${developerWallet.address}
DEVELOPER_PRIVATE_KEY=${developerWallet.privateKey}
DEVELOPER_BALANCE=100000000

# Blockchain Configuration
BLOCKCHAIN_DIFFICULTY=2
MINING_REWARD=100
NATIVE_TOKEN_SYMBOL=PSN

# API Configuration
API_PORT=3001
FRONTEND_URL=http://localhost:3000
`;

    const envFile = path.join(__dirname, '.env.developer');
    await fs.writeFile(envFile, envContent);
    console.log('✅ Environment file created:', envFile, '\n');

    console.log('🚀 Ready to start blockchain with developer funds!');
    console.log('   Run: pm2 start ecosystem.config.js');

  } catch (error) {
    console.error('❌ Error setting up developer wallet:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDeveloperWallet();
}

module.exports = { setupDeveloperWallet };
