'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  date: string;
  failure: number;
  encoder: number;
  netburner: number;
  elev: number;
  azimuth: number;
}

const DATA_TYPES = [
  { key: 'failure', label: 'Failures', color: '#f43f5e' },
  { key: 'encoder', label: 'Encoder', color: '#3b82f6' },
  { key: 'netburner', label: 'Netburner', color: '#10b981' },
  { key: 'elev', label: 'Elevation', color: '#8b5cf6' },
  { key: 'azimuth', label: 'Azimuth', color: '#f59e0b' },
];

export default function DataChart({ data }: { data: ChartData[] }) {
  // By default, showing Failures and Encoder data only to reduce clutter
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({
    failure: true,
    encoder: true,
    netburner: false,
    elev: false,
    azimuth: false
  });

  const toggleLine = (key: string) => {
    setActiveLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!data || data.length === 0 || (data.length === 1 && data[0].date === 'Unknown Date')) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No valid date field found in data</p>
        <p className="text-xs mt-1">Please ensure your data contains a 'time', 'date', or 'timestamp' field.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Custom Legend / Filter Toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DATA_TYPES.map((type) => {
          const isActive = activeLines[type.key];
          return (
            <button
              key={type.key}
              onClick={() => toggleLine(type.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 border ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm' 
                  : 'bg-transparent text-slate-400 dark:text-slate-500 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <span 
                className="w-2.5 h-2.5 rounded-full transition-colors" 
                style={{ 
                  backgroundColor: isActive ? type.color : 'transparent', 
                  border: `2px solid ${type.color}`,
                  opacity: isActive ? 1 : 0.5
                }}
              />
              {type.label}
            </button>
          );
        })}
      </div>
      
      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem', padding: '10px 14px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#f8fafc', padding: '2px 0' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            
            {DATA_TYPES.map((type) => (
              activeLines[type.key] && (
                <Line 
                  key={type.key}
                  type="monotone" 
                  name={type.label} 
                  dataKey={type.key} 
                  stroke={type.color} 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={300}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
