const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Blockchain, Transaction } = require('../blockchain/blockchain');
const { WalletManager } = require('../blockchain/wallet');

const app = express();
const PORT = process.env.API_PORT || 3001;

console.log('Starting PSNChain Real API Server...');

// Initialize blockchain and wallet manager
const blockchain = new Blockchain();
const walletManager = new WalletManager();

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: false
}));

app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({
        status: 'OK',
        message: 'PSNChain Real API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        blockchain: {
            blocks: blockchain.chain.length,
            pendingTransactions: blockchain.pendingTransactions.length,
            difficulty: blockchain.difficulty,
            isValid: blockchain.isChainValid()
        }
    });
});

// API info endpoint
app.get('/api/info', (req, res) => {
    res.json({
        name: 'PSNChain Real API',
        version: '1.0.0',
        description: 'PSNChain Real Blockchain API Server',
        explorer: 'PSNScan Explorer',
        endpoints: [
            'GET /api/health - Health check',
            'GET /api/info - API information',
            'POST /api/wallet/create - Create new wallet',
            'GET /api/balance/:address - Get wallet balance',
            'POST /api/transaction/send - Send transaction',
            'POST /api/mine - Mine pending transactions',
            'GET /api/transactions/:address - Get transaction history',
            'GET /api/blockchain/info - Get blockchain info',
            'GET /api/blockchain/blocks - Get blocks',
            'GET /api/transaction/:hash - Get transaction by hash',
            'GET /api/block/:hash - Get block by hash'
        ]
    });
});

// Wallet creation endpoint
app.post('/api/wallet/create', async (req, res) => {
    try {
        const wallet = await walletManager.createWallet();
        
        console.log('Created wallet:');
        console.log('- Address:', wallet.address);
        console.log('- Private Key Length:', wallet.privateKey.length);
        console.log('- Private Key Format:', /^[0-9a-fA-F]+$/.test(wallet.privateKey) ? 'Valid Hex' : 'Not Hex');
        
        res.json({
            success: true,
            data: {
                address: wallet.address,
                publicKey: wallet.publicKey,
                privateKey: wallet.privateKey
            }
        });
    } catch (error) {
        console.error('Wallet creation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Balance endpoint
app.get('/api/balance/:address', (req, res) => {
    try {
        const { address } = req.params;
        
        if (!walletManager.validateAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid address format'
            });
        }
        
        const balance = blockchain.getBalanceOfAddress(address);
        
        res.json({
            success: true,
            data: {
                address: address,
                balances: [
                    {
                        denom: 'psn',
                        amount: (balance * 1000000).toString() // Convert to base units
                    }
                ]
            }
        });
    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Transaction endpoint
app.post('/api/transaction/send', async (req, res) => {
    try {
        const { sender, recipient, amount, privateKey } = req.body;
        
        if (!sender || !recipient || !amount || !privateKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: sender, recipient, amount, privateKey'
            });
        }

        if (!walletManager.validateAddress(sender) || !walletManager.validateAddress(recipient)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid address format'
            });
        }

        const transaction = new Transaction(sender, recipient, parseFloat(amount));
        transaction.signTransaction(privateKey);
        
        const txHash = await blockchain.createTransaction(transaction);
        
        res.json({
            success: true,
            data: {
                transaction: {
                    txHash: transaction.txHash,
                    sender,
                    recipient,
                    amount: parseFloat(amount),
                    timestamp: transaction.timestamp,
                    signature: transaction.signature
                },
                message: 'Transaction added to pending pool'
            }
        });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mining endpoint
app.post('/api/mine', async (req, res) => {
    try {
        const { minerAddress } = req.body;
        
        if (!minerAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing minerAddress'
            });
        }

        if (!walletManager.validateAddress(minerAddress)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid miner address format'
            });
        }

        if (blockchain.pendingTransactions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No pending transactions to mine'
            });
        }

        const block = await blockchain.minePendingTransactions(minerAddress);
        
        res.json({
            success: true,
            data: {
                block: {
                    index: block.index,
                    hash: block.hash,
                    previousHash: block.previousHash,
                    timestamp: block.timestamp,
                    transactions: block.transactions,
                    nonce: block.nonce
                },
                reward: blockchain.miningReward,
                message: 'Block mined successfully'
            }
        });
    } catch (error) {
        console.error('Mining error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Transaction history endpoint
app.get('/api/transactions/:address', (req, res) => {
    try {
        const { address } = req.params;
        const { limit = 50 } = req.query;
        
        if (!walletManager.validateAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid address format'
            });
        }
        
        const transactions = blockchain.getAllTransactionsForWallet(address);
        const limitedTransactions = transactions.slice(0, parseInt(limit));
        
        res.json({
            success: true,
            data: limitedTransactions
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Blockchain info endpoint
app.get('/api/blockchain/info', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                chainLength: blockchain.chain.length,
                difficulty: blockchain.difficulty,
                pendingTransactions: blockchain.pendingTransactions.length,
                miningReward: blockchain.miningReward,
                isValid: blockchain.isChainValid(),
                latestBlock: {
                    index: blockchain.getLatestBlock().index,
                    hash: blockchain.getLatestBlock().hash,
                    timestamp: blockchain.getLatestBlock().timestamp
                }
            }
        });
    } catch (error) {
        console.error('Blockchain info error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get blocks endpoint
app.get('/api/blockchain/blocks', (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const blocks = blockchain.chain
            .slice(-parseInt(limit) - parseInt(offset), -parseInt(offset) || undefined)
            .reverse();
        
        res.json({
            success: true,
            data: {
                blocks: blocks.map(block => ({
                    index: block.index,
                    hash: block.hash,
                    previousHash: block.previousHash,
                    timestamp: block.timestamp,
                    transactions: block.transactions.length,
                    nonce: block.nonce
                })),
                total: blockchain.chain.length
            }
        });
    } catch (error) {
        console.error('Blocks fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get transaction by hash
app.get('/api/transaction/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        const transaction = blockchain.getTransactionByHash(hash);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Transaction fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get block by hash
app.get('/api/block/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        const block = blockchain.getBlockByHash(hash);
        
        if (!block) {
            return res.status(404).json({
                success: false,
                error: 'Block not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                index: block.index,
                hash: block.hash,
                previousHash: block.previousHash,
                timestamp: block.timestamp,
                transactions: block.transactions,
                nonce: block.nonce
            }
        });
    } catch (error) {
        console.error('Block fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /api/health',
            'GET /api/info',
            'POST /api/wallet/create',
            'GET /api/balance/:address',
            'POST /api/transaction/send',
            'POST /api/mine',
            'GET /api/transactions/:address',
            'GET /api/blockchain/info',
            'GET /api/blockchain/blocks',
            'GET /api/transaction/:hash',
            'GET /api/block/:hash'
        ]
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PSNChain Real API Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 External access: http://147.93.81.226:${PORT}/api/health`);
    console.log(`🔍 PSNScan Explorer: http://147.93.81.226:${PORT}/api/info`);
    console.log(`⛏️  Mining reward: ${blockchain.miningReward} PSN`);
    console.log(`🔗 Blockchain initialized with ${blockchain.chain.length} blocks`);
});