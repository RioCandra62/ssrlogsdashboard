"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Radio, AlertTriangle, Activity, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

// Mock Data
const failureTypeData = [
  { name: "Encoder", value: 49.71, color: "#3b82f6" },
  { name: "Netburner", value: 50.29, color: "#ef4444" },
];

const topFailingRadars = [
  { radar_no: "ssr976", failures: 34 },
  { radar_no: "ssr365", failures: 28 },
  { radar_no: "ssr650", failures: 22 },
  { radar_no: "ssr102", failures: 19 },
  { radar_no: "ssr441", failures: 15 },
  { radar_no: "ssr812", failures: 14 },
  { radar_no: "ssr520", failures: 11 },
];

const failureKeywords = [
  { keyword: "Motor Controller Communication Timeout", count: 42, severity: "High", category: "Hardware" },
  { keyword: "Scan line wasn't complete within frame", count: 38, severity: "Medium", category: "Data Sync" },
  { keyword: "Encoder position reset unexpected", count: 27, severity: "High", category: "Sensor" },
  { keyword: "Netburner ethernet socket dropped", count: 21, severity: "High", category: "Network" },
  { keyword: "Azimuth drift out of safety tolerance", count: 15, severity: "Low", category: "Calibration" },
];

export default function ExecutiveSummary() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Monitored Radar</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">700</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Radio className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Operational Base Online</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Affected Radar</p>
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">109</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>15.57% of total fleet affected</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Failure Logs</p>
              <h3 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">143</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Requires technician audit</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Failures by Type - Donut Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Failures by Type</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribution between Encoder and Netburner issues</p>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(2)}%`}
                >
                  {failureTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, "Share"]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Failing Radars - Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Top Failing Radars</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Radars sorted by highest failure incidence count</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFailingRadars} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="radar_no" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                />
                <Bar dataKey="failures" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Failures" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure Keywords Table/List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Failure Keywords & Log Patterns</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-semibold">Error Log Pattern Keyword</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold text-right">Occurrence Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {failureKeywords.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{item.keyword}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.severity === "High"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                          : item.severity === "Medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-slate-100 text-right">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
