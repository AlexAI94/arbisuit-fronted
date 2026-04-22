"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, ArrowLeftRight, Clock,
  Upload, Wifi, WifiOff, RefreshCw, FileDown
} from "lucide-react";
import { useAnalyticsWS } from "@/hooks/useAnalyticsWS";
import { ProfitChart } from "@/components/charts/ProfitChart";
import { SpreadChart } from "@/components/charts/SpreadChart";
import { UploadModal } from "@/components/upload/UploadModal";
import { api } from "@/lib/api";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

// Demo workspace — en Sprint 5 vendrá del store global
const WORKSPACE_ID = "demo-workspace";

interface FullAnalytics {
  kpis: {
    profit_total: number;
    volumen_total: number;
    spread_promedio: number;
    spread_max: number;
    capital_en_giro: number;
    ops_count: number;
    match_rate: number;
    unmatched_count: number;
  };
  serie_diaria: { date: string; profit: number; volumen: number; ops: number }[];
  distribucion_spread: { label: string; count: number; volumen: number }[];
  top_counterparts: { name: string; volumen: number; ops_count: number; spread_avg: number }[];
}

export default function DashboardPage() {
  const { metrics, connected, forceRefresh } = useAnalyticsWS(WORKSPACE_ID);
  const [showUpload, setShowUpload] = useState(false);
  const [fullData, setFullData] = useState<FullAnalytics | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  // Cargar analítica completa del mes (para gráficos)
  useEffect(() => {
    const fetchFull = async () => {
      setLoadingFull(true);
      const today = new Date().toISOString().split("T")[0];
      const firstDay = today.substring(0, 8) + "01";
      try {
        const { data } = await api.get(
          `/analytics/${WORKSPACE_ID}?period_start=${firstDay}&period_end=${today}`
        );
        setFullData(data);
      } catch {
        setFullData(MOCK_FULL);
      } finally {
        setLoadingFull(false);
      }
    };
    fetchFull();
  }, []);

  const kpis = fullData?.kpis ?? {
    profit_total: metrics.profit_total,
    volumen_total: metrics.volumen_total,
    spread_promedio: metrics.spread_promedio * 100,
    spread_max: 0,
    capital_en_giro: 0,
    ops_count: metrics.ops_count,
    match_rate: metrics.match_rate,
    unmatched_count: metrics.unmatched_count,
  };

  const STATS = [
    {
      label: "Profit del mes",
      value: formatCurrency(kpis.profit_total),
      sub: "ARS",
      icon: TrendingUp,
      color: "text-arbi-green",
      bg: "bg-arbi-green-dim",
      positive: true,
    },
    {
      label: "Volumen operado",
      value: formatCurrency(kpis.volumen_total),
      sub: "ARS",
      icon: ArrowLeftRight,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      positive: true,
    },
    {
      label: "Spread promedio",
      value: `${kpis.spread_promedio.toFixed(2)}%`,
      sub: `Máx ${kpis.spread_max.toFixed(2)}%`,
      icon: kpis.spread_promedio >= 3 ? TrendingUp : TrendingDown,
      color: kpis.spread_promedio >= 3 ? "text-arbi-green" : "text-arbi-yellow",
      bg: kpis.spread_promedio >= 3 ? "bg-arbi-green-dim" : "bg-arbi-yellow-dim",
      positive: kpis.spread_promedio >= 3,
    },
    {
      label: "Sin conciliar",
      value: String(kpis.unmatched_count),
      sub: `Match rate ${(kpis.match_rate * 100).toFixed(1)}%`,
      icon: Clock,
      color: kpis.unmatched_count > 0 ? "text-arbi-red" : "text-arbi-green",
      bg: kpis.unmatched_count > 0 ? "bg-arbi-red-dim" : "bg-arbi-green-dim",
      positive: kpis.unmatched_count === 0,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
              connected ? "text-arbi-green bg-arbi-green-dim" : "text-muted-foreground bg-muted/20"
            )}>
              {connected
                ? <><Wifi className="w-3 h-3" /> En vivo</>
                : <><WifiOff className="w-3 h-3" /> Offline</>}
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            {metrics.last_updated && (
              <span className="ml-2 text-xs">
                · Actualizado {new Date(metrics.last_updated).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={forceRefresh}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-[#161B27] transition-colors"
            title="Actualizar métricas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-arbi-green hover:bg-arbi-green/90 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar archivo
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#161B27] border border-[#1E2534] rounded-xl p-5 space-y-3 hover:border-[#2A3347] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
              <div className={`${bg} p-1.5 rounded-lg`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-mono">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profit chart — ocupa 2 columnas */}
        <div className="lg:col-span-2 bg-[#161B27] border border-[#1E2534] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Profit diario</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Evolución del spread capturado</p>
            </div>
            <span className="text-xs text-arbi-green font-mono font-semibold">
              {formatCurrency(kpis.profit_total)} total
            </span>
          </div>
          {loadingFull ? (
            <div className="h-[200px] bg-[#0F1117] rounded-lg animate-pulse" />
          ) : (
            <ProfitChart data={fullData?.serie_diaria ?? MOCK_FULL.serie_diaria} height={200} />
          )}
        </div>

        {/* Spread distribution */}
        <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Distribución spread</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cantidad de ops por rango</p>
          </div>
          {loadingFull ? (
            <div className="h-[160px] bg-[#0F1117] rounded-lg animate-pulse" />
          ) : (
            <SpreadChart data={fullData?.distribucion_spread ?? MOCK_FULL.distribucion_spread} height={160} />
          )}
        </div>
      </div>

      {/* Top counterparts + Match rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top contrapartes */}
        <div className="lg:col-span-2 bg-[#161B27] border border-[#1E2534] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Top contrapartes</h2>
          <div className="space-y-2">
            {(fullData?.top_counterparts ?? MOCK_FULL.top_counterparts).slice(0, 6).map((cp, i) => (
              <div key={cp.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-foreground truncate">{cp.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {cp.ops_count} ops
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#1E2534] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-arbi-green rounded-full"
                        style={{
                          width: `${Math.min(100, (cp.volumen / ((fullData?.top_counterparts?.[0]?.volumen ?? cp.volumen) || 1)) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-arbi-green flex-shrink-0">
                      {cp.spread_avg.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match rate gauge */}
        <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-foreground mb-4">Match rate</h2>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* Círculo de progreso */}
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1E2534" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#00C896" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - kpis.match_rate)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold font-mono text-arbi-green">
                  {(kpis.match_rate * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground">matcheadas</span>
              </div>
            </div>
            <div className="text-center space-y-1 w-full">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Conciliadas</span>
                <span className="text-arbi-green font-mono">{kpis.ops_count}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Sin match</span>
                <span className={kpis.unmatched_count > 0 ? "text-arbi-red font-mono" : "text-muted-foreground font-mono"}>
                  {kpis.unmatched_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpload && (
        <UploadModal
          workspaceId={WORKSPACE_ID}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); forceRefresh(); }}
        />
      )}
    </div>
  );
}

// ── Empty state (sin backend) ─────────────────────────────────────────────────
const MOCK_FULL: FullAnalytics = {
  kpis: {
    profit_total: 0,
    volumen_total: 0,
    spread_promedio: 0,
    spread_max: 0,
    capital_en_giro: 0,
    ops_count: 0,
    match_rate: 0,
    unmatched_count: 0,
  },
  serie_diaria: [],
  distribucion_spread: [],
  top_counterparts: [],
};
