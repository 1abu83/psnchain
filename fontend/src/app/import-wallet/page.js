'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Eye, EyeOff, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '../providers/wallet-provider';
import { createWalletFromPrivateKey, importWalletFromJSON, validatePrivateKey } from '../../lib/wallet-utils';

export default function ImportWalletPage() {
  const router = useRouter();
  const { loading } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [importedWallet, setImportedWallet] = useState(null);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);



  const handleImport = async () => {
    setError('');
    setIsImporting(true);

    try {
      // Validate private key
      if (!privateKey.trim()) {
        throw new Error('Please enter your private key');
      }

      // Validate private key format
      const validation = validatePrivateKey(privateKey.trim());
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create wallet from private key
      const wallet = await createWalletFromPrivateKey(privateKey.trim());
      
      // Save to localStorage
      localStorage.setItem('psnchain_wallet', JSON.stringify(wallet));
      
      setImportedWallet(wallet);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target.result;
        const wallet = await importWalletFromJSON(jsonData);
        setPrivateKey(wallet.privateKey);
        setError(''); // Clear any previous errors
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  if (importedWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="glass p-8 rounded-2xl border border-white/10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Wallet Imported Successfully!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your wallet has been imported and you will be redirected to the dashboard.
            </p>
            
            <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
              <p className="text-sm font-mono text-foreground break-all">
                {importedWallet.address}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/welcome">
              <motion.button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Image src="/psn.png" alt="PSNChain" width={32} height={32} className="rounded-lg"/>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Import Wallet</h1>
                <p className="text-xs text-muted-foreground">Restore your existing wallet</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass p-8 rounded-2xl border border-white/10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 p-4">
                  <Download className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Import Your Wallet
                </h1>
                <p className="text-muted-foreground">
                  Enter your private key or upload a wallet file to restore your PSNChain wallet.
                </p>
              </div>

              {/* Import Methods */}
              <div className="space-y-6">
                {/* Private Key Input */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-foreground">
                    Private Key
                  </label>
                  <div className="relative">
                    <textarea
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="Enter your private key here... (minimum 32 characters)"
                      type={showPrivateKey ? 'text' : 'password'}
                      className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none h-24 font-mono text-sm"
                    />
                    <motion.button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  
                  {/* Example private keys for testing */}
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-2">For testing, you can use these example formats:</p>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setPrivateKey('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456')}
                        className="block w-full text-left px-2 py-1 bg-muted/30 rounded text-xs font-mono hover:bg-muted/50 transition-colors"
                      >
                        Standard 64-char hex: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')}
                        className="block w-full text-left px-2 py-1 bg-muted/30 rounded text-xs font-mono hover:bg-muted/50 transition-colors"
                      >
                        Simple 64-char hex: 1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrivateKey('my-super-secret-private-key-for-testing-purposes-only-12345')}
                        className="block w-full text-left px-2 py-1 bg-muted/30 rounded text-xs font-mono hover:bg-muted/50 transition-colors"
                      >
                        Text format (min 32 chars): my-super-secret-private-key-for-testing-purposes-only-12345
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-foreground">
                    Or Upload Wallet File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                      id="wallet-file"
                    />
                    <label
                      htmlFor="wallet-file"
                      className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-foreground hover:bg-card/70 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 border-dashed"
                    >
                      <Download className="w-4 h-4" />
                      <span>Choose wallet file (.json)</span>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div 
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Import Button */}
                <motion.button
                  onClick={handleImport}
                  disabled={!privateKey.trim() || isImporting}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Importing Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Import Wallet</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                      Security Notice
                    </p>
                    <ul className="text-xs text-yellow-600/80 dark:text-yellow-400/80 space-y-1">
                      <li>• Only import wallets from trusted sources</li>
                      <li>• Never share your private key with anyone</li>
                      <li>• Make sure you're on the official PSNChain website</li>
                      <li>• Your private key is stored locally and never sent to our servers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}