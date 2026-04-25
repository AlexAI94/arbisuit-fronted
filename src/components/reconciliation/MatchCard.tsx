"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, ArrowRight, ArrowDown, ArrowDownLeft, ArrowUpRight,
  Zap, Brain, GitMerge, User, Loader2, ChevronDown, ChevronUp, Building2
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { EntityLogo } from "@/components/ui/EntitySelect";

export interface MatchItem {
  id: string;
  match_type: "exact" | "fuzzy" | "multi_tx" | "ai_suggested" | "manual";
  match_score: number;
  notes: string | null;
  matched_by: "engine" | "user";
  amount_diff_pct: number | null;
  spread_local: number | null;
  spread_pct: number | null;
  bank_date: string | null;
  bank_amount: number | null;
  bank_direction: string | null;
  bank_description: string | null;
  bank_counterpart: string | null;
  crypto_exchange: string | null;
  crypto_asset: string | null;
  crypto_op_type: string | null;
  crypto_total_local: number | null;
  crypto_date: string | null;
}

interface MatchCardProps {
  item: MatchItem;
  onApproved: () => void;
  onRejected: () => void;
}

const MATCH_TYPE_CONFIG = {
  exact:        { label: "Exacto",   icon: Zap,      color: "text-arbi-green",          bg: "bg-arbi-green-dim" },
  fuzzy:        { label: "Fuzzy",    icon: GitMerge, color: "text-blue-400",            bg: "bg-blue-400/10" },
  multi_tx:     { label: "Multi-tx", icon: GitMerge, color: "text-arbi-yellow",         bg: "bg-arbi-yellow-dim" },
  ai_suggested: { label: "IA",       icon: Brain,    color: "text-purple-400",          bg: "bg-purple-400/10" },
  manual:       { label: "Manual",   icon: User,     color: "text-muted-foreground",    bg: "bg-muted/30" },
};

const OP_TYPE_LABELS: Record<string, string> = {
  p2p_sell: "Venta P2P", p2p_buy: "Compra P2P",
  sell: "Venta Spot",    buy: "Compra Spot",
  otc: "OTC",            transfer: "Transferencia",
};

// Mapeo nombre exchange → dominio para logo
const EXCHANGE_DOMAINS: Record<string, string> = {
  binance: "binance.com", bybit: "bybit.com", okx: "okx.com",
  bitget: "bitget.com", kucoin: "kucoin.com", mexc: "mexc.com",
  "gate.io": "gate.io", bingx: "bingx.com", kraken: "kraken.com",
  coinbase: "coinbase.com", bitfinex: "bitfinex.com", htx: "htx.com",
  "lemon cash": "lemon.me", lemon: "lemon.me", buenbit: "buenbit.com",
  ripio: "ripio.com", bitso: "bitso.com", fiwind: "fiwind.io",
  "cocos crypto": "cocos.com.ar", decrypto: "decrypto.la",
  tiendacrypto: "tiendacrypto.com", criptala: "criptala.com",
};

function exchangeDomain(name: string | null): string {
  if (!name) return "";
  return EXCHANGE_DOMAINS[name.toLowerCase()] ?? "";
}

export function MatchCard({ item, onApproved, onRejected }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  const config = MATCH_TYPE_CONFIG[item.match_type];
  const Icon = config.icon;
  const needsApproval = item.matched_by === "engine" && item.match_score < 0.85;
  const isAutoConfirmed = item.matched_by === "engine" && item.match_score >= 0.85;
  const scorePercent = Math.round(item.match_score * 100);
  const exchDomain = exchangeDomain(item.crypto_exchange);

  const handleApprove = async () => {
    setLoadingApprove(true);
    try { await api.post(`/reconciliations/items/${item.id}/approve`, { item_id: item.id }); onApproved(); }
    finally { setLoadingApprove(false); }
  };

  const handleReject = async () => {
    setLoadingReject(true);
    try { await api.delete(`/reconciliations/items/${item.id}/reject`, { data: { item_id: item.id } }); onRejected(); }
    finally { setLoadingReject(false); }
  };

  return (
    <div className={cn(
      "bg-[#161B27] border rounded-xl overflow-hidden transition-colors",
      needsApproval ? "border-arbi-yellow/30" : "border-[#1E2534]",
    )}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0", config.bg, config.color)}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 h-1.5 bg-[#1E2534] rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all",
                item.match_score >= 0.85 ? "bg-arbi-green" :
                item.match_score >= 0.60 ? "bg-arbi-yellow" : "bg-arbi-red"
              )}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <span className={cn("text-xs font-mono font-medium flex-shrink-0",
            item.match_score >= 0.85 ? "text-arbi-green" :
            item.match_score >= 0.60 ? "text-arbi-yellow" : "text-arbi-red"
          )}>{scorePercent}%</span>
        </div>
        {isAutoConfirmed && (
          <span className="text-xs text-arbi-green flex items-center gap-1 flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
          </span>
        )}
        {item.matched_by === "user" && (
          <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
            <User className="w-3 h-3" /> Aprobado
          </span>
        )}
        {needsApproval && <span className="text-xs text-arbi-yellow flex-shrink-0 font-medium">Revisar</span>}
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Banco ↔ Exchange — responsive */}
      <div className="px-4 pb-3 flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-stretch sm:items-center">

        {/* Banco */}
        <div className="bg-[#0F1117] rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Banco</span>
            {item.bank_direction === "credit"
              ? <ArrowDownLeft className="w-3.5 h-3.5 text-arbi-green ml-auto" />
              : <ArrowUpRight className="w-3.5 h-3.5 text-arbi-red ml-auto" />}
          </div>
          <p className={cn("text-lg font-bold font-mono",
            item.bank_direction === "credit" ? "text-arbi-green" : "text-arbi-red"
          )}>
            {item.bank_direction === "credit" ? "+" : "-"}{formatCurrency(item.bank_amount || 0)}
          </p>
          <p className="text-xs text-muted-foreground">{item.bank_date ? formatDate(item.bank_date) : "—"}</p>
          <p className="text-xs text-foreground truncate">{item.bank_description || "—"}</p>
          {item.bank_counterpart && <p className="text-xs text-muted-foreground truncate">{item.bank_counterpart}</p>}
        </div>

        {/* Flecha — horizontal en desktop, vertical en mobile */}
        <div className="flex justify-center">
          <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground flex-shrink-0" />
          <ArrowDown className="sm:hidden w-4 h-4 text-muted-foreground flex-shrink-0" />
        </div>

        {/* Exchange */}
        <div className="bg-[#0F1117] rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 mb-2">
            {exchDomain
              ? <EntityLogo domain={exchDomain} name={item.crypto_exchange ?? ""} size={16} />
              : <div className="w-4 h-4 rounded-full bg-[#1E2534] flex items-center justify-center text-[8px] text-slate-400">EX</div>
            }
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {item.crypto_exchange || "Exchange"}
            </span>
          </div>
          <p className="text-lg font-bold font-mono text-foreground">
            {formatCurrency(item.crypto_total_local || 0)}
          </p>
          <p className="text-xs text-muted-foreground">{item.crypto_date ? formatDate(item.crypto_date) : "—"}</p>
          <p className="text-xs text-foreground">{item.crypto_asset} · {OP_TYPE_LABELS[item.crypto_op_type || ""] || item.crypto_op_type}</p>
          {item.spread_local != null && (
            <p className={cn("text-xs font-medium",
              (item.spread_pct || 0) > 0 ? "text-arbi-green" : "text-muted-foreground"
            )}>
              Spread: {formatCurrency(item.spread_local)} ({item.spread_pct?.toFixed(2)}%)
            </p>
          )}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-[#1E2534] pt-3 space-y-2">
          {item.notes && (
            <p className="text-xs text-muted-foreground bg-[#0F1117] rounded-lg px-3 py-2">{item.notes}</p>
          )}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><p className="text-muted-foreground">Δ Monto</p><p className="text-foreground font-mono">{item.amount_diff_pct?.toFixed(2) || "0"}%</p></div>
            <div><p className="text-muted-foreground">Tipo match</p><p className="text-foreground capitalize">{item.match_type.replace("_", " ")}</p></div>
            <div><p className="text-muted-foreground">Confirmado por</p><p className="text-foreground capitalize">{item.matched_by === "engine" ? "Motor" : "Usuario"}</p></div>
          </div>
        </div>
      )}

      {/* Acciones */}
      {needsApproval && (
        <div className="px-4 py-3 border-t border-[#1E2534] flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loadingApprove || loadingReject}
            className="flex-1 flex items-center justify-center gap-1.5 bg-arbi-green-dim hover:bg-arbi-green/20 border border-arbi-green/20 hover:border-arbi-green/40 text-arbi-green text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingApprove ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Aprobar match
          </button>
          <button
            onClick={handleReject}
            disabled={loadingApprove || loadingReject}
            className="flex-1 flex items-center justify-center gap-1.5 bg-arbi-red-dim hover:bg-arbi-red/20 border border-arbi-red/20 hover:border-arbi-red/40 text-arbi-red text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingReject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}
