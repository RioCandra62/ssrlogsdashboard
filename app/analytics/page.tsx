"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { ResponsiveSankey } from "@nivo/sankey";

export default function AnalyticsPage() {
  const [kmeans, setKmeans] = useState<any[]>([]);
  const [mtbf, setMtbf] = useState<any[]>([]);
  const [markov, setMarkov] = useState<any[]>([]);
  const [apriori, setApriori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resKmeans, resMtbf, resMarkov, resApriori] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/ml/kmeans")
            .then((res) => { if (!res.ok) throw new Error(); return res.json(); }),
          fetch("http://127.0.0.1:8000/api/ml/mtbf")
            .then((res) => { if (!res.ok) throw new Error(); return res.json(); }),
          fetch("http://127.0.0.1:8000/api/ml/markov")
            .then((res) => { if (!res.ok) throw new Error(); return res.json(); }),
          fetch("http://127.0.0.1:8000/api/ml/apriori")
            .then((res) => { if (!res.ok) throw new Error(); return res.json(); }),
        ]);
        setKmeans(resKmeans);
        if (resMtbf.status === "success") {
          setMtbf(resMtbf.data);
        }
        if (resMarkov.status === "success") {
          setMarkov(resMarkov.data);
        }
        if (resApriori.status === "success") {
          setApriori(resApriori.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare data for Scatter Chart
  const scatterData = useMemo(() => {
    const stabil: any[] = [];
    const encoder: any[] = [];
    const netburner: any[] = [];

    kmeans.forEach((k) => {
      const point = {
        radar_no: k.radar_no,
        x: Number(k.Total_Error_Encoder) || 0,
        y: Number(k.Total_Error_Netburner) || 0,
        category: k.Kategori_Kerusakan || "Unknown",
      };

      if (point.category.includes("Stabil")) stabil.push(point);
      else if (point.category.includes("Encoder")) encoder.push(point);
      else if (point.category.includes("Netburner")) netburner.push(point);
      else stabil.push(point); // fallback
    });

    return { stabil, encoder, netburner };
  }, [kmeans]);

  // Summary counts
  const summary = {
    stabil: scatterData.stabil.length,
    encoder: scatterData.encoder.length,
    netburner: scatterData.netburner.length,
    total: kmeans.length,
  };

  // MTBF Data prep
  const mtbfChartData = useMemo(() => {
    return mtbf.slice(0, 15).map((m) => ({
      name: `${m.radar_no} (${m.failure_type})`,
      mtbf_days: m.mtbf_days,
      radar_no: m.radar_no,
      failure_type: m.failure_type,
    }));
  }, [mtbf]);

  const top5Mtbf = useMemo(() => {
    return mtbf.slice(0, 5);
  }, [mtbf]);

  const getMtbfColor = (days: number) => {
    if (days <= 7) return "#ef4444"; // Red (Critical)
    if (days <= 14) return "#eab308"; // Yellow (Warning)
    return "#10b981"; // Green (Good)
  };

  // Sankey Data prep
  const sankeyData = useMemo(() => {
    if (!markov || markov.length === 0) return { nodes: [], links: [] };

    const nodesMap = new Map();
    const links: any[] = [];

    markov.forEach((m) => {
      const sourceId = m.failure_type;
      const targetId = m.next_failure + " "; // Add space to prevent circular link errors in Sankey

      nodesMap.set(sourceId, true);
      nodesMap.set(targetId, true);

      links.push({
        source: sourceId,
        target: targetId,
        value: m.probability_percent,
      });
    });

    const nodes = Array.from(nodesMap.keys()).map((id) => {
      const cleanId = id.trim();
      return {
        id,
        cleanId, // Custom property for display if needed
        nodeColor:
          cleanId === "netburner"
            ? "#a855f7"
            : cleanId === "encoder"
              ? "#f97316"
              : "#3b82f6",
      };
    });

    return { nodes, links };
  }, [markov]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {data.radar_no}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Encoder Errors:{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {data.x}
            </span>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Netburner Errors:{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {data.y}
            </span>
          </p>
          <p className="text-xs mt-2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 font-medium inline-block">
            {data.category}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
          Data Analytics
        </h1>
        <p className="text-gray-500 mt-2">
          Visualisasi K-Means Clustering untuk deteksi pola kerusakan radar.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Failed To Connect To Database
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : !error ? (
        <div className="flex flex-col gap-8">
          {/* Scatter Plot Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Segmentasi Radar (K-Means Clustering)
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Penyebaran radar berdasarkan tingkat error Encoder (Sumbu X) dan
                Netburner (Sumbu Y).
              </p>
            </div>

            <div className="p-6 h-[500px] w-full">
              {kmeans.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Encoder Errors"
                      label={{
                        value: "Total Error Encoder",
                        position: "bottom",
                        offset: 0,
                      }}
                      tick={{ fill: "#6b7280" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Netburner Errors"
                      label={{
                        value: "Total Error Netburner",
                        angle: -90,
                        position: "insideLeft",
                        offset: -10,
                      }}
                      tick={{ fill: "#6b7280" }}
                    />
                    <ZAxis range={[60, 60]} /> {/* Fixed dot size */}
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={<CustomTooltip />}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Scatter
                      name="Stabil / Sehat"
                      data={scatterData.stabil}
                      fill="#10b981"
                    />
                    <Scatter
                      name="Rawan Encoder"
                      data={scatterData.encoder}
                      fill="#eab308"
                    />
                    <Scatter
                      name="Rawan Netburner"
                      data={scatterData.netburner}
                      fill="#ef4444"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Data hasil clustering tidak tersedia. Pastikan backend
                  menyala.
                </div>
              )}
            </div>
          </div>

          {/* Summary Table Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Ringkasan Kategori Radar
              </h2>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-900/50">
                    <th className="py-4 px-6">Kategori Cluster</th>
                    <th className="py-4 px-6 text-center">Tingkat Risiko</th>
                    <th className="py-4 px-6 text-right">Jumlah Radar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        Stabil / Sehat
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Rendah
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-lg text-slate-700 dark:text-slate-300">
                      {summary.stabil}
                    </td>
                  </tr>
                  <tr className="border-b dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        Rawan Encoder
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Sedang (Mekanik)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-lg text-slate-700 dark:text-slate-300">
                      {summary.encoder}
                    </td>
                  </tr>
                  <tr className="border-b dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        Rawan Netburner
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        Tinggi (Jaringan)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-lg text-slate-700 dark:text-slate-300">
                      {summary.netburner}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <td
                      colSpan={2}
                      className="py-4 px-6 font-bold text-right text-slate-700 dark:text-slate-300"
                    >
                      Total Radar Terekam:
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-xl text-slate-900 dark:text-white">
                      {summary.total}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* MTBF Section */}
          {mtbf.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* MTBF Bar Chart */}
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      MTBF (Mean Time Between Failures)
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Jarak hari rata-rata antar kerusakan. Warna merah
                    menunjukkan radar yang paling kritis (paling sering rusak).
                  </p>
                </div>

                <div className="p-6 h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mtbfChartData}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        type="number"
                        dataKey="mtbf_days"
                        name="MTBF (Hari)"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        formatter={(value: any) => [`${value} Hari`, "MTBF"]}
                      />
                      <Bar dataKey="mtbf_days" radius={[0, 4, 4, 0]}>
                        {mtbfChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getMtbfColor(entry.mtbf_days)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top 5 Critical Table */}
              <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden self-start">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-rose-50/50 dark:bg-rose-900/10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🚨</span>
                    <h2 className="text-lg font-bold text-rose-700 dark:text-rose-400">
                      Top 5 Critical Radars
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Radar dengan tingkat kerusakan paling sering, harus dicek
                    minggu ini.
                  </p>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-900/50">
                        <th className="py-3 px-4">Radar No</th>
                        <th className="py-3 px-4">Komponen</th>
                        <th className="py-3 px-4 text-right">MTBF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top5Mtbf.map((t, i) => (
                        <tr
                          key={i}
                          className="border-b dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                        >
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                            {t.radar_no}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                t.failure_type === "netburner"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                  : t.failure_type === "encoder"
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {t.failure_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">
                            {t.mtbf_days} hr
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

                    {/* Apriori Association Rules Table */}
          {apriori.length > 0 && (
            <div className="flex flex-col mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3 mb-2">
        
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Analisis Paket Kerusakan (Apriori)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Investigasi hari H: Jika sebuah komponen dilaporkan rusak, komponen apa lagi yang biasanya ikut ditemukan rusak di hari yang sama?
                </p>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-900/50">
                      <th className="py-4 px-6">Pemicu (Jika)</th>
                      <th className="py-4 px-6">Dampak (Maka)</th>
                      <th className="py-4 px-6 w-1/4">Kepastian (Confidence)</th>
                      <th className="py-4 px-6 text-center">Status Relasi (Lift)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apriori.map((a, i) => (
                      <tr
                        key={i}
                        className="border-b dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <td className="py-4 px-6">
                          <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-semibold capitalize bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {a.jika_terjadi}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-semibold capitalize bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {a.maka_terjadi}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-12">
                              {a.confidence_persen}%
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  a.confidence_persen >= 80
                                    ? "bg-red-700 dark:bg-red-600"
                                    : "bg-blue-500 dark:bg-blue-500"
                                }`}
                                style={{ width: `${a.confidence_persen}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {a.lift > 2 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                              Kuat 🔥
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              {a.lift}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Markov Chain Sankey Diagram */}
          {markov.length > 0 && (
            <div className="flex flex-col mb-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
                <div className="flex items-center gap-3 mb-2">
        
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Prediksi Efek Domino (Markov Chain)
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Melihat ke masa depan: Jika sebuah komponen rusak hari ini, seberapa besar probabilitas kerusakannya merembet ke komponen lain pada hari-hari berikutnya?
                </p>
              </div>

              <div className="p-6 h-[500px] w-full text-black dark:text-white">
                <ResponsiveSankey
                  data={sankeyData}
                  margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
                  align="justify"
                  colors={(node: any) => node.nodeColor || "#6366f1"}
                  nodeOpacity={1}
                  nodeHoverOthersOpacity={0.1}
                  nodeThickness={18}
                  nodeSpacing={24}
                  nodeBorderWidth={0}
                  nodeBorderColor={{
                    from: "color",
                    modifiers: [["darker", 0.8]],
                  }}
                  nodeBorderRadius={3}
                  linkOpacity={0.5}
                  linkHoverOthersOpacity={0.1}
                  linkContract={3}
                  enableLinkGradient={true}
                  label={(node: any) => (node.id as string).trim()}
                  labelPosition="outside"
                  labelOrientation="vertical"
                  labelPadding={16}
                  labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
                  valueFormat={(value) => `${value}%`}
                />
              </div>
            </div>
          )}


        </div>
      ) : null}
    </div>
  );
}
