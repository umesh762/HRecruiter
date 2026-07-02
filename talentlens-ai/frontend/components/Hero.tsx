'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative py-20 overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 mb-6">
          Find your best-fit<br />candidates, instantly
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
          Leverage IBM watsonx Orchestrate to semantically analyze, score, and rank talent against your job description in real-time.
        </p>
      </motion.div>
    </div>
  );
}
