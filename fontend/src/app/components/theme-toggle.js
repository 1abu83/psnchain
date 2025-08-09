'use client';

import { useWallet } from '../providers/wallet-provider';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useWallet();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 180 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === 'light' ? (
          <Moon className="w-4 h-4 text-foreground" />
        ) : (
          <Sun className="w-4 h-4 text-foreground" />
        )}
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20 opacity-0"
        animate={{
          opacity: theme === 'light' ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;