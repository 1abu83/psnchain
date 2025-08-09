'use client';

import { useState } from 'react';
import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { Send, ArrowRight, AlertCircle, CheckCircle, Loader2, Zap } from 'lucide-react';

const TransferForm = () => {
  const { wallet, balance, sendTransaction, loading, error } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState(process.env.NEXT_PUBLIC_FEE_DENOM || 'psn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success or error

  // Get balances array safely
  const balances = balance?.balances || [];
  
  // Find PSAN balance for gas fee checking
  const psnBalance = balances.find(token => token.denom === 'psan')?.amount || '0';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Transfer form submitted');
    console.log('Wallet:', wallet);
    console.log('Balance:', balance);
    console.log('PSAN Balance:', psnBalance);
    
    if (!wallet) {
      setMessage('Please connect your wallet first');
      setMessageType('error');
      return;
    }
    
    // Validate inputs
    if (!recipient || !amount || !selectedToken) {
      setMessage('Please fill all fields');
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
    
    // Check if user has enough balance for the transaction
    const selectedBalance = balances.find(b => b.denom === selectedToken);
    const availableAmount = selectedBalance ? parseInt(selectedBalance.amount) / 1000000 : 0;
    
    console.log('Available amount:', availableAmount);
    console.log('Requested amount:', amountNum);
    
    if (availableAmount < amountNum) {
      setMessage(`Insufficient balance. You have ${availableAmount.toFixed(6)} ${selectedToken.toUpperCase()}, but trying to send ${amountNum}`);
      setMessageType('error');
      return;
    }
    
    // For PSAN transactions, also check if enough left for gas (simplified check)
    if (selectedToken === 'psan' && availableAmount < (amountNum + 0.001)) {
      setMessage(`Insufficient PSAN. You need extra PSAN for transaction fees.`);
      setMessageType('error');
      return;
    }
    
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');
    
    try {
      // Create transaction data for PSNChain API
      const transactionData = {
        sender: wallet.address,
        recipient: recipient,
        amount: amountNum,
        privateKey: wallet.privateKey
      };
      
      console.log('Sending transaction:', transactionData);
      
      // Send transaction via API
      const result = await sendTransaction(transactionData);
      
      console.log('Transaction result:', result);
      
      setMessage(`Successfully sent ${amountNum} ${selectedToken.toUpperCase()} to ${recipient.substring(0, 8)}...${recipient.substring(recipient.length - 8)}`);
      setMessageType('success');
      
      // Reset form
      setRecipient('');
      setAmount('');
      
    } catch (error) {
      console.error('Transfer error:', error);
      setMessage(`Transaction failed: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available tokens for selection
  const availableTokens = balances.map(token => token.denom);

  return (
    <motion.div 
      className="glass p-6 rounded-2xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Send Tokens</h2>
          <p className="text-sm text-muted-foreground">Transfer tokens to another address</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Recipient Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Recipient Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="psn1234567890abcdef..."
              className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        {/* Token Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Select Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            {availableTokens.map((token) => (
              <option key={token} value={token} className="bg-card text-foreground">
                {token.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        
        {/* Amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-foreground">
              Amount
            </label>
            <span className="text-xs text-muted-foreground">
              Available: {selectedToken && balances.find(b => b.denom === selectedToken) ? 
                (parseInt(balances.find(b => b.denom === selectedToken).amount) / 1000000).toFixed(2) : '0.00'} {selectedToken?.toUpperCase()}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedToken?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Gas Fee Info */}
        <motion.div 
          className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-4 rounded-xl border border-blue-500/20"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Network Fee:</span>
            <span className="text-sm text-blue-500 font-semibold">
              {parseInt(process.env.NEXT_PUBLIC_FEE_AMOUNT || '5000') / 1000000} PSAN
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Required for transaction processing
          </p>
        </motion.div>
        
        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !wallet || !recipient || !amount}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Tokens</span>
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

export default TransferForm;