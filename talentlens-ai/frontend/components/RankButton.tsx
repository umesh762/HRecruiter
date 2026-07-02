'use client';

import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import clsx from 'clsx';

interface RankButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function RankButton({ onClick, isLoading, disabled }: RankButtonProps) {
  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={clsx(
        "relative w-full overflow-hidden rounded-xl font-bold text-lg h-16 flex items-center justify-center space-x-3 transition-all duration-300 shadow-xl shadow-blue-900/20",
        disabled || isLoading
          ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
          : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-blue-500/25 cursor-pointer"
      )}
    >
      {!disabled && !isLoading && (
        <div className="absolute inset-0 bg-white/20 hover:bg-transparent transition-colors opacity-0 hover:opacity-100"></div>
      )}
      
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" size={24} />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Sparkles size={24} className="text-blue-200" />
          <span>Rank Candidates</span>
        </>
      )}
    </motion.button>
  );
}
