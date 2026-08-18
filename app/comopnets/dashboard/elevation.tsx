"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Elevation({ data = [] }: { data?: any[] }) {
  const elevSummary = useMemo(() => {
    let posAxis = 0;
    let negAxis = 0;
    const radarAgg: Record<string, { count: number; motorSum: number; maxSum: number }> = {};

    (data || []).forEach((e) => {
      const mark = String(e.mark || e.axis || "").toLowerCase();
      if (mark.includes("positive")) posAxis++;
      else if (mark.includes("negative")) negAxis++;

      const r = e.radar_no || e.radar || "Unknown";
      if (!radarAgg[r]) {
        radarAgg[r] = { count: 0, motorSum: 0, maxSum: 0 };
      }
      radarAgg[r].count += 1;
      radarAgg[r].motorSum += Number(e.motor_current) || 0;
      radarAgg[r].maxSum += Number(e.max_current) || 0;
    });

    // Agregasi Rata-rata per Radar (Semua data dihitung secara presisi)
    const elevByRadar = Object.keys(radarAgg)
      .map((r) => ({
        name: r,
        motor: Number((radarAgg[r].motorSum / radarAgg[r].count).toFixed(3)),
        max: Number((radarAgg[r].maxSum / radarAgg[r].count).toFixed(3)),
        count: radarAgg[r].count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30); // 30 Radar teratas berdasarkan volume data

    return {
      totalData: data.length,
      posAxis,
      negAxis,
      elevByRadar,
    };
  }, [data]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Elevation Data</p>
          <p className="text-3xl font-bold mt-2">{elevSummary.totalData.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Scope</p>
          <p className="text-2xl font-semibold mt-2">All Aggregated Data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Average of motor_current & max_current per Radar
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elevSummary.elevByRadar}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="motor" name="Avg Motor Current" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="max" name="Avg Max Current" stroke="#1d4ed8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Positive vs Negative Mark</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Positive Axis", value: elevSummary.posAxis },
                    { name: "Negative Axis", value: elevSummary.negAxis },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={90}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#1d4ed8" />
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