'use client';

import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

const BalanceDisplay = () => {
  const { wallet, balance, loadWalletData, loading } = useWallet();
  const [showBalances, setShowBalances] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    console.log('Copy address clicked from balance display', wallet?.address);
    if (wallet?.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        console.log('Address copied successfully from balance display');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = wallet.address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleRefresh = async () => {
    if (wallet) {
      setIsRefreshing(true);
      await loadWalletData(wallet.address);
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  if (!wallet) {
    return (
      <motion.div 
        className="glass p-8 rounded-2xl border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Token Balances</h2>
          <p className="text-muted-foreground">Connect your wallet to view balances</p>
        </div>
      </motion.div>
    );
  }

  // Get balances array safely
  const balances = balance?.balances || [];
  
  // Find PSN balance specifically
  const psnBalance = balances.find(token => token.denom === process.env.NEXT_PUBLIC_FEE_DENOM) || { denom: 'psn', amount: '0' };
  
  // Get other tokens (excluding PSN)
  const otherTokens = balances.filter(token => token.denom !== process.env.NEXT_PUBLIC_FEE_DENOM);

  // Calculate total value (mock calculation for demo)
  const totalValue = (parseInt(psnBalance.amount) / 1000000) * 1.5; // Mock PSN price

  return (
    <motion.div 
      className="glass p-6 rounded-2xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Portfolio</h2>
            <p className="text-sm text-muted-foreground">Your token balances</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Wallet Address */}
      <motion.div 
        className="bg-card/30 backdrop-blur-sm p-4 rounded-xl mb-6 border border-border/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
            <p className="text-sm font-mono text-foreground">
              {wallet.address?.substring(0, 12)}...{wallet.address?.substring(wallet.address.length - 8)}
            </p>
          </div>
          <motion.button
            onClick={copyAddress}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-all duration-200 border border-blue-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Total Value */}
      <motion.div 
        className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-4 rounded-xl mb-6 border border-blue-500/20"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-foreground">
              {showBalances ? `$${totalValue.toFixed(2)}` : '••••••'}
            </p>
          </div>
          <div className="flex items-center space-x-1 text-green-500">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+2.4%</span>
          </div>
        </div>
      </motion.div>
      
      <div className="space-y-3">
        {/* PSN Token Balance */}
        <motion.div 
          className="bg-gradient-to-r from-blue-500/5 to-purple-600/5 p-4 rounded-xl border border-blue-500/10"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-12 h-12 flex items-center justify-center shadow-lg p-2">
                  <Image src="/psn.png" alt="PSN" width={32} height={32} className="rounded-lg"/>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="font-semibold text-foreground">PSN Token</div>
                <div className="text-sm text-muted-foreground">Native Token</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-foreground text-lg">
                {showBalances ? (parseInt(psnBalance.amount) / 1000000).toFixed(2) : '••••'}
              </div>
              <div className="text-sm text-muted-foreground">
                {showBalances ? `$${((parseInt(psnBalance.amount) / 1000000) * 1.5).toFixed(2)}` : '••••'}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Other Tokens */}
        {otherTokens.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Other Assets</h3>
            <div className="space-y-2">
              {otherTokens.map((token, index) => (
                <motion.div 
                  key={index} 
                  className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/50 hover:bg-card/50 transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white font-bold rounded-lg w-10 h-10 flex items-center justify-center text-sm">
                        {token.denom.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{token.denom.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">Token</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {showBalances ? (parseInt(token.amount) / 1000000).toFixed(2) : '••••'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {showBalances ? '$0.00' : '••••'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {otherTokens.length === 0 && (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No other tokens found</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default BalanceDisplay;