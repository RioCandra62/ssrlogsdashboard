"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { Database, ImageOff, RefreshCw, Activity } from "lucide-react";

// Mock Data
const missingImageTrend = [
  { date: "Aug 01", missing_image: 18 },
  { date: "Aug 02", missing_image: 25 },
  { date: "Aug 03", missing_image: 12 },
  { date: "Aug 04", missing_image: 85 }, // Spike
  { date: "Aug 05", missing_image: 42 },
  { date: "Aug 06", missing_image: 29 },
  { date: "Aug 07", missing_image: 110 }, // Spike
  { date: "Aug 08", missing_image: 68 },
  { date: "Aug 09", missing_image: 45 },
  { date: "Aug 10", missing_image: 92 },
  { date: "Aug 11", missing_image: 38 },
  { date: "Aug 12", missing_image: 40 },
];

const retryByRadar = [
  { radar_no: "ssr976", retry: 6420 },
  { radar_no: "ssr365", retry: 5210 },
  { radar_no: "ssr650", retry: 4890 },
  { radar_no: "ssr102", retry: 4150 },
  { radar_no: "ssr441", retry: 3800 },
  { radar_no: "ssr812", retry: 3100 },
  { radar_no: "ssr520", retry: 2500 },
];

const healthCheckData = [
  { name: "Good", value: 29.07, color: "#10b981" },
  { name: "Bad", value: 70.93, color: "#f43f5e" },
];

export default function Azimuth() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Data</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">2.174K</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Recorded log frames</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sum of missing_image</p>
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">604</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ImageOff className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">Dropped camera frames</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sum of retry</p>
              <h3 className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">32K</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">Attempted retries</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average of retry%</p>
              <h3 className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">25.41%</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 font-medium">Above expected threshold</p>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sum of missing_image by date - Line Chart */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sum of missing_image by Date</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily trend showing image drop spikes across all active radars</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={missingImageTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="missing_image"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#f59e0b" }}
                  activeDot={{ r: 6 }}
                  name="Missing Images"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sum of retry by radar_no - Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sum of retry by radar_no</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Radar ranking based on total retry command counts</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retryByRadar} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="radar_no" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                />
                <Bar dataKey="retry" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Retries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Check Status - Pie Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">health_check Status</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ratio of Good vs Bad health checks in azimuth logs</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthCheckData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {healthCheckData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, "Percentage"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
