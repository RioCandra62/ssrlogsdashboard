"use client";

import React, { useState } from "react";
import ExecutiveSummary from "@/components/dashboard/executive-summary";
import Azimuth from "@/components/dashboard/azimuth";
import ElevationCurrent from "@/components/dashboard/elevation-current";
import EncoderAlarm from "@/components/dashboard/encoder-alarm";
import { LayoutDashboard, Radar, Compass, Cpu, Layers } from "lucide-react";

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<string>("executive-summary");

  const tabs = [
    {
      id: "executive-summary",
      label: "Executive Summary",
      icon: LayoutDashboard,
      badge: "Overview",
      color: "blue",
    },
    {
      id: "azimuth",
      label: "SSR Control Logs Azimuth",
      icon: Radar,
      badge: "Azimuth",
      color: "amber",
    },
    {
      id: "elevation-current",
      label: "SSR Control Logs Elevation Current",
      icon: Compass,
      badge: "Elevation",
      color: "cyan",
    },
    {
      id: "encoder-alarm",
      label: "SSR Control Logs Encoder & Alarm",
      icon: Cpu,
      badge: "Hardware Alarms",
      color: "rose",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" /> PowerBI Radar Diagnostics
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Radar Control Logs Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive analytics, failure logs, and hardware telemetry monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Live Telemetry Connected
            </span>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  <span
                    className={`ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider flex-shrink-0 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="mt-6">
          {activeTab === "executive-summary" && <ExecutiveSummary />}
          {activeTab === "azimuth" && <Azimuth />}
          {activeTab === "elevation-current" && <ElevationCurrent />}
          {activeTab === "encoder-alarm" && <EncoderAlarm />}
        </div>
      </div>
    </div>
  );
}
