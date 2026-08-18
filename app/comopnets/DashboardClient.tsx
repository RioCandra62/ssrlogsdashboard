"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataChart from "./DataChart";
import RadarBarChart from "./RadarBarChart";
import Azimuth from "./dashboard/azimuth";
import Elevation from "./dashboard/elevation";
import EncoderNetburner from "./dashboard/encoder&netburenr";

export interface SystemData {
  failure: any[];
  encoder: any[];
  netburner: any[];
  elev: any[];
  azimuth: any[];
}

function processDailyData(data: SystemData | null) {
  if (!data) return [];
  const dailyCounts: Record<string, any> = {};

  const extractDate = (record: any) => {
    const dateVal =
      record.date ||
      record.Date ||
      record.time ||
      record.Time ||
      record.timestamp ||
      record.Timestamp ||
      record.created_at;
    if (!dateVal) return "Unknown Date";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime()))
        return String(dateVal).split(" ")[0] || "Unknown Date";
      return d.toISOString().split("T")[0];
    } catch {
      return String(dateVal).split(" ")[0] || "Unknown Date";
    }
  };

  const processCategory = (items: any[], categoryName: string) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      const d = extractDate(item);
      if (!dailyCounts[d]) {
        dailyCounts[d] = {
          date: d,
          failure: 0,
          encoder: 0,
          netburner: 0,
          elev: 0,
          azimuth: 0,
        };
      }
      dailyCounts[d][categoryName]++;
    });
  };

  processCategory(data.failure, "failure");
  processCategory(data.encoder, "encoder");
  processCategory(data.netburner, "netburner");
  processCategory(data.elev, "elev");
  processCategory(data.azimuth, "azimuth");

  return Object.values(dailyCounts).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function processRadarData(data: SystemData | null) {
  if (!data) return [];
  const radarCounts: Record<string, any> = {};

  const processCategory = (items: any[], categoryName: string) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      const r = item.radar_no || item.radar || item.id || "Unknown";
      if (!radarCounts[r]) {
        radarCounts[r] = {
          radar_no: String(r),
          failure: 0,
          encoder: 0,
          netburner: 0,
          elev: 0,
          azimuth: 0,
          total: 0,
        };
      }
      radarCounts[r][categoryName]++;
      radarCounts[r].total++;
    });
  };

  processCategory(data.failure, "failure");
  processCategory(data.encoder, "encoder");
  processCategory(data.netburner, "netburner");
  processCategory(data.elev, "elev");
  processCategory(data.azimuth, "azimuth");

  return Object.values(radarCounts).sort((a, b) => b.total - a.total);
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardClient({
  fallbackData,
}: {
  fallbackData: SystemData;
}) {
  const [activeTab2, setActiveTab2] = useState("Azimuth");

  const tabs2 = ["Azimuth", "Elevation", "Encoder & Netburner"];



  const { data, isError, isLoading } = useQuery<SystemData>({
    queryKey: ["dashboardData"],
    queryFn: () => fetcher("http://127.0.0.1:8000"),
    // initialData: fallbackData,

    // --- PERBAIKAN CACHING ---
    staleTime: 5 * 60 * 1000, // Data dianggap "segar" selama 5 menit, pindah page gak akan loading ulang!
    gcTime: 10 * 60 * 1000, // Data disimpan di memori (cache) selama 10 menit

    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const activeData = data || fallbackData;
  const chartData = useMemo(() => processDailyData(activeData), [activeData]);
  const radarChartData = useMemo(
    () => processRadarData(activeData),
    [activeData],
  );

  const failures = useMemo(() => activeData?.failure || [], [activeData]);
  const encoders = useMemo(() => activeData?.encoder || [], [activeData]);
  const netburners = useMemo(() => activeData?.netburner || [], [activeData]);
  const elevs = useMemo(() => activeData?.elev || [], [activeData]);
  const azimuths = useMemo(() => activeData?.azimuth || [], [activeData]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg
            className="animate-spin h-8 w-8 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="font-medium animate-pulse">
            Loading Dashboard Data... (Backend might take a while)
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-6 rounded-2xl border border-rose-200 dark:border-rose-800/30 flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="font-semibold text-lg">Failed To Connect To Database</p>
          <p className="text-sm opacity-80">
            Please ensure the backend is running and the database/radar is reachable.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Failures",
      value: failures.length.toLocaleString(),
      trend: "Total records",
      isPositive: failures.length === 0,
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      title: "Encoder Data",
      value: encoders.length.toLocaleString(),
      trend: "Total records",
      isPositive: true,
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    },
    {
      title: "Netburner Data",
      value: netburners.length.toLocaleString(),
      trend: "Total records",
      isPositive: true,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "Elevation Data",
      value: elevs.length.toLocaleString(),
      trend: "Total records",
      isPositive: true,
      icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
    },
  ];

  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Performance
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your radar systems today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm">
            Export Data
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Scan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </p>
              <div
                className={`p-2.5 rounded-xl ${stat.iconBg || "bg-indigo-50 dark:bg-indigo-500/10"} ${stat.iconColor || "text-indigo-600 dark:text-indigo-400"} transition-transform group-hover:scale-110`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={stat.icon}
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md ${stat.isPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" : "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10"}`}
                >
                  {stat.isPositive ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  from API
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Activity Overview
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Scans over the last 30 days
              </p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 w-full h-[300px] mt-4">
            <DataChart data={chartData} />
          </div>
        </div>

        {/* Side Panel Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Alerts
            </h3>
            <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
              View All
            </button>
          </div>
          <div className="space-y-5">
            {failures.length > 0 ? (
              failures.slice(0, 5).map((f: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      Failure Recorded
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {JSON.stringify(f).substring(0, 60)}...
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-4">
                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    System Normal
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    No recent failures detected.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button className="w-full mt-8 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
            View System Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[60vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Number of Fault Radar
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Scans over the last 30 days
            </p>
          </div>
          <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="flex-1 w-full h-[40vh] mt-4">
          <RadarBarChart data={radarChartData} />
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-2xl p-6 shadow-md gap-6">
        <div className="flex flex-col">
          <p className="text-xl font-semibold">Failure Type</p>
          <p>Failure type preview data</p>
        </div>

        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
          {tabs2.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab2(t)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-all ${
                activeTab2 === t
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab2 === "Azimuth" && <Azimuth data={azimuths} />}

          {activeTab2 === "Elevation" && <Elevation data={elevs} />}

          {activeTab2 === "Encoder & Netburner" && (
            <EncoderNetburner
              encoderData={encoders}
              netburnerData={netburners}
            />
          )}
        </div>
      </div>
    </div>
  );
}
