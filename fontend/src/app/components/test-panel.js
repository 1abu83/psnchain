'use client';

import { useState } from 'react';
import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { TestTube, Play, CheckCircle, AlertCircle } from 'lucide-react';

const TestPanel = () => {
  const { wallet, createWallet, mineBlock, sendTransaction, balance, blockchainInfo } = useWallet();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: Date.now() }]);
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Create wallet if not exists
      if (!wallet) {
        addResult('Create Wallet', false, 'Creating wallet...');
        await createWallet();
        addResult('Create Wallet', true, 'Wallet created successfully');
      } else {
        addResult('Wallet Check', true, `Wallet exists: ${wallet.address.substring(0, 12)}...`);
      }

      // Test 2: Check initial balance
      const initialBalance = balance?.balances?.find(b => b.denom === 'psn');
      const initialAmount = initialBalance ? parseInt(initialBalance.amount) / 1000000 : 0;
      addResult('Initial Balance', true, `Balance: ${initialAmount} PSN`);

      // Test 3: Mine a block to get some PSN
      if (initialAmount === 0) {
        addResult('Mining Block', false, 'Mining block to get PSN...');
        await mineBlock();
        addResult('Mining Block', true, 'Block mined successfully, earned 100 PSN');
      }

      // Test 4: Create second wallet for testing
      const testWallet = {
        address: 'psn' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        publicKey: '04' + Math.random().toString(36).substring(2, 15),
        privateKey: Math.random().toString(36).substring(2, 15)
      };
      addResult('Test Wallet', true, `Created test wallet: ${testWallet.address.substring(0, 12)}...`);

      // Test 5: Send transaction
      addResult('Send Transaction', false, 'Sending 10 PSN to test wallet...');
      const txData = {
        sender: wallet.address,
        recipient: testWallet.address,
        amount: 10,
        privateKey: wallet.privateKey
      };

      const result = await sendTransaction(txData);
      addResult('Send Transaction', true, `Transaction sent: ${result.transaction.txHash.substring(0, 12)}...`);

      // Test 6: Mine the transaction
      addResult('Mine Transaction', false, 'Mining transaction into block...');
      await mineBlock();
      addResult('Mine Transaction', true, 'Transaction mined into block');

      addResult('Full Test', true, 'All tests completed successfully!');

    } catch (error) {
      addResult('Test Failed', false, `Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <motion.div 
      className="glass p-6 rounded-2xl border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <TestTube className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Test Panel</h2>
            <p className="text-sm text-muted-foreground">Test blockchain functionality</p>
          </div>
        </div>

        <motion.button
          onClick={runFullTest}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-4 h-4" />
          <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
        </motion.button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/50">
          <div className="text-sm text-muted-foreground">Wallet</div>
          <div className="text-sm font-medium text-foreground">
            {wallet ? `${wallet.address.substring(0, 12)}...` : 'Not connected'}
          </div>
        </div>
        <div className="bg-card/30 backdrop-blur-sm p-3 rounded-xl border border-border/50">
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className="text-sm font-medium text-foreground">
            {balance?.balances?.find(b => b.denom === 'psn') 
              ? `${(parseInt(balance.balances.find(b => b.denom === 'psn').amount) / 1000000).toFixed(2)} PSN`
              : '0 PSN'
            }
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {testResults.map((result, index) => (
          <motion.div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-xl border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {result.test}
              </div>
              <div className={`text-xs ${
                result.success ? 'text-green-600/80 dark:text-green-400/80' : 'text-red-600/80 dark:text-red-400/80'
              }`}>
                {result.message}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {testResults.length === 0 && (
        <div className="text-center py-8">
          <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Click "Run Tests" to test blockchain functionality</p>
        </div>
      )}
    </motion.div>
  );
};

export default TestPanel;