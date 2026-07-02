import { Search } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/30">
      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <Search className="w-10 h-10 text-gray-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-200 mb-2">Ready to find top talent</h3>
      <p className="text-gray-500 max-w-md">
        Add your job description and candidate profiles above, then click &quot;Rank Candidates&quot; to see the AI-powered analysis.
      </p>
    </div>
  );
}
