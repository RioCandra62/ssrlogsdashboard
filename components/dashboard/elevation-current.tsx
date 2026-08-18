"use client";

import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Zap, Gauge, Compass } from "lucide-react";

// Mock Data
const motorCurrentTrend = [
  { date: "Aug 01", avg_motor_current: -0.92, avg_max_current: -0.87 },
  { date: "Aug 02", avg_motor_current: -0.94, avg_max_current: -0.89 },
  { date: "Aug 03", avg_motor_current: -0.91, avg_max_current: -0.86 },
  { date: "Aug 04", avg_motor_current: -0.96, avg_max_current: -0.90 },
  { date: "Aug 05", avg_motor_current: -0.95, avg_max_current: -0.88 },
  { date: "Aug 06", avg_motor_current: -0.93, avg_max_current: -0.85 },
  { date: "Aug 07", avg_motor_current: -0.97, avg_max_current: -0.91 },
  { date: "Aug 08", avg_motor_current: -0.99, avg_max_current: -0.93 },
  { date: "Aug 09", avg_motor_current: -0.92, avg_max_current: -0.86 },
  { date: "Aug 10", avg_motor_current: -0.90, avg_max_current: -0.85 },
];

const axisMarkData = [
  { name: "Positive_mark (+)", value: 83.2, color: "#0ea5e9" },
  { name: "Negative_mark (-)", value: 16.8, color: "#6366f1" },
];

export default function ElevationCurrent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Elevation Data</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">411.874K</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Processed current telemetry points</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Motor Current</p>
              <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">-0.94 A</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">Nominal Operating Range</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Max Current</p>
              <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">-0.88 A</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium">Peak Envelope Metric</p>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Line Chart: Average of motor_current vs Average of max_current by date */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Average of motor_current vs Average of max_current by Date
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overlapping trendlines comparing baseline current vs maximum peak currents (-1.00 to -0.85)
            </p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={motorCurrentTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis domain={[-1.0, -0.8]} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                  formatter={(val: any) => [`${val} A`, "Current"]}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="avg_motor_current"
                  name="Avg Motor Current"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_max_current"
                  name="Avg Max Current"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Positive_mark and Negative_mark Donut Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Positive_mark & Negative_mark</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Elevation direction movement axis distribution
            </p>
          </div>
          <div className="h-[320px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={axisMarkData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {axisMarkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, "Share"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
