'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { ArrowLeftRight, RefreshCw, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';

const SwapForm = () => {
  const { wallet, balance, loadWalletData, loading } = useWallet();
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error
  const [estimatedOutput, setEstimatedOutput] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  // Get balances array safely
  const balances = balance?.balances || [];

  // Find PSAN balance for gas fee checking
  const psnBalance = balances.find(token => token.denom === 'psan')?.amount || '0';

  // Get available tokens for selection
  const availableTokens = balances.map(token => token.denom);

  // Estimate output when inputs change
  const estimateOutput = async () => {
    if (!amount || !fromToken || !toToken || fromToken === toToken) {
      setEstimatedOutput('');
      return;
    }

    setIsEstimating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would call the swap API
      // For now, we'll simulate with a fixed rate
      const rate = fromToken === 'psan' ? 0.95 : 1.05;
      const output = (parseFloat(amount) * rate).toFixed(6);
      setEstimatedOutput(output);
    } catch (error) {
      console.error('Estimation error', error);
      setEstimatedOutput('');
    } finally {
      setIsEstimating(false);
    }
  };

  // Update estimation when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      estimateOutput();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [amount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount('');
    setEstimatedOutput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wallet) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }
    
    // Validate inputs
    if (!fromToken || !toToken || !amount) {
      setMessage('Please fill all fields');
      setMessageType('error');
      return;
    }
    
    if (fromToken === toToken) {
      setMessage('Cannot swap the same token');
      setMessageType('error');
      return;
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }
    
    // Check if user has enough PSAN for gas
    const psnAmount = parseInt(psnBalance) / 1000000;
    const requiredGas = parseInt(process.env.NEXT_PUBLIC_FEE_AMOUNT || '5000') / 1000000;
    
    if (psnAmount < requiredGas) {
      setMessage(`Insufficient PSAN for gas fee. You need at least ${requiredGas} PSAN for gas.`);
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');
    
    try {
      // In a real implementation, this would call the swap API
      // For now, we'll simulate the swap
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`Successfully swapped ${amount} ${fromToken.toUpperCase()} for ${estimatedOutput} ${toToken.toUpperCase()}`);
      setMessageType('success');
      
      // Reset form
      setAmount('');
      setEstimatedOutput('');
      
      // Refresh balances
      if (wallet) {
        loadWalletData(wallet.address);
      }
    } catch (error) {
      console.error('Swap error', error);
      setMessage(`Swap failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="glass p-6 rounded-2xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <ArrowLeftRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Swap Tokens</h2>
          <p className="text-sm text-muted-foreground">Exchange tokens instantly</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* From Token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            From
          </label>
          <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-4">
            <div className="flex space-x-3">
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
                className="flex-1 bg-transparent text-foreground focus:outline-none"
              >
                <option value="" className="bg-card text-foreground">Select token</option>
                {availableTokens.map((token) => (
                  <option key={token} value={token} className="bg-card text-foreground">
                    {token.toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                className="flex-1 bg-transparent text-foreground text-right focus:outline-none placeholder-muted-foreground"
              />
            </div>
            {fromToken && (
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Available: {balances.find(b => b.denom === fromToken) ? 
                  (parseInt(balances.find(b => b.denom === fromToken).amount) / 1000000).toFixed(2) : '0.00'}</span>
                <span>≈ $0.00</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            onClick={handleSwapTokens}
            className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 rounded-xl border border-blue-500/30 transition-all duration-200"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
          </motion.button>
        </div>
        
        {/* To Token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            To
          </label>
          <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 p-4">
            <div className="flex space-x-3">
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
                className="flex-1 bg-transparent text-foreground focus:outline-none"
              >
                <option value="" className="bg-card text-foreground">Select token</option>
                {availableTokens.map((token) => (
                  <option key={token} value={token} className="bg-card text-foreground">
                    {token.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="flex-1 text-right">
                {isEstimating ? (
                  <div className="flex items-center justify-end space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Calculating...</span>
                  </div>
                ) : (
                  <span className="text-foreground font-medium">
                    {estimatedOutput || '0.00'}
                  </span>
                )}
              </div>
            </div>
            {toToken && estimatedOutput && (
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Rate: 1 {fromToken?.toUpperCase()} = {(parseFloat(estimatedOutput) / parseFloat(amount || 1)).toFixed(6)} {toToken?.toUpperCase()}</span>
                <span>≈ $0.00</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Price Impact & Fees */}
        {estimatedOutput && (
          <motion.div 
            className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className="text-green-500">{'<0.01%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="text-foreground">{parseInt(process.env.NEXT_PUBLIC_FEE_AMOUNT || '5000') / 1000000} PSAN</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !wallet || !fromToken || !toToken || !amount || !estimatedOutput}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Swapping...</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-5 h-5" />
              <span>Swap Tokens</span>
            </>
          )}
        </motion.button>
      </form>
      
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
    </motion.div>
  );
};

export default SwapForm;