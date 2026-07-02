'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ScoreBreakdownChartProps {
  semanticScore: number;
  attributeScore: number;
  signalScore: number;
}

export default function ScoreBreakdownChart({ semanticScore, attributeScore, signalScore }: ScoreBreakdownChartProps) {
  const data = [
    { name: 'Semantic', score: semanticScore, fill: '#3b82f6' }, // blue-500
    { name: 'Attribute', score: attributeScore, fill: '#8b5cf6' }, // violet-500
    { name: 'Signal', score: signalScore, fill: '#06b6d4' }, // cyan-500
  ];

  return (
    <div className="w-full h-32 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} width={70} />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
