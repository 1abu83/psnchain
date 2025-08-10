const { createWallet } = require('./src/utils/wallet');
const { Blockchain, Transaction, Block } = require('./src/blockchain/blockchain');
const fs = require('fs').promises;
const path = require('path');

// Custom balance calculation that handles genesis transactions properly
function calculateGenesisBalance(blockchain, address) {
  let balance = 0;
  
  for (const block of blockchain.chain) {
    for (const trans of block.transactions) {
      // Genesis transaction: sender is null (minting from genesis)
      if (trans.sender === null && trans.recipient === address) {
        balance += trans.amount;
        console.log(`   Genesis credit: +${trans.amount.toLocaleString()} PSN (sender: null)`);
      }
      // Regular transaction: sender spends
      else if (trans.sender === address) {
        balance -= trans.amount;
        console.log(`   Debit: -${trans.amount.toLocaleString()} PSN (sent to: ${trans.recipient})`);
      }
      // Regular transaction: recipient receives
      else if (trans.recipient === address) {
        balance += trans.amount;
        console.log(`   Credit: +${trans.amount.toLocaleString()} PSN (from: ${trans.sender})`);
      }
    }
  }
  
  return balance;
}

async function setupDeveloperWallet() {
  console.log('🚀 Setting up Developer Wallet with 1B PSN...\n');

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
        balance: 1000000000,
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

    // Create new basic blockchain (not enhanced to avoid TokenTransaction issues)
    console.log('   Creating basic Blockchain instance...');
    let blockchain;
    try {
      // Create blockchain manually without constructor to avoid auto-loading
      blockchain = {
        chain: [],
        difficulty: 2,
        pendingTransactions: [],
        miningReward: 100,
        storageFile: path.join(__dirname, 'src/storage/blockchain.json'),
        walletsFile: path.join(__dirname, 'src/storage/wallets.json'),
        
        // Manual save method
        async saveToStorage() {
          const data = {
            chain: this.chain,
            pendingTransactions: this.pendingTransactions,
            difficulty: this.difficulty,
            miningReward: this.miningReward
          };
          await fs.writeFile(this.storageFile, JSON.stringify(data, null, 2));
        }
      };
      
      console.log('   ✅ Basic Blockchain created successfully');
      
    } catch (error) {
      console.error('   ❌ Error creating Blockchain:', error);
      throw error;
    }
    
    // Create genesis block with developer funds using regular Transaction
    console.log('   Creating genesis block...');
    try {
      // Create a simple genesis block
      const genesis = new Block(Date.now(), [], '0');
      genesis.index = 0;
      
      // Developer allocation transaction (1B PSN) using regular Transaction
      const developerAllocation = new Transaction(
        null, // sender = null (minting from genesis)
        developerWallet.address,
        1000000000, // 1B PSN
        Date.now()
      );
      
      genesis.transactions = [developerAllocation];
      genesis.hash = genesis.calculateHash();
      
      console.log(`🎉 Genesis block created with ${developerAllocation.amount.toLocaleString()} PSN for developer: ${developerWallet.address}`);
      console.log('   Genesis block created successfully');
      console.log('   Genesis block transactions count:', genesis.transactions.length);
      
      // Replace the first block with our genesis
      blockchain.chain = [genesis];
      console.log('   Blockchain chain updated, length:', blockchain.chain.length);
      
    } catch (error) {
      console.error('   ❌ Error creating genesis block:', error);
      throw error;
    }
    
    // Save to storage
    console.log('   Saving blockchain to storage...');
    try {
      console.log('   Chain before save:', blockchain.chain.length, 'blocks');
      console.log('   Transactions before save:', blockchain.chain[0]?.transactions?.length || 0);
      
      await blockchain.saveToStorage();
      console.log('   ✅ Blockchain saved to storage successfully');
      
      console.log('   Chain after save:', blockchain.chain.length, 'blocks');
      console.log('   Transactions after save:', blockchain.chain[0]?.transactions?.length || 0);
      
    } catch (error) {
      console.error('   ❌ Error saving blockchain:', error);
      throw error;
    }
    console.log('✅ Blockchain created with genesis allocation\n');

    // 4. Verify setup with detailed debugging
    console.log('🔍 Step 4: Verifying setup...');
    console.log('   Genesis block transactions:');
    
    // Show genesis block details
    const genesis = blockchain.chain[0];
    console.log(`   Block #${genesis.index}: ${genesis.hash.substring(0, 16)}...`);
    console.log(`   Transactions in genesis: ${genesis.transactions.length}`);
    
    // Debug: Show transaction details
    for (let i = 0; i < genesis.transactions.length; i++) {
      const tx = genesis.transactions[i];
      console.log(`   TX ${i + 1}: ${tx.sender === null ? 'GENESIS' : tx.sender} → ${tx.recipient} = ${tx.amount.toLocaleString()} PSN`);
      console.log(`      Transaction type: ${tx.constructor.name}`);
      console.log(`      Raw transaction:`, JSON.stringify(tx, null, 2));
    }
    
    // Use custom balance calculation
    const balance = calculateGenesisBalance(blockchain, developerWallet.address);
    console.log(`\n   Developer balance: ${balance.toLocaleString()} PSN`);
    
    if (balance === 1000000000) {
      console.log('✅ Setup successful! Developer wallet has 1B PSN\n');
    } else {
      console.log('❌ Setup failed! Balance mismatch\n');
      console.log('   Expected: 1,000,000,000 PSN');
      console.log('   Actual:   ' + balance.toLocaleString() + ' PSN');
      return;
    }

    // 5. Display final info
    console.log('🎯 Developer Wallet Setup Complete!');
    console.log('=====================================');
    console.log(`Address: ${developerWallet.address}`);
    console.log(`Balance: ${balance.toLocaleString()} PSN`);
    console.log(`Private Key: ${developerWallet.privateKey}`);
    console.log(`Public Key: ${developerWallet.publicKey}`);
    console.log('\n⚠️  IMPORTANT: Save your private key securely!');
    console.log('   This is your access to 1B PSN coins.\n');

    // 6. Create detailed wallet info file for easy reading
    console.log('📋 Step 5: Creating detailed wallet info...');
    const walletDetailsContent = `# Developer Wallet Details
=====================================

## Wallet Information
Address: ${developerWallet.address}
Balance: ${balance.toLocaleString()} PSN (1,000,000,000 PSN)
Created: ${new Date().toISOString()}

## Private Key (KEEP SECRET!)
${developerWallet.privateKey}

## Public Key
${developerWallet.publicKey}

## Important Notes
- This wallet contains 1,000,000,000 PSN coins
- Keep your private key secure and never share it
- You can import this wallet using the private key
- This is your developer wallet with initial coin supply

## How to Use
1. Copy the private key above
2. Go to your frontend wallet page
3. Click "Import Wallet"
4. Paste the private key
5. Your wallet will be loaded with 1B PSN

## Security Warning
⚠️  NEVER share your private key with anyone!
⚠️  Store it securely offline
⚠️  This gives full access to your 1B PSN coins
`;

    const walletDetailsFile = path.join(__dirname, 'DEVELOPER_WALLET_INFO.txt');
    await fs.writeFile(walletDetailsFile, walletDetailsContent);
    console.log('✅ Detailed wallet info created:', walletDetailsFile, '\n');

    // 7. Create environment file
    console.log('📋 Step 6: Creating environment configuration...');
    const envContent = `# Developer Wallet Configuration
DEVELOPER_ADDRESS=${developerWallet.address}
DEVELOPER_PRIVATE_KEY=${developerWallet.privateKey}
DEVELOPER_BALANCE=1000000000

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
