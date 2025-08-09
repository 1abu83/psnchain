'use client';

import { motion } from 'framer-motion';
import { Wallet, Plus, Download, Shield, Zap, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function WelcomePage() {
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
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <Image src="/psn.png" alt="PSNChain" width={32} height={32} className="rounded-lg"/>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">PSNChain</h1>
                <p className="text-xs text-muted-foreground">Blockchain Wallet</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 p-4">
            <Image src="/psn.png" alt="PSNChain" width={64} height={64} className="rounded-xl"/>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
            Welcome to PSNChain
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your gateway to the decentralized future. Create or import your wallet to start using PSNChain blockchain.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <motion.div 
              className="glass p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">Military-grade encryption protects your assets</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4 mx-auto">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fast</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast transactions and confirmations</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Growing</h3>
              <p className="text-sm text-muted-foreground">Join our expanding ecosystem</p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link href="/create-wallet">
              <motion.button
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Create New Wallet</span>
              </motion.button>
            </Link>

            <Link href="/import-wallet">
              <motion.button
                className="w-full sm:w-auto px-8 py-4 bg-card/50 backdrop-blur-sm hover:bg-card/70 text-foreground rounded-xl font-semibold transition-all duration-200 border border-border/50 hover:border-border flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                <span>Import Wallet</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="glass p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Getting Started</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <span>Create New Wallet</span>
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Generate a new secure wallet</li>
                  <li>• Get your unique PSN address</li>
                  <li>• Receive your private key</li>
                  <li>• Start using PSNChain immediately</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-500" />
                  <span>Import Existing Wallet</span>
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Import using your private key</li>
                  <li>• Access your existing PSN assets</li>
                  <li>• Restore your transaction history</li>
                  <li>• Continue where you left off</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                    Security Notice
                  </p>
                  <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                    Your private key is stored locally in your browser. Never share your private key with anyone. 
                    PSNChain cannot recover lost private keys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="glass border-t border-white/10 py-8 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center p-1">
                <Image src="/psn.png" alt="PSNChain" width={24} height={24} className="rounded"/>
              </div>
              <span className="font-semibold text-foreground">PSNChain Wallet</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground text-sm">
                Securely manage your digital assets
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                © 2024 PSNChain. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}