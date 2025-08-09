'use client';

import { useWallet } from '../providers/wallet-provider';
import ThemeToggle from './theme-toggle';
import Navigation from './navigation';
import Tooltip from './tooltip';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { wallet, createWallet, disconnectWallet, loading } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    console.log('Copy address clicked', wallet?.address);
    if (wallet?.address) {
      try {
        await navigator.clipboard.writeText(wallet.address);
        setCopied(true);
        console.log('Address copied successfully');
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

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <Image src="/psn.png" alt="PSNChain" width={32} height={32} className="rounded-lg"/>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text hidden sm:block">PSNChain</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Wallet Interface</p>
              </div>
            </div>
            
            <Navigation />
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ThemeToggle />
            
            {wallet ? (
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="hidden md:flex items-center space-x-2 bg-card/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-border/50 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={copyAddress}
                  title={copied ? "Address copied!" : "Click to copy address"}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="text-sm font-medium text-foreground">
                    {wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 4)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>
                <motion.button
                  onClick={disconnectWallet}
                  className="flex items-center space-x-2 px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-all duration-200 border border-destructive/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Disconnect</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={createWallet}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet size={18} />
                <span>{loading ? 'Creating...' : 'Create Wallet'}</span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;