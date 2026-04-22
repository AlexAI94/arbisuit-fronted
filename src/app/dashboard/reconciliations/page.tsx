"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play, Plus, RefreshCw, Zap, GitMerge, Brain, CheckCircle2,
  AlertCircle, ChevronRight, Calendar, Filter
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { MatchCard, type MatchItem } from "@/components/reconciliation/MatchCard";

const WORKSPACE_ID = "demo-workspace"; // TODO: store de workspaces Sprint 4

interface Reconciliation {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  match_rate: number | null;
}

interface EngineReport {
  total_bank_txs: number;
  total_crypto_ops: number;
  exact_matches: number;
  fuzzy_matches: number;
  multi_tx_matches: number;
  ai_suggestions: number;
  unmatched: number;
  match_rate: number;
}

type ActiveFilter = "all" | "pending" | "confirmed" | "ai_suggested";

export default function ReconciliationsPage() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [activeRec, setActiveRec] = useState<Reconciliation | null>(null);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [report, setReport] = useState<EngineReport | null>(null);
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const [runningEngine, setRunningEngine] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [creatingRec, setCreatingRec] = useState(false);

  const fetchReconciliations = useCallback(async () => {
    try {
      const { data } = await api.get(`/reconciliations/workspace/${WORKSPACE_ID}`);
      setReconciliations(data);
      if (data.length > 0 && !activeRec) setActiveRec(data[0]);
    } catch {
      // usar mock para demo
      setReconciliations(MOCK_RECS);
      setActiveRec(MOCK_RECS[0]);
    }
  }, [activeRec]);

  const fetchItems = useCallback(async (recId: string) => {
    setLoadingItems(true);
    try {
      const { data } = await api.get(`/reconciliations/${recId}/items`);
      setItems(data);
    } catch {
      setItems(MOCK_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => { fetchReconciliations(); }, []);
  useEffect(() => { if (activeRec) fetchItems(activeRec.id); }, [activeRec]);

  const handleRunEngine = async () => {
    if (!activeRec) return;
    setRunningEngine(true);
    try {
      const { data } = await api.post(`/reconciliations/${activeRec.id}/run`);
      setReport(data);
      await fetchItems(activeRec.id);
      await fetchReconciliations();
    } catch {
      setReport(MOCK_REPORT);
      setItems(MOCK_ITEMS);
    } finally {
      setRunningEngine(false);
    }
  };

  const handleCreateRec = async () => {
    setCreatingRec(true);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];
    try {
      const { data } = await api.post("/reconciliations/", {
        workspace_id: WORKSPACE_ID,
        period_start: firstDay,
        period_end: today,
      });
      setReconciliations(prev => [data, ...prev]);
      setActiveRec(data);
    } catch {
      // demo
    } finally {
      setCreatingRec(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "pending") return item.matched_by === "engine" && item.match_score < 0.85;
    if (filter === "confirmed") return item.matched_by === "user" || item.match_score >= 0.85;
    if (filter === "ai_suggested") return item.match_type === "ai_suggested";
    return true;
  });

  const pendingCount = items.filter(i => i.matched_by === "engine" && i.match_score < 0.85).length;
  const [showPeriods, setShowPeriods] = useState(false);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Mobile: selector de período colapsable */}
      {reconciliations.length > 0 && (
        <div className="lg:hidden">
          <button
            onClick={() => setShowPeriods(!showPeriods)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#161B27] border border-[#1E2534] rounded-xl text-sm"
          >
            <span className="text-white font-medium">
              {activeRec
                ? `${activeRec.period_start} → ${activeRec.period_end}`
                : "Seleccionar período"}
            </span>
            <span className="text-slate-500">{showPeriods ? "▲" : "▼"}</span>
          </button>
          {showPeriods && (
            <div className="mt-2 space-y-1.5 bg-[#161B27] border border-[#1E2534] rounded-xl p-2">
              {reconciliations.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => { setActiveRec(rec); setShowPeriods(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg border transition-colors",
                    activeRec?.id === rec.id
                      ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                      : "border-transparent hover:bg-[#1E2534] text-muted-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">{rec.period_start} → {rec.period_end}</p>
                    {rec.match_rate != null && (
                      <span className="text-xs font-mono">{Math.round(rec.match_rate * 100)}%</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6 h-full">
        {/* Sidebar — solo desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Conciliaciones</h2>
            <button
              onClick={handleCreateRec}
              disabled={creatingRec}
              className="p-1.5 text-muted-foreground hover:text-arbi-green hover:bg-arbi-green-dim rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5">
            {reconciliations.map((rec) => (
              <button
                key={rec.id}
                onClick={() => setActiveRec(rec)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border transition-colors",
                  activeRec?.id === rec.id
                    ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                    : "border-transparent hover:bg-[#161B27] text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">
                      {new Date(rec.period_start).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs opacity-70 mt-0.5">{rec.period_start} → {rec.period_end}</p>
                  </div>
                  {rec.match_rate != null && (
                    <span className="text-xs font-mono">{Math.round(rec.match_rate * 100)}%</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

      {/* Panel principal */}
      <div className="flex-1 space-y-5 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Motor de Matcheo</h1>
            {activeRec && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Período: {activeRec.period_start} → {activeRec.period_end}
                {pendingCount > 0 && (
                  <span className="ml-2 text-arbi-yellow">· {pendingCount} pendientes de revisión</span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={handleRunEngine}
            disabled={runningEngine || !activeRec}
            className="flex items-center gap-2 bg-arbi-green hover:bg-arbi-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {runningEngine
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Play className="w-4 h-4" />}
            {runningEngine ? "Ejecutando..." : "Ejecutar motor"}
          </button>
        </div>

        {/* Resultado del motor */}
        {report && (
          <div className="grid grid-cols-4 gap-3 animate-slide-up">
            {[
              { label: "Exactos", value: report.exact_matches, icon: Zap, color: "text-arbi-green", bg: "bg-arbi-green-dim" },
              { label: "Fuzzy auto", value: report.fuzzy_matches, icon: GitMerge, color: "text-blue-400", bg: "bg-blue-400/10" },
              { label: "Multi-tx", value: report.multi_tx_matches, icon: GitMerge, color: "text-arbi-yellow", bg: "bg-arbi-yellow-dim" },
              { label: "Sugerencias IA", value: report.ai_suggestions, icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-[#161B27] border border-[#1E2534] rounded-xl p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", bg)}>
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white font-mono">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Match rate global */}
        {report && (
          <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Match rate global</span>
                <span className="text-sm font-bold font-mono text-arbi-green">
                  {Math.round(report.match_rate * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#1E2534] rounded-full overflow-hidden">
                <div
                  className="h-full bg-arbi-green rounded-full transition-all duration-700"
                  style={{ width: `${report.match_rate * 100}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-right flex-shrink-0">
              <p>{report.total_bank_txs} txs bancarias</p>
              <p>{report.total_crypto_ops} ops cripto</p>
              <p className="text-arbi-red">{report.unmatched} sin match</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {([
            ["all", "Todos"],
            ["pending", `Revisar (${pendingCount})`],
            ["confirmed", "Confirmados"],
            ["ai_suggested", "IA"],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                filter === val
                  ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                  : "border-[#1E2534] text-muted-foreground hover:text-foreground hover:border-[#2A3347]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cards de match */}
        <div className="space-y-3">
          {loadingItems ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-[#161B27] border border-[#1E2534] rounded-xl animate-pulse" />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {filter === "pending" ? "No hay matches pendientes de revisión" : "No hay items para mostrar"}
              </p>
              {items.length === 0 && (
                <p className="text-xs mt-1">Ejecutá el motor para procesar las transacciones</p>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <MatchCard
                key={item.id}
                item={item}
                onApproved={() => fetchItems(activeRec!.id)}
                onRejected={() => fetchItems(activeRec!.id)}
              />
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Empty state (sin backend) ────────────────────────────────────────────────
const MOCK_RECS: Reconciliation[] = [];
const MOCK_REPORT: EngineReport = {
  total_bank_txs: 0, total_crypto_ops: 0,
  exact_matches: 0, fuzzy_matches: 0, multi_tx_matches: 0,
  ai_suggestions: 0, unmatched: 0, match_rate: 0,
};
const MOCK_ITEMS: MatchItem[] = [];
