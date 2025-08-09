'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Wallet, Send, ArrowLeftRight, History } from 'lucide-react';

const Navigation = () => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Balances', path: '/balances', icon: Wallet },
    { name: 'Transfer', path: '/transfer', icon: Send },
    { name: 'Swap', path: '/swap', icon: ArrowLeftRight },
    { name: 'History', path: '/history', icon: History }
  ];

  return (
    <nav className="hidden lg:block">
      <ul className="flex space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <li key={item.path}>
              <Link href={item.path}>
                <motion.div
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;