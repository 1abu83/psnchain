const fs = require('fs');
const path = require('path');

console.log('🔍 Developer Wallet Information\n');

try {
    // Read the wallet info file
    const walletInfoFile = path.join(__dirname, 'DEVELOPER_WALLET_INFO.txt');
    
    if (fs.existsSync(walletInfoFile)) {
        const walletInfo = fs.readFileSync(walletInfoFile, 'utf8');
        console.log('📋 Developer Wallet Details:');
        console.log('=====================================');
        console.log(walletInfo);
        
        // Extract address and show frontend format
        const addressMatch = walletInfo.match(/Address: ([a-f0-9]+)/);
        if (addressMatch) {
            const backendAddress = addressMatch[1];
            const frontendAddress = `psn${backendAddress}`;
            
            console.log('\n🌐 Frontend Address Format:');
            console.log('=====================================');
            console.log(`Backend Address: ${backendAddress}`);
            console.log(`Frontend Address: ${frontendAddress}`);
            console.log('\n💡 Copy this address for your frontend!');
        }
        
        // Check blockchain status
        console.log('\n🔍 Checking blockchain status...');
        const blockchainFile = path.join(__dirname, 'src/storage/blockchain.json');
        
        if (fs.existsSync(blockchainFile)) {
            const blockchainData = fs.readFileSync(blockchainFile, 'utf8');
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
        } else {
            console.log('⚠️  Blockchain file not found');
        }
        
    } else {
        console.log('❌ Developer wallet info file not found!');
        console.log('💡 Run setup-developer-wallet.js first');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
