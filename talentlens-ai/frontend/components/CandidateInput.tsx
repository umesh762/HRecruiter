'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface CandidateInputProps {
  candidates: string[];
  onChange: (candidates: string[]) => void;
  candidateFiles: (File | null)[];
  onFileChange: (files: (File | null)[]) => void;
  modes: ('text' | 'file')[];
  onModeChange: (modes: ('text' | 'file')[]) => void;
}

export default function CandidateInput({
  candidates,
  onChange,
  candidateFiles,
  onFileChange,
  modes,
  onModeChange,
}: CandidateInputProps) {
  const addCandidate = () => {
    onChange([...candidates, '']);
    onFileChange([...candidateFiles, null]);
    onModeChange([...modes, 'text']);
  };

  const removeCandidate = (index: number) => {
    const newCandidates = [...candidates];
    newCandidates.splice(index, 1);
    onChange(newCandidates);

    const newFiles = [...candidateFiles];
    newFiles.splice(index, 1);
    onFileChange(newFiles);

    const newModes = [...modes];
    newModes.splice(index, 1);
    onModeChange(newModes);
  };

  const updateCandidateText = (index: number, value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index] = value;
    onChange(newCandidates);
  };

  const updateCandidateFile = (index: number, file: File | null) => {
    const newFiles = [...candidateFiles];
    newFiles[index] = file;
    onFileChange(newFiles);
  };

  const toggleMode = (index: number, newMode: 'text' | 'file') => {
    const newModes = [...modes];
    newModes[index] = newMode;
    onModeChange(newModes);

    // Clear the alternative input when switching modes
    if (newMode === 'file') {
      const newCandidates = [...candidates];
      newCandidates[index] = '';
      onChange(newCandidates);
    } else {
      const newFiles = [...candidateFiles];
      newFiles[index] = null;
      onFileChange(newFiles);
    }
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex justify-between items-end">
        <label className="text-lg font-semibold text-gray-200">Candidates</label>
        <button
          type="button"
          onClick={addCandidate}
          className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg"
        >
          <Plus size={16} />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {candidates.map((candidate, index) => {
            const mode = modes[index] || 'text';
            const file = candidateFiles[index] || null;

            return (
              <motion.div
                key={`candidate-${index}`}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="relative group overflow-hidden"
              >
                <div className="absolute -inset-0.5 bg-gray-700/50 rounded-xl opacity-50 group-focus-within:bg-blue-500/30 transition duration-300"></div>
                <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col space-y-3">
                  
                  {/* Candidate Header / Mode Selector */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-400">Candidate #{index + 1}</span>
                    
                    <div className="flex items-center space-x-3">
                      {/* Mode Tabs */}
                      <div className="flex bg-gray-950 border border-gray-800 rounded-lg p-0.5 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => toggleMode(index, 'text')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            mode === 'text'
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                              : 'text-gray-500 hover:text-gray-300 border border-transparent'
                          }`}
                        >
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMode(index, 'file')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            mode === 'file'
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                              : 'text-gray-500 hover:text-gray-300 border border-transparent'
                          }`}
                        >
                          File
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove Candidate"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Input Selector */}
                  {mode === 'text' ? (
                    <div className="relative group overflow-hidden">
                      <div className="relative flex bg-gray-950 border border-gray-800 rounded-lg">
                        <textarea
                          value={candidate}
                          onChange={(e) => updateCandidateText(index, e.target.value)}
                          placeholder={`Candidate ${index + 1} profile or resume text...`}
                          className="flex-grow h-32 bg-transparent text-gray-200 p-3 focus:outline-none resize-none placeholder-gray-600 text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32">
                      <FileUploadZone
                        selectedFile={file}
                        onFileSelect={(f) => updateCandidateFile(index, f)}
                        label={`candidate ${index + 1} resume`}
                      />
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {candidates.length === 0 && (
          <div className="text-center p-8 border border-dashed border-gray-700 rounded-xl text-gray-500">
            No candidates added. Click &quot;Add Candidate&quot; to begin.
          </div>
        )}
      </div>
    </div>
  );
}
