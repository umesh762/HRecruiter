'use client';

import { useState, useRef, DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  label?: string;
}

export default function FileUploadZone({ onFileSelect, selectedFile, label = 'document' }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds 10MB limit. (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      return false;
    }

    // Check extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx' && extension !== 'txt') {
      setError('Only .pdf, .docx, and .txt files are supported.');
      return false;
    }

    return true;
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const removeFile = () => {
    onFileSelect(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
      />

      {selectedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative flex items-center justify-between p-4 bg-gray-900/60 border border-blue-500/30 rounded-xl"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate pr-4">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1 hover:bg-gray-800 text-gray-400 hover:text-red-400 rounded-full transition-colors"
            title="Remove File"
          >
            <X size={18} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          animate={{
            borderColor: isDragActive ? 'rgb(59, 130, 246)' : 'rgb(55, 65, 81)',
            backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(17, 24, 39, 0.4)',
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-gray-500 transition-colors h-64 text-center group"
        >
          <motion.div
            animate={{ y: isDragActive ? -4 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center justify-center space-y-3"
          >
            <div className="p-3 bg-gray-800/80 rounded-full text-gray-400 group-hover:text-blue-400 transition-colors">
              <Upload size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-200">
                Drag and drop your {label} here, or <span className="text-blue-400 group-hover:underline">browse</span>
              </p>
              <p className="text-xs text-gray-500">
                Supports PDF, DOCX, and TXT up to 10MB
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-xs text-red-400 mt-1"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
