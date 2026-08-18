"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS = { Good: "#3b82f6", Bad: "#1d4ed8" };

export default function Azimuth({ data = [] }: { data?: any[] }) {
  const azimuthSummary = useMemo(() => {
    let sumMissing = 0;
    let sumRetry = 0;
    let healthGood = 0;
    let healthBad = 0;
    const retryByRadar: Record<string, number> = {};

    (data || []).forEach((a) => {
      const missing = Number(a.missing_image) || 0;
      const retry = Number(a.retry) || 0;
      sumMissing += missing;
      sumRetry += retry;
      const r = a.radar_no || "Unknown";
      retryByRadar[r] = (retryByRadar[r] || 0) + retry;

      const health = a.health_check || "Good";
      if (health === "Good") healthGood++;
      else healthBad++;
    });

    const topRetryRadars = Object.keys(retryByRadar)
      .map((k) => ({ radar_no: k, count: retryByRadar[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      sumMissing,
      sumRetry,
      topRetryRadars,
      healthGood,
      healthBad,
      totalData: data.length,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Total Data</p>
          <p className="text-3xl font-bold mt-2">{azimuthSummary.totalData}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Sum of missing_image</p>
          <p className="text-3xl font-bold mt-2">{azimuthSummary.sumMissing}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Sum of retry</p>
          <p className="text-3xl font-bold mt-2">{azimuthSummary.sumRetry}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm text-gray-500">Average of retry %</p>
          <p className="text-3xl font-bold mt-2">
            {azimuthSummary.totalData > 0
              ? (azimuthSummary.sumRetry / azimuthSummary.totalData).toFixed(2)
              : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Sum of retry by radar_no</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={azimuthSummary.topRetryRadars}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="radar_no" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Count of health_check</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Good", value: azimuthSummary.healthGood },
                    { name: "Bad", value: azimuthSummary.healthBad },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  dataKey="value"
                >
                  <Cell fill={STATUS_COLORS.Good} />
                  <Cell fill={STATUS_COLORS.Bad} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}