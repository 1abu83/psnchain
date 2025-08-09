'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { useWallet } from '../providers/wallet-provider';
import { generatePrivateKey, validatePrivateKey, createWalletFromPrivateKey } from '../../lib/wallet-utils';

const WalletTest = () => {
  const { createWallet } = useWallet();
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  const addResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, { test, success, message, data, timestamp: Date.now() }]);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testWalletGeneration = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Generate private key using frontend utils
      addResult('Frontend Key Generation', false, 'Generating private key...');
      const frontendKey = generatePrivateKey();
      addResult('Frontend Key Generation', true, `Generated: ${frontendKey.length} chars`, { key: frontendKey });
      setGeneratedKey(frontendKey);

      // Test 2: Validate the generated key
      addResult('Key Validation', false, 'Validating private key format...');
      const validation = validatePrivateKey(frontendKey);
      addResult('Key Validation', validation.valid, validation.valid ? 'Valid format' : validation.error);

      // Test 3: Create wallet from generated key
      addResult('Wallet Creation', false, 'Creating wallet from private key...');
      const wallet = await createWalletFromPrivateKey(frontendKey);
      addResult('Wallet Creation', true, `Address: ${wallet.address.substring(0, 20)}...`, { wallet });

      // Test 4: Test backend wallet creation
      addResult('Backend Wallet', false, 'Creating wallet via API...');
      const backendWallet = await createWallet();
      addResult('Backend Wallet', true, `Backend key length: ${backendWallet.privateKey.length}`, { wallet: backendWallet });

      // Test 5: Compare formats
      const frontendIsHex = /^[0-9a-fA-F]+$/.test(frontendKey);
      const backendIsHex = /^[0-9a-fA-F]+$/.test(backendWallet.privateKey);
      
      addResult('Format Comparison', true, 
        `Frontend: ${frontendIsHex ? 'Hex' : 'Not Hex'} (${frontendKey.length} chars), Backend: ${backendIsHex ? 'Hex' : 'Not Hex'} (${backendWallet.privateKey.length} chars)`
      );

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
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TestTube className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Wallet Format Test</h2>
            <p className="text-sm text-muted-foreground">Test private key generation and format</p>
          </div>
        </div>

        <motion.button
          onClick={testWalletGeneration}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <TestTube className="w-4 h-4" />
          <span>{isRunning ? 'Testing...' : 'Run Tests'}</span>
        </motion.button>
      </div>

      {/* Generated Key Display */}
      {generatedKey && (
        <div className="mb-6 p-4 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Generated Private Key</span>
            <motion.button
              onClick={() => copyToClipboard(generatedKey)}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </motion.button>
          </div>
          <p className="text-xs font-mono text-foreground break-all bg-muted/50 p-2 rounded">
            {generatedKey}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Length: {generatedKey.length} characters | Format: {/^[0-9a-fA-F]+$/.test(generatedKey) ? 'Valid Hex' : 'Not Hex'}
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {testResults.map((result, index) => (
          <motion.div
            key={index}
            className={`flex items-start space-x-3 p-3 rounded-xl border ${
              result.success 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
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
              {result.data && (
                <div className="mt-1 text-xs font-mono text-muted-foreground">
                  {result.data.key && `Key: ${result.data.key.substring(0, 20)}...`}
                  {result.data.wallet && `Address: ${result.data.wallet.address.substring(0, 20)}...`}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {testResults.length === 0 && (
        <div className="text-center py-8">
          <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Click "Run Tests" to test wallet generation formats</p>
        </div>
      )}
    </motion.div>
  );
};

export default WalletTest;