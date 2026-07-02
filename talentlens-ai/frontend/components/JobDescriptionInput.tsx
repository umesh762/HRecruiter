'use client';

import FileUploadZone from './FileUploadZone';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  mode: 'text' | 'file';
  onModeChange: (mode: 'text' | 'file') => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
  file,
  onFileChange,
  mode,
  onModeChange,
}: JobDescriptionInputProps) {
  return (
    <div className="flex flex-col space-y-3 w-full">
      <div className="flex justify-between items-center">
        <label htmlFor="jd" className="text-lg font-semibold text-gray-200">
          Job Description
        </label>
        
        {/* Toggle Tabs */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => onModeChange('text')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              mode === 'text'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => onModeChange('file')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              mode === 'file'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      {mode === 'text' ? (
        <div className="relative group h-64">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl blur opacity-25 group-focus-within:opacity-75 transition duration-500"></div>
          <textarea
            id="jd"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the full job description here..."
            className="relative w-full h-full bg-gray-900 border border-gray-700 text-gray-200 rounded-xl p-4 focus:outline-none focus:ring-0 placeholder-gray-500 resize-none"
          />
        </div>
      ) : (
        <div className="h-64">
          <FileUploadZone
            selectedFile={file}
            onFileSelect={onFileChange}
            label="job description"
          />
        </div>
      )}
    </div>
  );
}
