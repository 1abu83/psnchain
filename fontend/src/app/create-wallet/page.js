'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Copy, Check, Eye, EyeOff, Download, Shield, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from '../providers/wallet-provider';
import { exportWallet } from '../../lib/wallet-utils';

export default function CreateWalletPage() {
  const router = useRouter();
  const { createWallet, loading } = useWallet();
  const [step, setStep] = useState(1); // 1: Create, 2: Show wallet, 3: Confirm
  const [wallet, setWallet] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState({ address: false, privateKey: false });
  const [confirmed, setConfirmed] = useState(false);

  const handleCreateWallet = async () => {
    try {
      const newWallet = await createWallet();
      setWallet(newWallet);
      setStep(2);
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFinish = () => {
    router.push('/');
  };

  const downloadWallet = () => {
    const walletData = exportWallet(wallet);
    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psnchain-wallet-${wallet.address.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                <h1 className="text-xl font-bold gradient-text">Create Wallet</h1>
                <p className="text-xs text-muted-foreground">Step {step} of 3</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Create Wallet */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="glass p-8 rounded-2xl border border-white/10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 p-4">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Create Your PSNChain Wallet
                </h1>
                <p className="text-muted-foreground mb-8">
                  Generate a new secure wallet to start using PSNChain blockchain. 
                  Your wallet will be created with military-grade encryption.
                </p>

                <motion.button
                  onClick={handleCreateWallet}
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Wallet...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Generate Wallet</span>
                    </>
                  )}
                </motion.button>

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Secure Generation
                      </p>
                      <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                        Your wallet is generated using cryptographically secure random numbers. 
                        The private key never leaves your device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Show Wallet Details */}
          {step === 2 && wallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass p-8 rounded-2xl border border-white/10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Wallet Created Successfully!
                  </h1>
                  <p className="text-muted-foreground">
                    Your PSNChain wallet has been generated. Please save your wallet information securely.
                  </p>
                </div>

                {/* Wallet Address */}
                <div className="space-y-4">
                  <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Wallet Address</label>
                      <motion.button
                        onClick={() => copyToClipboard(wallet.address, 'address')}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors text-xs"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copied.address ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied.address ? 'Copied!' : 'Copy'}</span>
                      </motion.button>
                    </div>
                    <p className="text-sm font-mono text-foreground break-all bg-muted/50 p-2 rounded">
                      {wallet.address}
                    </p>
                  </div>

                  {/* Private Key */}
                  <div className="bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Private Key</label>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="flex items-center space-x-1 px-2 py-1 bg-gray-500/10 hover:bg-gray-500/20 text-gray-500 rounded-lg transition-colors text-xs"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showPrivateKey ? 'Hide' : 'Show'}</span>
                        </motion.button>
                        <motion.button
                          onClick={() => copyToClipboard(wallet.privateKey, 'privateKey')}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors text-xs"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copied.privateKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied.privateKey ? 'Copied!' : 'Copy'}</span>
                        </motion.button>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-foreground break-all bg-muted/50 p-2 rounded">
                      {showPrivateKey ? wallet.privateKey : '•'.repeat(64)}
                    </p>
                  </div>

                  {/* Download Wallet */}
                  <motion.button
                    onClick={downloadWallet}
                    className="w-full px-4 py-3 bg-card/50 backdrop-blur-sm hover:bg-card/70 text-foreground rounded-xl font-medium transition-all duration-200 border border-border/50 hover:border-border flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Wallet File</span>
                  </motion.button>
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Important Security Notice
                      </p>
                      <ul className="text-xs text-red-600/80 dark:text-red-400/80 space-y-1">
                        <li>• Never share your private key with anyone</li>
                        <li>• Store your private key in a secure location</li>
                        <li>• PSNChain cannot recover lost private keys</li>
                        <li>• Anyone with your private key can access your funds</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <motion.button
                    onClick={() => setStep(3)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="glass p-8 rounded-2xl border border-white/10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Secure Your Wallet
                </h1>
                <p className="text-muted-foreground mb-8">
                  Please confirm that you have safely stored your wallet information before proceeding.
                </p>

                <div className="space-y-4 mb-8">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-foreground text-left">
                      I understand that PSNChain cannot recover my wallet if I lose my private key. 
                      I have safely stored my wallet information in a secure location.
                    </span>
                  </label>
                </div>

                <motion.button
                  onClick={handleFinish}
                  disabled={!confirmed}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={confirmed ? { scale: 1.02 } : {}}
                  whileTap={confirmed ? { scale: 0.98 } : {}}
                >
                  Access My Wallet
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}