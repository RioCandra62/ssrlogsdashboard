"use client";

import React from "react";
import {
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
import { Cpu, Network, Bell, ShieldAlert } from "lucide-react";

// Mock Data for 30 Days Stacked Bar Chart
const dailyCounts = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const encodeCount = Math.floor(10 + Math.sin(day) * 8 + (day % 3) * 4 + Math.random() * 4);
  const netburnerCount = Math.floor(12 + Math.cos(day) * 7 + (day % 4) * 3 + Math.random() * 5);
  return {
    day: `Day ${day}`,
    encodeID: encodeCount,
    netburnerID: netburnerCount,
  };
});

const summaryDistribution = [
  { summary: "Encoder Hardware Error", value: 38.5, color: "#3b82f6" },
  { summary: "Netburner Connection Lost", value: 31.2, color: "#ef4444" },
  { summary: "Buffer Overflow Warning", value: 16.4, color: "#f59e0b" },
  { summary: "Power Supply Voltage Drop", value: 13.9, color: "#10b981" },
];

export default function EncoderAlarm() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Count of encodeID</p>
              <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">464</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">Encoder component events</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Count of netburnerID</p>
              <h3 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">476</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <Network className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-medium">Netburner interface events</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Alarm Logs</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">940</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Bell className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">Combined hardware alarms</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Warning State</p>
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">Elevated</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">High incidence window</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stacked Bar Chart: Count of encodeID and Count of netburnerID by Day */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Count of encodeID and Count of netburnerID by Day
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              30-Day stacked count comparison of Encoder events vs Netburner events
            </p>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCounts} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} interval={1} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="encodeID" name="Encoder ID Count" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="netburnerID" name="Netburner ID Count" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Count of date by summary */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Count of Date by Summary</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorical percentage breakdown of hardware alarm messages
            </p>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry: any) => `${entry.summary || entry.name}: ${entry.value}%`}
                >
                  {summaryDistribution.map((entry, index) => (
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
