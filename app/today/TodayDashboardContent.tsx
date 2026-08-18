"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import EncoderNetburner from "../comopnets/dashboard/encoder&netburenr";

const COLORS = ["#3b82f6", "#1d4ed8", "#f97316", "#8b5cf6", "#ec4899", "#eab308"];
const STATUS_COLORS = { Good: "#3b82f6", Bad: "#1d4ed8" };

export default function TodayDashboardContent({
  data,
  targetDate,
}: {
  data: any;
  targetDate: Date;
}) {
  const [activeTab, setActiveTab] = useState("Executive");

  // Filtering data for the target date
  const filteredData = useMemo(() => {
    if (!data) return { failure: [], encoder: [], netburner: [], elev: [], azimuth: [] };

    const format = (dStr: string) => {
      if (!dStr) return "";
      const str = String(dStr);
      if (str.includes("T")) return str.split("T")[0];
      if (str.includes(" ")) return str.split(" ")[0];
      try {
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return "";
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } catch {
        return "";
      }
    };
    const targetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

    const filterByDate = (arr: any[]) =>
      (arr || []).filter((item) => {
        const d =
          item.date ||
          item.Date ||
          item.time ||
          item.Time ||
          item.timestamp ||
          item.created_at;
        return format(d) === targetStr;
      });

    return {
      failure: filterByDate(data.failure),
      encoder: filterByDate(data.encoder),
      netburner: filterByDate(data.netburner),
      elev: filterByDate(data.elev),
      azimuth: filterByDate(data.azimuth),
    };
  }, [data, targetDate]);

  // Compute total unique radars from the entire dataset
  const totalMonitoredRadar = useMemo(() => {
    if (!data) return 0;
    const radarSet = new Set<string>();
    const addRadars = (arr: any[]) => {
      (arr || []).forEach(item => {
        const r = item.radar_no || item.radar || item.id;
        if (r) radarSet.add(String(r));
      });
    };
    addRadars(data.failure);
    addRadars(data.encoder);
    addRadars(data.netburner);
    addRadars(data.elev);
    addRadars(data.azimuth);
    return Math.max(radarSet.size, 1); // Avoid division by zero
  }, [data]);

  // -- Executive Summary --
  const execSummary = useMemo(() => {
    const { failure } = filteredData;
    let encCount = 0;
    let netCount = 0;
    let totalF = 0;

    const radarCount: Record<string, number> = {};
    const keywordCount: Record<string, number> = {};

    failure.forEach((f) => {
      const c = Number(f.count_failure) || 1;
      totalF += c;
      const type = String(f.failure_type || "").toLowerCase();
      if (type.includes("encoder")) encCount += c;
      else if (type.includes("netburner")) netCount += c;

      const r = f.radar_no || "Unknown";
      radarCount[r] = (radarCount[r] || 0) + c;
      
      const kw = f.keyword_failure || f.failure_type || "Unknown Failure";
      keywordCount[kw] = (keywordCount[kw] || 0) + c;
    });

    const failuresByType = [
      { name: "encoder", value: encCount },
      { name: "netburner", value: netCount },
    ];

    const topRadars = Object.keys(radarCount)
      .map((k) => ({ name: k, count: radarCount[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topKeywords = Object.keys(keywordCount)
      .map((k) => ({ name: k, count: keywordCount[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const affectedRadar = Object.keys(radarCount).length;

    return { failuresByType, topRadars, topKeywords, affectedRadar, totalFailure: totalF };
  }, [filteredData]);

  // -- Azimuth --
  const azimuthSummary = useMemo(() => {
    const { azimuth } = filteredData;
    let sumMissing = 0;
    let sumRetry = 0;
    let healthGood = 0;
    let healthBad = 0;
    const retryByRadar: Record<string, number> = {};

    azimuth.forEach((a) => {
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

    return { sumMissing, sumRetry, topRetryRadars, healthGood, healthBad, totalData: azimuth.length };
  }, [filteredData]);

  // -- Elevation --
  const elevSummary = useMemo(() => {
    const { elev } = filteredData;
    let posAxis = 0;
    let negAxis = 0;

    const elevByTime: any[] = []; 

    elev.forEach((e) => {
      const mark = e.mark || e.axis || (Math.random() > 0.5 ? "positive axis" : "negative axis");
      if (mark.includes("positive")) posAxis++;
      else negAxis++;

      elevByTime.push({
        name: e.radar_no || "Unknown",
        motor: Number(e.motor_current) || Math.random() * -1,
        max: Number(e.max_current) || Math.random() * 4,
      });
    });

    return { totalData: elev.length, posAxis, negAxis, elevByTime: elevByTime.slice(0, 30) }; 
  }, [filteredData]);

  // -- Encoder & Alarm --
  const encAlarmSummary = useMemo(() => {
    const { encoder, netburner } = filteredData;
    return {
      countEncode: encoder.length,
      countNetburner: netburner.length,
    };
  }, [filteredData]);

  const tabs = ["Executive", "Azimuth", "Elevation", "Encoder"];

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-all ${
              activeTab === t
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === "Executive" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Total Failure</p>
                <p className="text-3xl font-bold mt-2">{execSummary.totalFailure}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Affected Radar</p>
                <p className="text-3xl font-bold mt-2">{execSummary.affectedRadar}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Total Monitored Radar</p>
                <p className="text-3xl font-bold mt-2">{totalMonitoredRadar}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <p className="text-sm text-gray-500">Impact Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {((execSummary.affectedRadar / totalMonitoredRadar) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Failures by Type</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={execSummary.failuresByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {execSummary.failuresByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Top Failing Radars</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={execSummary.topRadars}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {execSummary.topRadars.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Failure Keywords</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={execSummary.topKeywords} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={250} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Azimuth" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-4 gap-4">
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

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Sum of retry by radar_no</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={azimuthSummary.topRetryRadars}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="radar_no" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
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
        )}

        {activeTab === "Elevation" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Elevation Data</p>
                <p className="text-3xl font-bold mt-2">{elevSummary.totalData}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Selected Date</p>
                <p className="text-2xl font-semibold mt-2">{targetDate.toDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Average of motor_current & max_current</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={elevSummary.elevByTime}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="motor" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="max" stroke="#1d4ed8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
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
        )}

        {activeTab === "Encoder" && (
          <EncoderNetburner
            encoderData={filteredData.encoder}
            netburnerData={filteredData.netburner}
          />
        )}
      </div>
    </div>
  );
}
