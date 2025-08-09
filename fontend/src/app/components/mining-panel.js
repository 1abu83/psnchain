'use client';

import { useState } from 'react';
import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { Pickaxe, Zap, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const MiningPanel = () => {
  const { wallet, mineBlock, blockchainInfo, loading } = useWallet();
  const [isMining, setIsMining] = useState(false);
  const [miningResult, setMiningResult] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleMine = async () => {
    if (!wallet) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }

    setIsMining(true);
    setMessage('');
    setMessageType('');
    setMiningResult(null);

    try {
      const result = await mineBlock();
      setMiningResult(result);
      setMessage(`Successfully mined block #${result.block.index}! Reward: ${result.reward} PSN`);
      setMessageType('success');
    } catch (error) {
      console.error('Mining error:', error);
      setMessage(`Mining failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsMining(false);
    }
  };

  const pendingTxCount = blockchainInfo?.pendingTransactions || 0;
  const canMine = wallet && pendingTxCount > 0 && !isMining;

  return (
    <motion.div 
      className="glass p-6 rounded-2xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
          <Pickaxe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Mining Panel</h2>
          <p className="text-sm text-muted-foreground">Mine blocks and earn PSN rewards</p>
        </div>
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div 
          className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">Pending Transactions</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{pendingTxCount}</div>
        </motion.div>

        <motion.div 
          className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-foreground">Mining Reward</span>
          </div>
          <div className="text-2xl font-bold text-foreground">100 PSN</div>
        </motion.div>
      </div>

      {/* Blockchain Info */}
      {blockchainInfo && (
        <motion.div 
          className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-4 rounded-xl mb-6 border border-blue-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Chain Length:</span>
              <span className="ml-2 font-semibold text-foreground">{blockchainInfo.chainLength}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="ml-2 font-semibold text-foreground">{blockchainInfo.difficulty}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Latest Block:</span>
              <span className="ml-2 font-semibold text-foreground">#{blockchainInfo.latestBlock?.index}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Chain Valid:</span>
              <span className={`ml-2 font-semibold ${blockchainInfo.isValid ? 'text-green-500' : 'text-red-500'}`}>
                {blockchainInfo.isValid ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mining Button */}
      <motion.button
        onClick={handleMine}
        disabled={!canMine || loading}
        className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
          canMine 
            ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white' 
            : 'bg-gray-500/20 text-gray-500'
        }`}
        whileHover={canMine ? { scale: 1.02 } : {}}
        whileTap={canMine ? { scale: 0.98 } : {}}
      >
        {isMining ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Mining Block...</span>
          </>
        ) : (
          <>
            <Pickaxe className="w-5 h-5" />
            <span>
              {!wallet 
                ? 'Connect Wallet to Mine' 
                : pendingTxCount === 0 
                  ? 'No Transactions to Mine' 
                  : `Mine ${pendingTxCount} Transaction${pendingTxCount > 1 ? 's' : ''}`
              }
            </span>
          </>
        )}
      </motion.button>

      {/* Mining Result */}
      {miningResult && (
        <motion.div 
          className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Block Mined Successfully!
              </p>
              <div className="text-xs text-green-600/80 dark:text-green-400/80 space-y-1">
                <div>Block Index: #{miningResult.block.index}</div>
                <div>Block Hash: {miningResult.block.hash.substring(0, 20)}...</div>
                <div>Transactions: {miningResult.block.transactions.length}</div>
                <div>Nonce: {miningResult.block.nonce}</div>
                <div>Reward: {miningResult.reward} PSN</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status Message */}
      {message && (
        <motion.div 
          className={`mt-4 p-4 rounded-xl border ${
            messageType === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start space-x-2">
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        </motion.div>
      )}

      {/* Mining Tips */}
      <motion.div 
        className="mt-6 p-4 bg-card/20 backdrop-blur-sm rounded-xl border border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-2">Mining Tips:</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Mining processes pending transactions into blocks</li>
          <li>• You earn 100 PSN reward for each block mined</li>
          <li>• Mining requires at least 1 pending transaction</li>
          <li>• Higher difficulty means longer mining time</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default MiningPanel;