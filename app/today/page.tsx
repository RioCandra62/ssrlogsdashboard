"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SystemData } from "../comopnets/DashboardClient";
import TodayDashboardContent from "./TodayDashboardContent";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TodayActivityPage() {
  const [date, setDate] = useState<string>("");
  const [isToday, setIsToday] = useState<boolean>(true);
  
  const [earliestDate, setEarliestDate] = useState<string>("-");
  const [lastDateStr, setLastDateStr] = useState<string>("-");
  const [totalDays, setTotalDays] = useState<number>(0);
  const [rawTargetDate, setRawTargetDate] = useState<Date>(new Date());

  // Executive Summary States
  const [totalIssues, setTotalIssues] = useState(0);
  const [criticalFailures, setCriticalFailures] = useState(0);

  const [worstRadar, setWorstRadar] = useState("-");
  const [worstRadarEncoder, setWorstRadarEncoder] = useState(0);
  const [worstRadarNetburner, setWorstRadarNetburner] = useState(0);
  const [mostCommonError, setMostCommonError] = useState("-");
  const [aiWarning, setAiWarning] = useState<boolean>(false);

  const { data, isLoading, isError } = useQuery<SystemData>({
    queryKey: ['dashboardData'],
    queryFn: () => fetcher('http://127.0.0.1:8000'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    let targetDate = new Date(); 

    if (data) {
      const allRecords = [
        ...(data.failure || []),
        ...(data.encoder || []),
        ...(data.netburner || []),
        ...(data.elev || []),
        ...(data.azimuth || [])
      ];

      let maxDate = new Date(0);
      let minDate = new Date(8640000000000000); // max date in js
      let foundDate = false;

      allRecords.forEach(record => {
        const dateVal = record.date || record.Date || record.time || record.Time || record.timestamp || record.Timestamp || record.created_at;
        if (dateVal) {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
            if (d > maxDate) maxDate = d;
            if (d < minDate) minDate = d;
            foundDate = true;
          }
        }
      });

      const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      if (foundDate) {
        targetDate = maxDate;
        setRawTargetDate(maxDate);
        setEarliestDate(formatDate(minDate));
        setLastDateStr(formatDate(maxDate));
        
        // Hitung total days
        const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        setTotalDays(diffDays);
      } else {
        setRawTargetDate(new Date());
        setEarliestDate("-");
        setLastDateStr("-");
        setTotalDays(0);
      }

      // --- EXECUTIVE SUMMARY CALCULATION ---
      let totalF = 0;
      let totalE = 0;
      let totalN = 0;
      let totalEl = 0;
      let totalAz = 0;

      const radarCounts: Record<string, { total: number, failure: number, encoder: number, netburner: number }> = {};

      const processCat = (items: any[], type: string) => {
        if (!items) return;
        items.forEach(item => {
          const r = item.radar_no || item.radar || item.id || 'Unknown';
          if (!radarCounts[r]) radarCounts[r] = { total: 0, failure: 0, encoder: 0, netburner: 0 };
          radarCounts[r].total++;
          if (type === 'failure') { radarCounts[r].failure++; totalF++; }
          if (type === 'encoder') { radarCounts[r].encoder++; totalE++; }
          if (type === 'netburner') { radarCounts[r].netburner++; totalN++; }
          if (type === 'elev') totalEl++;
          if (type === 'azimuth') totalAz++;
        });
      };

      processCat(data.failure, 'failure');
      processCat(data.encoder, 'encoder');
      processCat(data.netburner, 'netburner');
      processCat(data.elev, 'elev');
      processCat(data.azimuth, 'azimuth');

      const issuesCount = totalF + totalE + totalN + totalEl + totalAz;
      setTotalIssues(issuesCount);
      setCriticalFailures(totalF);

      // Find worst radar
      let maxTotal = -1;
      let wRadar = "-";
      let wEnc = 0;
      let wNet = 0;
      Object.entries(radarCounts).forEach(([r, counts]) => {
        if (counts.total > maxTotal) {
          maxTotal = counts.total;
          wRadar = r;
          wEnc = counts.encoder;
          wNet = counts.netburner;
        }
      });
      setWorstRadar(wRadar);
      setWorstRadarEncoder(wEnc);
      setWorstRadarNetburner(wNet);

      // Most common error
      const errTypes = [
        { name: "Failures", count: totalF },
        { name: "Encoder", count: totalE },
        { name: "Netburner", count: totalN },
        { name: "Elevation", count: totalEl },
        { name: "Azimuth", count: totalAz },
      ];
      errTypes.sort((a, b) => b.count - a.count);
      setMostCommonError(errTypes[0].count > 0 ? errTypes[0].name : "-");
    }

    const fallbackFormatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setDate(fallbackFormatDate(targetDate));

    // Cek apakah targetDate adalah hari ini
    const today = new Date();
    setIsToday(
      targetDate.getDate() === today.getDate() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getFullYear() === today.getFullYear()
    );
  }, [data]);

  // AI Prediction API call for Warning state
  useEffect(() => {
    if (criticalFailures > 0) {
      setAiWarning(false); // Critical status overrides warning
      return;
    }
    
    if (worstRadar !== "-" && (worstRadarEncoder > 0 || worstRadarNetburner > 0)) {
      fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count_encoder: worstRadarEncoder,
          count_netburner: worstRadarNetburner
        })
      })
      .then(res => res.json())
      .then(resData => {
        if (resData.prediksi_status && resData.prediksi_status.includes("BAHAYA")) {
          setAiWarning(true);
        } else {
          setAiWarning(false);
        }
      })
      .catch(err => {
        console.error("Failed to fetch ML prediction", err);
        setAiWarning(false);
      });
    } else {
      setAiWarning(false);
    }
  }, [criticalFailures, worstRadar, worstRadarEncoder, worstRadarNetburner]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row w-full justify-between pb-4">
        <p className="text-3xl font-semibold">
          {isLoading ? "Loading..." : (isToday ? "Today Activity" : `${date} Activity`)}
        </p>
        <p className="text-lg text-slate-500">{date}</p>
      </div>

      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Failed To Connect To Database
        </div>
      )}

      {!isLoading && data && !isError && (
        <TodayDashboardContent data={data} targetDate={rawTargetDate} />
      )}
    </div>
  );
}
