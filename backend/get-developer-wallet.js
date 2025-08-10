const fs = require('fs').promises;
const path = require('path');

async function getDeveloperWalletInfo() {
    console.log('🔍 Getting Developer Wallet Information...\n');
    
    try {
        // Read the wallet info file
        const walletInfoFile = path.join(__dirname, 'DEVELOPER_WALLET_INFO.txt');
        const walletInfo = await fs.readFile(walletInfoFile, 'utf8');
        
        console.log('📋 Developer Wallet Details:');
        console.log('=====================================');
        console.log(walletInfo);
        
        // Also show the address with psn prefix for frontend
        const addressMatch = walletInfo.match(/Address: ([a-f0-9]+)/);
        if (addressMatch) {
            const backendAddress = addressMatch[1];
            const frontendAddress = `psn${backendAddress}`;
            
            console.log('\n🌐 Frontend Address Format:');
            console.log('=====================================');
            console.log(`Backend Address: ${backendAddress}`);
            console.log(`Frontend Address: ${frontendAddress}`);
            console.log('\n💡 Use this address format in your frontend!');
        }
        
        // Check if blockchain is running and verify balance
        console.log('\n🔍 Checking blockchain status...');
        try {
            const blockchainFile = path.join(__dirname, 'src/storage/blockchain.json');
            const blockchainData = await fs.readFile(blockchainFile, 'utf8');
            const blockchain = JSON.parse(blockchainData);
            
            console.log(`✅ Blockchain found with ${blockchain.chain.length} blocks`);
            
            if (blockchain.chain.length > 0) {
                const genesisBlock = blockchain.chain[0];
                console.log(`📦 Genesis block has ${genesisBlock.transactions.length} transactions`);
                
                if (genesisBlock.transactions.length > 0) {
                    const genesisTx = genesisBlock.transactions[0];
                    console.log(`💰 Genesis transaction: ${genesisTx.amount.toLocaleString()} PSN to ${genesisTx.recipient}`);
                }
            }
        } catch (error) {
            console.log('⚠️  Blockchain file not found or error reading it');
        }
        
    } catch (error) {
        console.error('❌ Error reading wallet info:', error.message);
        console.log('\n💡 Make sure you have run setup-developer-wallet.js first');
    }
}

// Run the function
getDeveloperWalletInfo().catch(console.error);
