const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { blockchain, tokenManager, amm, createWallet, signTransaction } = require('../index');

class PSNChainAPIServer {
  constructor(port = 3001) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.port = port;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));
    
    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        blockchain: {
          blocks: blockchain.chain.length,
          pendingTransactions: blockchain.pendingTransactions.length
        }
      });
    });

    // Wallet routes
    this.app.post('/api/wallet/create', (req, res) => {
      try {
        const wallet = createWallet();
        res.json({
          success: true,
          data: {
            address: wallet.address,
            publicKey: wallet.publicKey
            // Note: Never send private key in API response
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Balance routes
    this.app.get('/api/balance/:address', (req, res) => {
      try {
        const { address } = req.params;
        const psnBalance = blockchain.getBalanceOfAddress(address);
        
        // Get token balances
        const tokens = tokenManager.getAllTokens();
        const tokenBalances = tokens.map(token => ({
          denom: token.symbol.toLowerCase(),
          amount: (tokenManager.getBalance(address, token.id) * 1000000).toString(), // Convert to base units
          tokenInfo: token
        }));

        // Add PSN balance
        const balances = [
          {
            denom: 'psn',
            amount: (psnBalance * 1000000).toString() // Convert to base units
          },
          ...tokenBalances
        ];

        res.json({
          success: true,
          data: {
            address,
            balances
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Transaction routes
    this.app.post('/api/transaction/send', (req, res) => {
      try {
        const { sender, recipient, amount, privateKey } = req.body;
        
        // Validate inputs
        if (!sender || !recipient || !amount || !privateKey) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: sender, recipient, amount, privateKey' 
          });
        }

        // Create transaction
        const transaction = {
          sender,
          recipient,
          amount: parseFloat(amount),
          timestamp: Date.now()
        };

        // Sign transaction
        const signature = signTransaction(transaction, privateKey);
        transaction.signature = signature;

        // Add to blockchain
        blockchain.createTransaction(transaction);

        // Emit to WebSocket clients
        this.io.emit('new_transaction', transaction);

        res.json({
          success: true,
          data: {
            transaction,
            message: 'Transaction added to pending pool'
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Mining routes
    this.app.post('/api/mine', (req, res) => {
      try {
        const { minerAddress } = req.body;
        
        if (!minerAddress) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing minerAddress' 
          });
        }

        // Mine pending transactions
        blockchain.minePendingTransactions(minerAddress);
        
        const latestBlock = blockchain.getLatestBlock();
        
        // Emit to WebSocket clients
        this.io.emit('new_block', latestBlock);

        res.json({
          success: true,
          data: {
            block: latestBlock,
            message: 'Block mined successfully'
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Token routes
    this.app.post('/api/token/create', (req, res) => {
      try {
        const { name, symbol, totalSupply, decimals, creator } = req.body;
        
        if (!name || !symbol || !totalSupply || !creator) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: name, symbol, totalSupply, creator' 
          });
        }

        const tokenId = tokenManager.createToken(
          name,
          symbol,
          parseFloat(totalSupply),
          parseInt(decimals) || 18,
          creator
        );

        res.json({
          success: true,
          data: {
            tokenId,
            message: 'Token created successfully'
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/tokens', (req, res) => {
      try {
        const tokens = tokenManager.getAllTokens();
        res.json({
          success: true,
          data: tokens
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // AMM/Swap routes
    this.app.post('/api/swap', (req, res) => {
      try {
        const { poolId, tokenIn, amountIn, minAmountOut } = req.body;
        
        if (!poolId || !tokenIn || !amountIn) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: poolId, tokenIn, amountIn' 
          });
        }

        const result = amm.swap(poolId, tokenIn, parseFloat(amountIn));
        
        if (minAmountOut && result.amountOut < parseFloat(minAmountOut)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Slippage tolerance exceeded' 
          });
        }

        res.json({
          success: true,
          data: result
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/pools', (req, res) => {
      try {
        const pools = amm.getAllPools();
        res.json({
          success: true,
          data: pools
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Blockchain info routes
    this.app.get('/api/blockchain/info', (req, res) => {
      try {
        res.json({
          success: true,
          data: {
            chainLength: blockchain.chain.length,
            difficulty: blockchain.difficulty,
            pendingTransactions: blockchain.pendingTransactions.length,
            miningReward: blockchain.miningReward,
            isValid: blockchain.isChainValid()
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/blockchain/blocks', (req, res) => {
      try {
        const { limit = 10, offset = 0 } = req.query;
        const blocks = blockchain.chain
          .slice(-parseInt(limit) - parseInt(offset), -parseInt(offset) || undefined)
          .reverse();
        
        res.json({
          success: true,
          data: {
            blocks,
            total: blockchain.chain.length
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Transaction history
    this.app.get('/api/transactions/:address', (req, res) => {
      try {
        const { address } = req.params;
        const { limit = 50 } = req.query;
        
        const transactions = [];
        
        // Get transactions from all blocks
        for (const block of blockchain.chain) {
          for (const tx of block.transactions) {
            if (tx.sender === address || tx.recipient === address) {
              transactions.push({
                ...tx,
                blockIndex: block.index,
                blockTimestamp: block.timestamp,
                blockHash: block.hash
              });
            }
          }
        }
        
        // Sort by timestamp (newest first) and limit
        const sortedTransactions = transactions
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, parseInt(limit));

        res.json({
          success: true,
          data: sortedTransactions
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      console.error('API Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
      });
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`WebSocket client connected: ${socket.id}`);
      
      // Send current blockchain status
      socket.emit('blockchain_status', {
        blocks: blockchain.chain.length,
        pendingTransactions: blockchain.pendingTransactions.length,
        difficulty: blockchain.difficulty
      });

      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`🚀 PSNChain API Server running on port ${this.port}`);
      console.log(`📡 WebSocket server ready for real-time updates`);
      console.log(`🔗 API endpoints available at http://localhost:${this.port}/api`);
    });
  }
}

module.exports = PSNChainAPIServer;