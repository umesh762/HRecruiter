'use client';

import { motion } from 'framer-motion';
import { RankedCandidate } from '@/types/candidate';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Trophy, Medal, Award } from 'lucide-react';

interface RankedCandidateCardProps {
  candidate: RankedCandidate;
}

export default function RankedCandidateCard({ candidate }: RankedCandidateCardProps) {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    // Count up animation for the score
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    const increment = candidate.final_score / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= candidate.final_score) {
        setDisplayedScore(candidate.final_score);
        clearInterval(timer);
      } else {
        setDisplayedScore(Math.floor(current));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [candidate.final_score]);

  const isTopRanked = candidate.rank === 1;

  const renderRankIcon = () => {
    switch (candidate.rank) {
      case 1:
        return <Trophy className="text-yellow-400 w-6 h-6" />;
      case 2:
        return <Medal className="text-gray-300 w-6 h-6" />;
      case 3:
        return <Award className="text-amber-600 w-6 h-6" />;
      default:
        return <span className="font-bold text-gray-500">#{candidate.rank}</span>;
    }
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={clsx(
        "relative bg-gray-900 border rounded-2xl p-6 overflow-hidden transition-all duration-300 shadow-xl",
        isTopRanked 
          ? "border-blue-500/50 shadow-blue-900/20" 
          : "border-gray-800 shadow-black/50"
      )}
    >
      {isTopRanked && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <div className={clsx(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isTopRanked ? "bg-yellow-400/10" : "bg-gray-800"
          )}>
            {renderRankIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">{candidate.name || `Candidate ${candidate.rank}`}</h3>
            <p className="text-sm text-gray-400">Rank #{candidate.rank}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-400 font-medium mb-1">Match Score</span>
          <div className={clsx(
            "text-4xl font-black tracking-tighter",
            isTopRanked ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400" : "text-gray-200"
          )}>
            {displayedScore}
            <span className="text-xl text-gray-500 ml-1">/100</span>
          </div>
        </div>
      </div>
      
      <ScoreBreakdownChart 
        semanticScore={candidate.semantic_score}
        attributeScore={candidate.attribute_score}
        signalScore={candidate.signal_score}
      />
      
      <div className="mt-6 pt-4 border-t border-gray-800/50">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">AI Rationale</h4>
        <p className="text-gray-400 text-sm leading-relaxed">
          {candidate.rationale}
        </p>
      </div>
    </motion.div>
  );
}
