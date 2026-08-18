'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface RadarDataCount {
  radar_no: string;
  failure: number;
  encoder: number;
  netburner: number;
  elev: number;
  azimuth: number;
  total: number;
}

const DATA_TYPES = [
  { key: 'failure', label: 'Failures', color: '#f43f5e' },
  { key: 'encoder', label: 'Encoder', color: '#3b82f6' },
  { key: 'netburner', label: 'Netburner', color: '#10b981' },
  { key: 'elev', label: 'Elevation', color: '#8b5cf6' },
  { key: 'azimuth', label: 'Azimuth', color: '#f59e0b' },
];

export default function RadarBarChart({ data }: { data: RadarDataCount[] }) {
  const [activeBars, setActiveBars] = useState<Record<string, boolean>>({
    failure: true,
    encoder: true,
    netburner: true,
    elev: true,
    azimuth: true
  });

  const toggleBar = (key: string) => {
    setActiveBars(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No radar data available</p>
      </div>
    );
  }

  // Get Top 10 Radars
  const top10Data = data.slice(0, 10);

  return (
    <div className="w-full flex flex-col">
      {/* Custom Legend / Filter Toggles */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DATA_TYPES.map((type) => {
          const isActive = activeBars[type.key];
          return (
            <button
              key={type.key}
              onClick={() => toggleBar(type.key)}
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

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top10Data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="radar_no" 
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
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            {DATA_TYPES.map((type) => (
              activeBars[type.key] && (
                <Bar 
                  key={type.key}
                  dataKey={type.key} 
                  name={type.label} 
                  fill={type.color} 
                  stackId="a" 
                  radius={[2, 2, 0, 0]} 
                />
              )
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
