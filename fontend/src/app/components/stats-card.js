'use client';

import { motion } from 'framer-motion';

const StatsCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-500',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-500',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-500',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-500',
  };

  return (
    <motion.div
      className="glass p-6 rounded-2xl border border-white/10"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center border`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;