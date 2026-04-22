"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, RefreshCw, CheckCircle, Clock, FileDown,
  ChevronDown, ChevronUp, Trash2, Edit2, Link2, Unlink,
  TrendingUp, TrendingDown, ArrowUpDown, Building2,
  Wallet, Globe, TriangleAlert, DollarSign
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { EntitySelect, EntityLogo } from "@/components/ui/EntitySelect";
import { ENTITIES, logoUrl } from "@/lib/entities";

const WORKSPACE_ID = "demo-workspace";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ArbitrageType = "bank_exchange" | "exchange_exchange" | "triangular" | "direct";
type EntityType = "bank" | "wallet" | "exchange";
type EntryType = "deposit" | "withdrawal" | "buy" | "sell" | "p2p_buy" | "p2p_sell" | "triangular_step" | "transfer";
type MatchStatus = "matched" | "pending" | "ignored";
type ReportStatus = "draft" | "confirmed";

interface TraceabilityEntry {
  id: string;
  report_id: string;
  entry_type: EntryType;
  arbitrage_type: ArbitrageType | null;
  source_entity: string;
  source_entity_type: EntityType;
  target_entity: string | null;
  target_entity_type: EntityType | null;
  currency: string;
  amount: number;
  amount_ars: number;
  fee_ars: number | null;
  exchange_rate: number | null;
  match_status: MatchStatus;
  matched_with_id: string | null;
  label: string | null;
  observations: string | null;
  triangular_step: number | null;
  triangular_group_id: string | null;
  bank_tx_id: string | null;
  crypto_op_id: string | null;
  date: string;
}

interface TraceabilityReport {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: ReportStatus;
  notes: string | null;
  initial_balance_ars: number;
  initial_balance_usd: number;
  initial_balance_usdt: number;
  total_deposits_ars: number;
  total_withdrawals_ars: number;
  total_buys_ars: number;
  total_sells_ars: number;
  total_profit_ars: number;
  final_balance_ars: number;
  matched_count: number;
  pending_count: number;
  created_at: string;
  confirmed_at: string | null;
  entries: TraceabilityEntry[];
}

interface ReportSummary {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: ReportStatus;
  initial_balance_ars: number;
  final_balance_ars: number;
  total_profit_ars: number;
  matched_count: number;
  pending_count: number;
  created_at: string;
}

// ── Constantes de UI ──────────────────────────────────────────────────────────

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  deposit: "Depósito",
  withdrawal: "Retiro",
  buy: "Compra",
  sell: "Venta",
  p2p_buy: "Compra P2P",
  p2p_sell: "Venta P2P",
  triangular_step: "Paso Triangular",
  transfer: "Transferencia",
};

const ARBITRAGE_TYPE_LABELS: Record<ArbitrageType, string> = {
  bank_exchange: "Banco → Exchange",
  exchange_exchange: "Exchange → Exchange",
  triangular: "Triangular (USD→USDT→ARS)",
  direct: "Directo",
};

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  bank: "Banco",
  wallet: "Billetera",
  exchange: "Exchange",
};

function entityIcon(type: EntityType) {
  if (type === "bank") return <Building2 className="w-3.5 h-3.5" />;
  if (type === "wallet") return <Wallet className="w-3.5 h-3.5" />;
  return <Globe className="w-3.5 h-3.5" />;
}

function entryTypeColor(type: EntryType): string {
  if (type === "deposit") return "text-arbi-green bg-arbi-green-dim border-arbi-green/20";
  if (type === "withdrawal") return "text-arbi-red bg-arbi-red-dim border-arbi-red/20";
  if (type === "buy" || type === "p2p_buy") return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  if (type === "sell" || type === "p2p_sell") return "text-arbi-yellow bg-arbi-yellow-dim border-arbi-yellow/20";
  if (type === "triangular_step") return "text-purple-400 bg-purple-400/10 border-purple-400/20";
  return "text-muted-foreground bg-muted/10 border-muted/20";
}

function matchBadge(status: MatchStatus) {
  if (status === "matched")
    return <span className="flex items-center gap-1 text-xs text-arbi-green"><CheckCircle className="w-3 h-3" />Matcheado</span>;
  if (status === "pending")
    return <span className="flex items-center gap-1 text-xs text-arbi-yellow"><Clock className="w-3 h-3" />Pendiente</span>;
  return <span className="text-xs text-muted-foreground">Ignorado</span>;
}

// ── Modal: Nuevo Reporte ──────────────────────────────────────────────────────

function NewReportModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: ReportSummary) => void }) {
  const [form, setForm] = useState({
    name: "",
    period_start: "",
    period_end: "",
    notes: "",
    initial_balance_ars: "0",
    initial_balance_usd: "0",
    initial_balance_usdt: "0",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/traceability/", {
        workspace_id: WORKSPACE_ID,
        name: form.name,
        period_start: form.period_start,
        period_end: form.period_end,
        notes: form.notes || null,
        initial_balance_ars: parseFloat(form.initial_balance_ars) || 0,
        initial_balance_usd: parseFloat(form.initial_balance_usd) || 0,
        initial_balance_usdt: parseFloat(form.initial_balance_usdt) || 0,
      });
      onCreated(data);
    } catch {
      alert("Error al crear el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0F1117] border border-[#1E2534] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-5">Nuevo Resumen de Trazabilidad</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Nombre del reporte *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Cierre Abril 2026"
              className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-arbi-green/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Desde *</label>
              <input
                required type="date"
                value={form.period_start}
                onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hasta *</label>
              <input
                required type="date"
                value={form.period_end}
                onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">Saldos iniciales</label>
            <div className="grid grid-cols-3 gap-2">
              {(["ars", "usd", "usdt"] as const).map(cur => (
                <div key={cur}>
                  <label className="text-xs text-muted-foreground mb-1 block uppercase">{cur}</label>
                  <input
                    type="number" min="0" step="any"
                    value={form[`initial_balance_${cur}` as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [`initial_balance_${cur}`]: e.target.value }))}
                    className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-arbi-green/50"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2534] text-sm text-muted-foreground hover:text-white hover:border-[#2A3347] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-arbi-green hover:bg-arbi-green/90 text-black font-semibold text-sm transition-colors disabled:opacity-50">
              {loading ? "Creando..." : "Crear reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal: Nueva Entrada ──────────────────────────────────────────────────────

function NewEntryModal({ reportId, onClose, onCreated }: {
  reportId: string;
  onClose: () => void;
  onCreated: (e: TraceabilityEntry) => void;
}) {
  const [form, setForm] = useState({
    entry_type: "deposit" as EntryType,
    arbitrage_type: "" as ArbitrageType | "",
    source_entity: "",
    source_entity_type: "bank" as EntityType,
    target_entity: "",
    target_entity_type: "exchange" as EntityType,
    currency: "ARS",
    amount: "",
    amount_ars: "",
    fee_ars: "",
    exchange_rate: "",
    label: "",
    observations: "",
    triangular_step: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  const needsTarget = ["buy", "sell", "p2p_buy", "p2p_sell", "triangular_step", "transfer"].includes(form.entry_type);
  const isTriangular = form.arbitrage_type === "triangular";
  const isDeposit = form.entry_type === "deposit";
  const isWithdrawal = form.entry_type === "withdrawal";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post(`/traceability/${reportId}/entries`, {
        entry_type: form.entry_type,
        arbitrage_type: form.arbitrage_type || null,
        source_entity: form.source_entity,
        source_entity_type: form.source_entity_type,
        target_entity: form.target_entity || null,
        target_entity_type: needsTarget ? form.target_entity_type : null,
        currency: form.currency,
        amount: parseFloat(form.amount),
        amount_ars: parseFloat(form.amount_ars || form.amount),
        fee_ars: form.fee_ars ? parseFloat(form.fee_ars) : null,
        exchange_rate: form.exchange_rate ? parseFloat(form.exchange_rate) : null,
        label: form.label || null,
        observations: form.observations || null,
        triangular_step: form.triangular_step ? parseInt(form.triangular_step) : null,
        date: form.date,
      });
      onCreated(data);
    } catch {
      alert("Error al agregar el movimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-6">
      <div className="bg-[#0F1117] border border-[#1E2534] rounded-2xl p-6 w-full max-w-xl shadow-2xl mx-4">
        <h2 className="text-lg font-semibold text-white mb-5">Agregar Movimiento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Tipo de movimiento y arbitraje */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo de movimiento *</label>
              <select
                value={form.entry_type}
                onChange={e => setForm(f => ({ ...f, entry_type: e.target.value as EntryType }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              >
                {Object.entries(ENTRY_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo de arbitraje</label>
              <select
                value={form.arbitrage_type}
                onChange={e => setForm(f => ({ ...f, arbitrage_type: e.target.value as ArbitrageType | "" }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              >
                <option value="">— Sin tipo —</option>
                {Object.entries(ARBITRAGE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Entidades */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Entidad origen *</label>
              <EntitySelect
                value={form.source_entity}
                onChange={(name, type) => setForm(f => ({ ...f, source_entity: name, source_entity_type: type }))}
                placeholder="Banco, billetera o exchange..."
              />
            </div>
            {needsTarget && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Entidad destino</label>
                <EntitySelect
                  value={form.target_entity}
                  onChange={(name, type) => setForm(f => ({ ...f, target_entity: name, target_entity_type: type }))}
                  placeholder="Banco, billetera o exchange..."
                />
              </div>
            )}
          </div>

          {/* Moneda y montos */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Moneda *</label>
              <select
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              >
                {["ARS", "USD", "USDT", "BTC", "ETH", "DAI"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Monto ({form.currency}) *</label>
              <input
                required type="number" min="0" step="any"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Equiv. ARS *</label>
              <input
                required type="number" min="0" step="any"
                value={form.amount_ars}
                onChange={e => setForm(f => ({ ...f, amount_ars: e.target.value }))}
                placeholder={form.currency === "ARS" ? form.amount : ""}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-arbi-green/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Comisión ARS</label>
              <input
                type="number" min="0" step="any"
                value={form.fee_ars}
                onChange={e => setForm(f => ({ ...f, fee_ars: e.target.value }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              />
            </div>
            {form.currency !== "ARS" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tasa de cambio</label>
                <input
                  type="number" min="0" step="any"
                  value={form.exchange_rate}
                  onChange={e => setForm(f => ({ ...f, exchange_rate: e.target.value }))}
                  className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
                />
              </div>
            )}
          </div>

          {/* Triangular step */}
          {isTriangular && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Paso triangular (1=compra USD, 2=transfer USDT, 3=venta ARS)</label>
              <input
                type="number" min="1" max="3"
                value={form.triangular_step}
                onChange={e => setForm(f => ({ ...f, triangular_step: e.target.value }))}
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
              />
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Fecha *</label>
            <input
              required type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-arbi-green/50"
            />
          </div>

          {/* Label y observaciones */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Leyenda de identificación</label>
            <input
              value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Ej: Operación 42 - Cliente X - Binance↔Bybit"
              className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-arbi-green/50"
            />
          </div>

          {(isDeposit || isWithdrawal) && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Observaciones</label>
              <textarea
                value={form.observations}
                onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                rows={2}
                placeholder="Aclaración sobre este depósito/retiro..."
                className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-arbi-green/50"
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2534] text-sm text-muted-foreground hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-arbi-green hover:bg-arbi-green/90 text-black font-semibold text-sm transition-colors disabled:opacity-50">
              {loading ? "Guardando..." : "Agregar movimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Componente: Cuadre de trazabilidad ────────────────────────────────────────

function TraceabilitySummary({ report }: { report: TraceabilityReport }) {
  const rows = [
    { label: "Saldo inicial", value: report.initial_balance_ars, sign: null, color: "text-white" },
    { label: "Total depósitos", value: report.total_deposits_ars, sign: "+", color: "text-arbi-green" },
    { label: "Total retiros", value: -report.total_withdrawals_ars, sign: "−", color: "text-arbi-red" },
    { label: "Total compras", value: -report.total_buys_ars, sign: "−", color: "text-blue-400" },
    { label: "Total ventas", value: report.total_sells_ars, sign: "+", color: "text-arbi-yellow" },
    { label: "Ganancia operativa", value: report.total_profit_ars, sign: "=", color: report.total_profit_ars >= 0 ? "text-arbi-green" : "text-arbi-red" },
  ];

  return (
    <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-5 space-y-1">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-arbi-green" />
        Cuadre del período
      </h3>
      {rows.map(({ label, value, sign, color }) => (
        <div key={label} className={cn("flex justify-between items-center py-1.5", sign === "=" ? "border-t border-[#1E2534] pt-3 mt-2" : "")}>
          <div className="flex items-center gap-2 text-sm">
            {sign && <span className={cn("font-mono font-bold w-4 text-center", color)}>{sign}</span>}
            {!sign && <span className="w-4" />}
            <span className={cn("text-muted-foreground", sign === "=" ? "font-semibold text-white" : "")}>{label}</span>
          </div>
          <span className={cn("font-mono font-semibold text-sm", color)}>
            {formatCurrency(Math.abs(value))}
          </span>
        </div>
      ))}
      {/* Saldo final */}
      <div className="flex justify-between items-center py-2 border-t-2 border-arbi-green/30 mt-2 pt-3">
        <div className="flex items-center gap-2">
          <span className="w-4" />
          <span className="font-bold text-white text-sm">Saldo final consolidado</span>
        </div>
        <span className={cn("font-mono font-bold text-base", report.final_balance_ars >= 0 ? "text-arbi-green" : "text-arbi-red")}>
          {formatCurrency(report.final_balance_ars)}
        </span>
      </div>
    </div>
  );
}

// ── Componente: Fila de entrada ───────────────────────────────────────────────

function EntryRow({
  entry,
  onMatchToggle,
  onDelete,
  onEditLabel,
}: {
  entry: TraceabilityEntry;
  onMatchToggle: (e: TraceabilityEntry) => void;
  onDelete: (id: string) => void;
  onEditLabel: (e: TraceabilityEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all",
      entry.match_status === "matched" ? "border-arbi-green/20 bg-arbi-green/5" :
        entry.match_status === "pending" ? "border-[#1E2534] bg-[#161B27]" :
          "border-[#1E2534]/50 bg-[#0F1117] opacity-60"
    )}>
      {/* Fila principal */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Tipo */}
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", entryTypeColor(entry.entry_type))}>
          {ENTRY_TYPE_LABELS[entry.entry_type]}
        </span>

        {/* Fecha */}
        <span className="text-xs text-muted-foreground font-mono w-24 flex-shrink-0">
          {new Date(entry.date).toLocaleDateString("es-AR")}
        </span>

        {/* Entidades */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-white truncate">
            <EntityLogo
              domain={ENTITIES.find(e => e.name === entry.source_entity)?.domain ?? ""}
              name={entry.source_entity}
              size={18}
            />
            <span className="truncate">{entry.source_entity}</span>
            {entry.target_entity && (
              <>
                <span className="text-muted-foreground">→</span>
                <EntityLogo
                  domain={ENTITIES.find(e => e.name === entry.target_entity)?.domain ?? ""}
                  name={entry.target_entity ?? ""}
                  size={18}
                />
                <span className="truncate text-muted-foreground">{entry.target_entity}</span>
              </>
            )}
          </div>
          {entry.label && (
            <p className="text-xs text-arbi-green/80 truncate mt-0.5">{entry.label}</p>
          )}
        </div>

        {/* Arbitraje */}
        {entry.arbitrage_type && (
          <span className="text-xs text-purple-400 flex-shrink-0 hidden lg:block">
            {ARBITRAGE_TYPE_LABELS[entry.arbitrage_type]}
          </span>
        )}

        {/* Monto */}
        <div className="text-right flex-shrink-0">
          <div className={cn("font-mono font-semibold text-sm",
            entry.entry_type === "deposit" || entry.entry_type === "sell" || entry.entry_type === "p2p_sell"
              ? "text-arbi-green" : "text-arbi-red"
          )}>
            {entry.entry_type === "deposit" || entry.entry_type === "sell" || entry.entry_type === "p2p_sell" ? "+" : "−"}
            {formatCurrency(entry.amount_ars)}
          </div>
          {entry.currency !== "ARS" && (
            <div className="text-xs text-muted-foreground font-mono">
              {entry.amount.toLocaleString("es-AR", { maximumFractionDigits: 8 })} {entry.currency}
            </div>
          )}
        </div>

        {/* Match status */}
        <div className="flex-shrink-0 w-24 text-right">{matchBadge(entry.match_status)}</div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEditLabel(entry)} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2534] transition-colors" title="Editar leyenda">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onMatchToggle(entry)} className="p-1.5 text-muted-foreground hover:text-arbi-green rounded hover:bg-[#1E2534] transition-colors" title={entry.match_status === "matched" ? "Deshacer match" : "Marcar como matcheado"}>
            {entry.match_status === "matched" ? <Unlink className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setExpanded(x => !x)} className="p-1.5 text-muted-foreground hover:text-white rounded hover:bg-[#1E2534] transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(entry.id)} className="p-1.5 text-muted-foreground hover:text-arbi-red rounded hover:bg-[#1E2534] transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[#1E2534]/50 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-3 text-xs">
            {entry.exchange_rate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasa de cambio</span>
                <span className="font-mono text-white">{entry.exchange_rate.toLocaleString("es-AR")}</span>
              </div>
            )}
            {entry.fee_ars != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comisión ARS</span>
                <span className="font-mono text-arbi-red">−{formatCurrency(entry.fee_ars)}</span>
              </div>
            )}
            {entry.arbitrage_type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de arbitraje</span>
                <span className="text-purple-400">{ARBITRAGE_TYPE_LABELS[entry.arbitrage_type]}</span>
              </div>
            )}
            {entry.triangular_step && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paso triangular</span>
                <span className="text-white">{entry.triangular_step} de 3</span>
              </div>
            )}
            {entry.bank_tx_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tx bancaria vinculada</span>
                <span className="font-mono text-xs text-blue-400">{entry.bank_tx_id.substring(0, 8)}…</span>
              </div>
            )}
            {entry.crypto_op_id && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Op cripto vinculada</span>
                <span className="font-mono text-xs text-blue-400">{entry.crypto_op_id.substring(0, 8)}…</span>
              </div>
            )}
          </div>
          {entry.observations && (
            <div className="mt-2 bg-[#0F1117] border border-[#1E2534] rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Observaciones</p>
              <p className="text-sm text-white">{entry.observations}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal: Editar label/observaciones ─────────────────────────────────────────

function EditLabelModal({ entry, onClose, onSaved }: {
  entry: TraceabilityEntry;
  onClose: () => void;
  onSaved: (updated: TraceabilityEntry) => void;
}) {
  const [label, setLabel] = useState(entry.label ?? "");
  const [observations, setObservations] = useState(entry.observations ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch(`/traceability/entries/${entry.id}`, { label: label || null, observations: observations || null });
      onSaved(data);
    } catch {
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0F1117] border border-[#1E2534] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-base font-semibold text-white mb-4">Editar leyenda y observaciones</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Leyenda de identificación</label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Ej: Operación 42 - Binance↔Bybit"
              className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-arbi-green/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Observaciones</label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              className="w-full bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-arbi-green/50"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-[#1E2534] text-sm text-muted-foreground hover:text-white transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 px-4 py-2.5 rounded-lg bg-arbi-green hover:bg-arbi-green/90 text-black font-semibold text-sm transition-colors disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

type Tab = "all" | "deposits" | "withdrawals" | "buys" | "sells" | "pending";

const TAB_LABELS: Record<Tab, string> = {
  all: "Todos",
  deposits: "Depósitos",
  withdrawals: "Retiros",
  buys: "Compras",
  sells: "Ventas",
  pending: "Pendientes",
};

export default function TrazabilidadPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReport, setSelectedReport] = useState<TraceabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewReport, setShowNewReport] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TraceabilityEntry | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const fetchReports = useCallback(async () => {
    try {
      const { data } = await api.get(`/traceability/workspace/${WORKSPACE_ID}`);
      setReports(data);
    } catch {
      setReports(MOCK_REPORTS);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async (id: string) => {
    try {
      const { data } = await api.get(`/traceability/${id}`);
      setSelectedReport(data);
    } catch {
      setSelectedReport(MOCK_REPORT);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) fetchReport(reports[0].id);
  }, [reports, selectedReport, fetchReport]);

  const handleEntryCreated = (entry: TraceabilityEntry) => {
    setShowNewEntry(false);
    if (selectedReport) fetchReport(selectedReport.id);
  };

  const handleMatchToggle = async (entry: TraceabilityEntry) => {
    try {
      if (entry.match_status === "matched") {
        await api.post(`/traceability/entries/${entry.id}/unmatch`);
      } else {
        await api.patch(`/traceability/entries/${entry.id}`, { match_status: "matched" });
      }
      if (selectedReport) fetchReport(selectedReport.id);
    } catch { /* silencioso */ }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return;
    try {
      await api.delete(`/traceability/entries/${id}`);
      if (selectedReport) fetchReport(selectedReport.id);
    } catch { /* silencioso */ }
  };

  const handleLabelSaved = (updated: TraceabilityEntry) => {
    setEditingEntry(null);
    if (selectedReport) fetchReport(selectedReport.id);
  };

  const filteredEntries = (selectedReport?.entries ?? []).filter(e => {
    if (activeTab === "all") return true;
    if (activeTab === "deposits") return e.entry_type === "deposit";
    if (activeTab === "withdrawals") return e.entry_type === "withdrawal";
    if (activeTab === "buys") return e.entry_type === "buy" || e.entry_type === "p2p_buy";
    if (activeTab === "sells") return e.entry_type === "sell" || e.entry_type === "p2p_sell";
    if (activeTab === "pending") return e.match_status === "pending";
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resumen de Trazabilidad</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Cuadre global de fondos: saldo inicial → movimientos → saldo final</p>
        </div>
        <button
          onClick={() => setShowNewReport(true)}
          className="flex items-center gap-2 bg-arbi-green hover:bg-arbi-green/90 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo reporte
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Lista de reportes */}
        <div className="xl:col-span-1 space-y-2">
          <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-3">Reportes</p>
          {loading && <div className="h-20 bg-[#161B27] rounded-xl animate-pulse" />}
          {!loading && reports.length === 0 && (
            <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Sin reportes aún</p>
              <button onClick={() => setShowNewReport(true)} className="text-xs text-arbi-green mt-2 hover:underline">Crear el primero</button>
            </div>
          )}
          {reports.map(r => (
            <button
              key={r.id}
              onClick={() => fetchReport(r.id)}
              className={cn(
                "w-full text-left bg-[#161B27] border rounded-xl p-4 transition-all",
                selectedReport?.id === r.id ? "border-arbi-green/40 bg-arbi-green/5" : "border-[#1E2534] hover:border-[#2A3347]"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.period_start).toLocaleDateString("es-AR")} → {new Date(r.period_end).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                  r.status === "confirmed" ? "text-arbi-green bg-arbi-green-dim" : "text-arbi-yellow bg-arbi-yellow-dim"
                )}>
                  {r.status === "confirmed" ? "Cerrado" : "Borrador"}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className={cn("font-mono font-semibold", r.total_profit_ars >= 0 ? "text-arbi-green" : "text-arbi-red")}>
                  {r.total_profit_ars >= 0 ? "+" : ""}{formatCurrency(r.total_profit_ars)}
                </span>
                <span className="text-muted-foreground">{r.pending_count} pendientes</span>
              </div>
            </button>
          ))}
        </div>

        {/* Detalle del reporte */}
        <div className="xl:col-span-3 space-y-5">
          {!selectedReport && (
            <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-12 text-center">
              <p className="text-muted-foreground">Seleccioná un reporte para verlo</p>
            </div>
          )}

          {selectedReport && (
            <>
              {/* KPIs rápidos */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Saldo inicial", value: selectedReport.initial_balance_ars, icon: DollarSign, color: "text-white" },
                  { label: "Depósitos", value: selectedReport.total_deposits_ars, icon: TrendingUp, color: "text-arbi-green" },
                  { label: "Retiros", value: selectedReport.total_withdrawals_ars, icon: TrendingDown, color: "text-arbi-red" },
                  { label: "Saldo final", value: selectedReport.final_balance_ars, icon: ArrowUpDown, color: selectedReport.final_balance_ars >= 0 ? "text-arbi-green" : "text-arbi-red" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-[#161B27] border border-[#1E2534] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Icon className={cn("w-3.5 h-3.5", color)} />
                    </div>
                    <p className={cn("font-mono font-bold", color)}>{formatCurrency(value)}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Cuadre de trazabilidad */}
                <div className="lg:col-span-1">
                  <TraceabilitySummary report={selectedReport} />
                </div>

                {/* Match rate */}
                <div className="lg:col-span-2 bg-[#161B27] border border-[#1E2534] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">Estado de movimientos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-28">
                        <CheckCircle className="w-4 h-4 text-arbi-green" />
                        <span className="text-sm text-muted-foreground">Matcheados</span>
                      </div>
                      <div className="flex-1 h-2 bg-[#0F1117] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-arbi-green rounded-full transition-all duration-500"
                          style={{ width: `${selectedReport.matched_count + selectedReport.pending_count > 0 ? (selectedReport.matched_count / (selectedReport.matched_count + selectedReport.pending_count) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-arbi-green w-12 text-right">{selectedReport.matched_count}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-28">
                        <Clock className="w-4 h-4 text-arbi-yellow" />
                        <span className="text-sm text-muted-foreground">Pendientes</span>
                      </div>
                      <div className="flex-1 h-2 bg-[#0F1117] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-arbi-yellow rounded-full transition-all duration-500"
                          style={{ width: `${selectedReport.matched_count + selectedReport.pending_count > 0 ? (selectedReport.pending_count / (selectedReport.matched_count + selectedReport.pending_count) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-arbi-yellow w-12 text-right">{selectedReport.pending_count}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#1E2534]">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Ganancia operativa</p>
                        <p className={cn("font-mono font-bold text-base", selectedReport.total_profit_ars >= 0 ? "text-arbi-green" : "text-arbi-red")}>
                          {selectedReport.total_profit_ars >= 0 ? "+" : ""}{formatCurrency(selectedReport.total_profit_ars)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Total movimientos</p>
                        <p className="font-mono font-bold text-base text-white">{selectedReport.entries.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    {selectedReport.status === "draft" && (
                      <button
                        onClick={async () => {
                          if (!confirm("¿Confirmar y cerrar este reporte?")) return;
                          await api.post(`/traceability/${selectedReport.id}/confirm`);
                          fetchReport(selectedReport.id);
                          fetchReports();
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-arbi-green/10 text-arbi-green hover:bg-arbi-green/20 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirmar reporte
                      </button>
                    )}
                    <button
                      onClick={() => setShowNewEntry(true)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1E2534] text-muted-foreground hover:text-white hover:bg-[#2A3347] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar movimiento
                    </button>
                    <button
                      onClick={() => fetchReport(selectedReport.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1E2534] text-muted-foreground hover:text-white hover:bg-[#2A3347] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Recalcular
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabla de movimientos */}
              <div className="bg-[#161B27] border border-[#1E2534] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2534]">
                  <div className="flex gap-1">
                    {(Object.entries(TAB_LABELS) as [Tab, string][]).map(([tab, label]) => {
                      const count = tab === "all" ? selectedReport.entries.length
                        : tab === "deposits" ? selectedReport.entries.filter(e => e.entry_type === "deposit").length
                        : tab === "withdrawals" ? selectedReport.entries.filter(e => e.entry_type === "withdrawal").length
                        : tab === "buys" ? selectedReport.entries.filter(e => e.entry_type === "buy" || e.entry_type === "p2p_buy").length
                        : tab === "sells" ? selectedReport.entries.filter(e => e.entry_type === "sell" || e.entry_type === "p2p_sell").length
                        : selectedReport.entries.filter(e => e.match_status === "pending").length;
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                            activeTab === tab ? "bg-arbi-green text-black" : "text-muted-foreground hover:text-white hover:bg-[#1E2534]"
                          )}
                        >
                          {label} {count > 0 && <span className={cn("ml-1", activeTab === tab ? "opacity-70" : "text-muted-foreground")}>({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setShowNewEntry(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-arbi-green/10 text-arbi-green hover:bg-arbi-green/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  {filteredEntries.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Sin movimientos en esta categoría
                    </div>
                  )}
                  {filteredEntries.map(entry => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      onMatchToggle={handleMatchToggle}
                      onDelete={handleDeleteEntry}
                      onEditLabel={setEditingEntry}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewReport && (
        <NewReportModal
          onClose={() => setShowNewReport(false)}
          onCreated={(r) => {
            setShowNewReport(false);
            fetchReports();
            fetchReport(r.id);
          }}
        />
      )}
      {showNewEntry && selectedReport && (
        <NewEntryModal
          reportId={selectedReport.id}
          onClose={() => setShowNewEntry(false)}
          onCreated={handleEntryCreated}
        />
      )}
      {editingEntry && (
        <EditLabelModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={handleLabelSaved}
        />
      )}
    </div>
  );
}

// ── Mock data (sin backend) ───────────────────────────────────────────────────

const MOCK_REPORTS: ReportSummary[] = [
  {
    id: "mock-1",
    name: "Cierre Abril 2026",
    period_start: "2026-04-01",
    period_end: "2026-04-22",
    status: "draft",
    initial_balance_ars: 5000000,
    final_balance_ars: 6250000,
    total_profit_ars: 450000,
    matched_count: 4,
    pending_count: 2,
    created_at: "2026-04-22T00:00:00Z",
  },
];

const MOCK_REPORT: TraceabilityReport = {
  ...MOCK_REPORTS[0],
  notes: null,
  initial_balance_usd: 0,
  initial_balance_usdt: 500,
  total_deposits_ars: 2000000,
  total_withdrawals_ars: 1200000,
  total_buys_ars: 3000000,
  total_sells_ars: 3450000,
  confirmed_at: null,
  entries: [
    {
      id: "e1", report_id: "mock-1", entry_type: "deposit", arbitrage_type: null,
      source_entity: "Banco Galicia", source_entity_type: "bank",
      target_entity: null, target_entity_type: null,
      currency: "ARS", amount: 2000000, amount_ars: 2000000,
      fee_ars: null, exchange_rate: null, match_status: "matched",
      matched_with_id: "e2", label: "Capital inicial Abril",
      observations: "Transferencia desde cuenta personal para fondear operaciones del mes",
      triangular_step: null, triangular_group_id: null,
      bank_tx_id: null, crypto_op_id: null, date: "2026-04-01",
    },
    {
      id: "e2", report_id: "mock-1", entry_type: "buy", arbitrage_type: "bank_exchange",
      source_entity: "Banco Galicia", source_entity_type: "bank",
      target_entity: "Binance", target_entity_type: "exchange",
      currency: "USDT", amount: 1500, amount_ars: 3000000,
      fee_ars: 15000, exchange_rate: 2000, match_status: "matched",
      matched_with_id: "e1", label: "Compra USDT Binance - Op#001",
      observations: null, triangular_step: null, triangular_group_id: null,
      bank_tx_id: null, crypto_op_id: null, date: "2026-04-02",
    },
    {
      id: "e3", report_id: "mock-1", entry_type: "sell", arbitrage_type: "exchange_exchange",
      source_entity: "Binance", source_entity_type: "exchange",
      target_entity: "Bybit", target_entity_type: "exchange",
      currency: "USDT", amount: 1500, amount_ars: 3450000,
      fee_ars: 10000, exchange_rate: 2300, match_status: "matched",
      matched_with_id: "e2", label: "Venta USDT Bybit - Op#001",
      observations: null, triangular_step: null, triangular_group_id: null,
      bank_tx_id: null, crypto_op_id: null, date: "2026-04-02",
    },
    {
      id: "e4", report_id: "mock-1", entry_type: "triangular_step", arbitrage_type: "triangular",
      source_entity: "Banco Nación", source_entity_type: "bank",
      target_entity: "Ripio", target_entity_type: "exchange",
      currency: "USD", amount: 500, amount_ars: 600000,
      fee_ars: 5000, exchange_rate: 1200, match_status: "pending",
      matched_with_id: null, label: "Triangular USD→USDT→ARS paso 1",
      observations: null, triangular_step: 1, triangular_group_id: "tri-001",
      bank_tx_id: null, crypto_op_id: null, date: "2026-04-15",
    },
    {
      id: "e5", report_id: "mock-1", entry_type: "withdrawal", arbitrage_type: "direct",
      source_entity: "Banco Galicia", source_entity_type: "bank",
      target_entity: null, target_entity_type: null,
      currency: "ARS", amount: 1200000, amount_ars: 1200000,
      fee_ars: null, exchange_rate: null, match_status: "pending",
      matched_with_id: null, label: "Retiro de ganancias",
      observations: "Retiro parcial de ganancias acumuladas. Pendiente de confirmar en el banco.",
      triangular_step: null, triangular_group_id: null,
      bank_tx_id: null, crypto_op_id: null, date: "2026-04-20",
    },
  ],
};
