'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/Hero';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import CandidateInput from '@/components/CandidateInput';
import RankButton from '@/components/RankButton';
import LoadingState from '@/components/LoadingState';
import RankedCandidateCard from '@/components/RankedCandidateCard';
import EmptyState from '@/components/EmptyState';
import Sidebar from '@/components/Sidebar';
import { RankedCandidate } from '@/types/candidate';
import { rankCandidates } from '@/lib/api';
import { exportToExcel } from '@/lib/export';
import { Download } from 'lucide-react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionMode, setJobDescriptionMode] = useState<'text' | 'file'>('text');

  const [candidates, setCandidates] = useState<string[]>(['']);
  const [candidateFiles, setCandidateFiles] = useState<(File | null)[]>([null]);
  const [candidateModes, setCandidateModes] = useState<('text' | 'file')[]>(['text']);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RankedCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNewAnalysis = () => {
    setJobDescription('');
    setJobDescriptionFile(null);
    setJobDescriptionMode('text');
    setCandidates(['']);
    setCandidateFiles([null]);
    setCandidateModes(['text']);
    setResults(null);
    setError(null);
  };

  const loadSampleData = () => {
    setJobDescriptionMode('text');
    setJobDescriptionFile(null);
    setJobDescription("We are looking for a Senior Frontend Engineer with deep expertise in React, Next.js, and TypeScript. The ideal candidate will have 5+ years of experience building scalable web applications, a strong eye for UI/UX design, and experience with Framer Motion or similar animation libraries. Excellent communication skills and a product-focused mindset are required.");
    
    setCandidateModes(['text', 'text', 'text']);
    setCandidateFiles([null, null, null]);
    setCandidates([
      "Sarah Jenkins - 6 years experience. Expert in React and Next.js. Previously led the frontend team at a major SaaS company. Strong portfolio showing complex animations using Framer Motion. Great communication skills.",
      "Michael Chen - 3 years experience. Primarily worked with Angular but has done some React on the side. Good backend knowledge with Node.js. Enthusiastic but lacks deep UI/UX experience.",
      "Elena Rodriguez - 8 years experience. Full-stack developer with strong React skills. Built multiple Next.js applications. Strong design sensibilities and CSS skills, though hasn't used Framer Motion specifically."
    ]);
  };

  const handleRank = async () => {
    // Validation
    const isJdEmpty = jobDescriptionMode === 'text' ? !jobDescription.trim() : !jobDescriptionFile;
    if (isJdEmpty) {
      setError("Please provide a job description.");
      return;
    }

    const validCandidates = candidates.filter((c, i) => {
      const mode = candidateModes[i] || 'text';
      if (mode === 'file') return !!candidateFiles[i];
      return c.trim().length > 0;
    });

    if (validCandidates.length === 0) {
      setError("Please provide at least one candidate profile.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await rankCandidates(
        jobDescription,
        jobDescriptionFile,
        candidates,
        candidateFiles,
        { jd: jobDescriptionMode, candidates: candidateModes }
      );
      
      // Ensure we have results and sort them just in case backend didn't
      if (response && response.ranked_candidates) {
        const sorted = [...response.ranked_candidates].sort((a, b) => a.rank - b.rank);
        setResults(sorted);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "An error occurred while ranking candidates. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isJdEmpty = jobDescriptionMode === 'text' ? !jobDescription.trim() : !jobDescriptionFile;
  const hasNoCandidates = candidates.every((c, i) => {
    const mode = candidateModes[i] || 'text';
    if (mode === 'file') return !candidateFiles[i];
    return !c.trim();
  });
  const isRankDisabled = isJdEmpty || hasNoCandidates;

  // Compile filenames of files currently being uploaded/extracted
  const filesToExtract: string[] = [];
  if (jobDescriptionMode === 'file' && jobDescriptionFile) {
    filesToExtract.push(jobDescriptionFile.name);
  }
  candidateModes.forEach((mode, idx) => {
    if (mode === 'file' && candidateFiles[idx]) {
      filesToExtract.push(candidateFiles[idx]!.name);
    }
  });

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden selection:bg-blue-500/30">
      {/* Fixed Sidebar */}
      <Sidebar 
        onNewAnalysis={handleNewAnalysis}
        onLoadSampleData={loadSampleData}
      />

      {/* Main Scrollable Content */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth p-6 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto flex flex-col space-y-12">
          
          <Hero />

          {/* Form Container */}
          <div className="flex flex-col space-y-8 bg-slate-900/40 p-6 md:p-10 rounded-3xl border border-slate-800/50 backdrop-blur-sm shadow-2xl relative z-10">
            <JobDescriptionInput 
              value={jobDescription} 
              onChange={setJobDescription}
              file={jobDescriptionFile}
              onFileChange={setJobDescriptionFile}
              mode={jobDescriptionMode}
              onModeChange={setJobDescriptionMode}
            />
            
            <CandidateInput 
              candidates={candidates} 
              onChange={setCandidates}
              candidateFiles={candidateFiles}
              onFileChange={setCandidateFiles}
              modes={candidateModes}
              onModeChange={setCandidateModes}
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="pt-4 max-w-sm mx-auto w-full">
              <RankButton 
                onClick={handleRank} 
                isLoading={isLoading} 
                disabled={isRankDisabled} 
              />
            </div>
          </div>

          {/* Results Area */}
          <div className="pb-16 relative z-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" exit={{ opacity: 0 }}>
                  <LoadingState filesToExtract={filesToExtract} />
                </motion.div>
              ) : results && results.length > 0 ? (
                <motion.div 
                  key="results"
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: {
                      transition: {
                        staggerChildren: 0.15
                      }
                    }
                  }}
                  className="flex flex-col space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-100">Analysis Results</h2>
                      <p className="text-slate-400 mt-1">Candidates ranked by overall match</p>
                    </div>
                    <button
                      onClick={() => exportToExcel(results)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl transition-all font-medium shadow-lg hover:shadow-emerald-900/20"
                    >
                      <Download className="w-5 h-5" />
                      Export to Excel
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((candidate) => (
                      <RankedCandidateCard key={candidate.rank} candidate={candidate} />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
