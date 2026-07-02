import { Plus, History, Settings, FileSpreadsheet, LayoutDashboard, BrainCircuit } from 'lucide-react';

interface SidebarProps {
  onNewAnalysis: () => void;
  onLoadSampleData: () => void;
}

export default function Sidebar({ onNewAnalysis, onLoadSampleData }: SidebarProps) {
  return (
    <div className="w-64 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="bg-blue-600/20 p-2 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
        </div>
        <span className="font-semibold text-lg tracking-wide text-slate-100">TalentLens AI</span>
      </div>

      <button 
        onClick={onNewAnalysis}
        className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium mb-6"
      >
        <Plus className="w-4 h-4" />
        New Analysis
      </button>

      <div className="flex-1 overflow-y-auto space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-4">
          Actions
        </div>
        
        <button 
          onClick={onLoadSampleData}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          Load Sample Data
        </button>

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-8">
          History
        </div>
        
        {/* Placeholder history items */}
        <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm truncate">
          <History className="w-4 h-4 opacity-50 flex-shrink-0" />
          <span className="truncate">Senior Frontend Engineer</span>
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm truncate">
          <History className="w-4 h-4 opacity-50 flex-shrink-0" />
          <span className="truncate">Product Manager</span>
        </button>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-auto">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
