'use client';

import Header from './components/header';
import BalanceDisplay from './components/balance-display';
import TransferForm from './components/transfer-form';
import SwapForm from './components/swap-form';
import TransactionHistory from './components/transaction-history';
import MiningPanel from './components/mining-panel';
import TestPanel from './components/test-panel';
import WalletTest from './components/wallet-test';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Shield, Zap, Wallet, Plus } from 'lucide-react';
import { useWallet } from './providers/wallet-provider';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Home() {
  const { wallet, connected, loading, error } = useWallet();

  // Redirect to welcome page if no wallet exists
  if (!wallet && connected) {
    if (typeof window !== 'undefined') {
      window.location.href = '/welcome';
    }
    return null;
  }

  // Show connection status if not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          <motion.div 
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass p-8 rounded-2xl border border-white/10">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Connection Error
              </h1>
              
              <p className="text-muted-foreground mb-6">
                Unable to connect to PSNChain API. Please check if the backend is running.
              </p>
              
              <div className="text-sm text-muted-foreground">
                API URL: {process.env.NEXT_PUBLIC_API_URL}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Welcome to PSNChain
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of decentralized finance with our modern, secure, and intuitive wallet interface
          </p>
          
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="glass p-6 rounded-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">Bank-level security with advanced encryption</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4 mx-auto">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Fast</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast transactions and confirmations</p>
            </motion.div>
            
            <motion.div 
              className="glass p-6 rounded-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-xl mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Growing</h3>
              <p className="text-sm text-muted-foreground">Join our expanding ecosystem of users</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Main Dashboard */}
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-12 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left column - Balances and Mining */}
          <motion.div 
            className="xl:col-span-4 space-y-6"
            variants={itemVariants}
          >
            <BalanceDisplay />
            <MiningPanel />
            <WalletTest />
            <TestPanel />
          </motion.div>
          
          {/* Right column - Actions and History */}
          <motion.div 
            className="xl:col-span-8 space-y-6"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransferForm />
              <SwapForm />
            </div>
            
            <TransactionHistory />
          </motion.div>
        </motion.div>
      </main>
      
      <motion.footer 
        className="glass border-t border-white/10 py-8 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
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
                Securely manage your digital assets with confidence
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
