'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

const baseSteps = [
  "Understanding job requirements",
  "Analyzing candidate profiles",
  "Computing semantic match",
  "Evaluating attributes & signals",
  "Generating insights"
];

interface LoadingStateProps {
  filesToExtract?: string[];
}

export default function LoadingState({ filesToExtract = [] }: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Combine dynamic file extraction steps with base steps
  const fileSteps = filesToExtract.map(filename => `Extracting text from ${filename}...`);
  const steps = [...fileSteps, ...baseSteps];

  useEffect(() => {
    // Reset step index if inputs change
    setCurrentStep(0);

    // Simulate progression through steps for visual effect
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);
    
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-2xl p-8 w-full max-w-md mx-auto my-12"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
        <h3 className="text-xl font-bold text-gray-200 mt-6 tracking-tight">AI is working...</h3>
        <p className="text-gray-500 text-sm mt-2 text-center">Processing through Watsonx Orchestrate</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <motion.div 
              key={`${step}-${index}`}
              initial={{ opacity: 0.3, x: -10 }}
              animate={{ 
                opacity: isCompleted || isCurrent ? 1 : 0.4,
                x: 0,
                scale: isCurrent ? 1.02 : 1
              }}
              className="flex items-center space-x-4"
            >
              {isCompleted ? (
                <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" />
              ) : isCurrent ? (
                <CircleDashed className="text-blue-500 w-5 h-5 animate-spin-slow flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-gray-700 flex-shrink-0" />
              )}
              
              <span className={`text-sm font-medium ${isCurrent ? 'text-blue-100' : isCompleted ? 'text-gray-300' : 'text-gray-600'}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
