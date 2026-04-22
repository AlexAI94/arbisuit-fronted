"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload, Search, Filter, ArrowUpRight, ArrowDownLeft,
  CheckCircle2, Clock, XCircle, RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { UploadModal } from "@/components/upload/UploadModal";
import { cn } from "@/lib/utils";

const WORKSPACE_ID = ""; // TODO: tomar del store de workspaces en Sprint 3

type TxStatus = "unmatched" | "matched" | "ignored" | "flagged";
type TxDirection = "credit" | "debit";

interface Transaction {
  id: string;
  date: string;
  amount: string;
  currency: string;
  direction: TxDirection;
  counterpart: string | null;
  description_raw: string | null;
  description_norm: string | null;
  bank_name: string | null;
  status: TxStatus;
}

const STATUS_CONFIG: Record<TxStatus, { label: string; icon: React.ElementType; className: string }> = {
  matched: { label: "Matcheada", icon: CheckCircle2, className: "badge-matched" },
  unmatched: { label: "Sin match", icon: XCircle, className: "badge-unmatched" },
  ignored: { label: "Ignorada", icon: XCircle, className: "text-muted-foreground bg-muted/30 border border-border" },
  flagged: { label: "Revisión", icon: Clock, className: "badge-pending" },
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TxStatus | "all">("all");

  const fetchTransactions = useCallback(async () => {
    // En Sprint 3 esto vendrá del endpoint real de transacciones
    // Por ahora usamos datos mock para mostrar la UI funcional
    setLoading(false);
    setTransactions(MOCK_TRANSACTIONS);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      tx.description_raw?.toLowerCase().includes(search.toLowerCase()) ||
      tx.counterpart?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: transactions.length,
    matched: transactions.filter((t) => t.status === "matched").length,
    unmatched: transactions.filter((t) => t.status === "unmatched").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transacciones bancarias</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {stats.matched}/{stats.total} matcheadas ·{" "}
            <span className="text-arbi-red">{stats.unmatched} pendientes</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-[#161B27] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-arbi-green hover:bg-arbi-green/90 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar extracto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por descripción o contraparte..."
            className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green focus:border-arbi-green transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {(["all", "unmatched", "matched", "flagged"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                statusFilter === s
                  ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                  : "border-[#1E2534] text-muted-foreground hover:text-foreground hover:border-[#2A3347]"
              )}
            >
              {s === "all" ? "Todas" : STATUS_CONFIG[s as TxStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#161B27] border border-[#1E2534] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E2534]">
                {["Fecha", "Monto", "Dirección", "Descripción", "Contraparte", "Estado"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2534]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3.5 bg-[#1E2534] rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No hay transacciones que mostrar
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const { label, icon: Icon, className } = STATUS_CONFIG[tx.status];
                  return (
                    <tr key={tx.id} className="hover:bg-[#0F1117] transition-colors group">
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium whitespace-nowrap">
                        <span className={tx.direction === "credit" ? "text-arbi-green" : "text-arbi-red"}>
                          {tx.direction === "credit" ? "+" : "-"}
                          {formatCurrency(parseFloat(tx.amount), tx.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                          tx.direction === "credit" ? "text-arbi-green bg-arbi-green-dim" : "text-arbi-red bg-arbi-red-dim"
                        )}>
                          {tx.direction === "credit"
                            ? <ArrowDownLeft className="w-3 h-3" />
                            : <ArrowUpRight className="w-3 h-3" />}
                          {tx.direction === "credit" ? "Ingreso" : "Egreso"}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="text-xs text-foreground truncate">
                          {tx.description_norm || tx.description_raw || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px]">
                        <span className="truncate block">{tx.counterpart || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", className)}>
                          <Icon className="w-3 h-3" />
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          workspaceId={WORKSPACE_ID || "demo-workspace"}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
}

// ── Mock data para desarrollo ────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1", date: "2026-04-07", amount: "85000.00", currency: "ARS", direction: "credit", counterpart: "GARCIA JUAN P", description_raw: "TRANSF RECIBIDA 0034 GARCIA JUAN P", description_norm: "Transferencia recibida de Juan García", bank_name: "Santander", status: "matched" },
  { id: "2", date: "2026-04-07", amount: "120500.00", currency: "ARS", direction: "credit", counterpart: "LOPEZ MARIA S", description_raw: "TRANSF RECIBIDA 0078 LOPEZ MARIA", description_norm: "Transferencia recibida de María López", bank_name: "Santander", status: "matched" },
  { id: "3", date: "2026-04-06", amount: "200000.00", currency: "ARS", direction: "credit", counterpart: "RODRIGUEZ CARLOS", description_raw: "DEP EFECTIVO SUCURSAL 042", description_norm: "Depósito en efectivo sucursal", bank_name: "Galicia", status: "flagged" },
  { id: "4", date: "2026-04-06", amount: "95200.00", currency: "ARS", direction: "debit", counterpart: "MARTINEZ ANA L", description_raw: "TRANSF EMITIDA 0091 MARTINEZ ANA", description_norm: "Transferencia enviada a Ana Martínez", bank_name: "Santander", status: "matched" },
  { id: "5", date: "2026-04-05", amount: "45000.00", currency: "ARS", direction: "credit", counterpart: null, description_raw: "PAGO QR 00123456", description_norm: "Cobro por QR", bank_name: "Mercado Pago", status: "unmatched" },
  { id: "6", date: "2026-04-05", amount: "310000.00", currency: "ARS", direction: "credit", counterpart: "FERNANDEZ PABLO", description_raw: "TRANSF RECIBIDA 0102 FERNANDEZ P", description_norm: "Transferencia recibida de Pablo Fernández", bank_name: "BBVA", status: "unmatched" },
  { id: "7", date: "2026-04-04", amount: "175000.00", currency: "ARS", direction: "debit", counterpart: "GOMEZ LUCIA", description_raw: "TRANSF EMITIDA 0088 GOMEZ LUCIA", description_norm: "Transferencia enviada a Lucía Gómez", bank_name: "Galicia", status: "matched" },
];
