'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { History, RefreshCw, ExternalLink, Send, ArrowDownLeft, ArrowLeftRight, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TransactionHistory = () => {
  const { wallet, transactions, loadWalletData } = useWallet();
  const [loading, setLoading] = useState(false);

  // Fetch real transaction history
  const fetchTransactions = async () => {
    if (!wallet) return;
    
    setLoading(true);
    
    try {
      // Refresh wallet data to get latest transactions
      await loadWalletData(wallet.address);
    } catch (error) {
      console.error('Error fetching transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [wallet]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (tx) => {
    if (!tx.sender) return <ArrowDownLeft className="w-4 h-4 text-green-500" />; // Mining reward
    if (tx.sender === wallet?.address) return <Send className="w-4 h-4 text-red-500" />; // Sent
    return <ArrowDownLeft className="w-4 h-4 text-green-500" />; // Received
  };

  const getTransactionType = (tx) => {
    if (!tx.sender) return 'Mining Reward';
    if (tx.sender === wallet?.address) return 'Sent';
    return 'Received';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!wallet) {
    return (
      <motion.div 
        className="glass p-8 rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Transaction History</h2>
          <p className="text-muted-foreground">Connect your wallet to view transaction history</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass p-6 rounded-2xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground">Your transaction history</p>
          </div>
        </div>
        
        <motion.button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-card/50 backdrop-blur-sm hover:bg-card/70 rounded-xl border border-border/50 transition-all duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </motion.button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-muted-foreground">Loading transactions...</span>
          </div>
        </div>
      ) : !transactions || transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No transactions found</p>
          <p className="text-xs text-muted-foreground mt-2">Send some transactions or mine blocks to see history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div 
              key={tx.id} 
              className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:bg-card/50 transition-all duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Type Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center">
                    {getTypeIcon(tx)}
                  </div>
                  
                  {/* Transaction Details */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-foreground capitalize">
                        {getTransactionType(tx)}
                      </span>
                      {getStatusIcon('success')}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-1">
                      <div className="font-medium text-foreground">
                        {tx.amount} PSN
                      </div>
                      <div>
                        {tx.sender === wallet?.address
                          ? `To: ${tx.recipient?.substring(0, 8)}...${tx.recipient?.substring(tx.recipient.length - 4)}` 
                          : tx.sender 
                            ? `From: ${tx.sender?.substring(0, 8)}...${tx.sender?.substring(tx.sender.length - 4)}`
                            : 'Mining Reward'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Block #{tx.blockIndex} • {tx.confirmations} confirmations
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Timestamp and Link */}
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatTimestamp(tx.timestamp)}
                  </div>
                  <motion.a 
                    href={`http://147.93.81.226:3001/api/transaction/${tx.txHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>PSNScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TransactionHistory;