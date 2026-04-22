"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell, BellOff, Plus, Trash2, ToggleLeft, ToggleRight,
  MessageCircle, CheckCircle2, XCircle, Copy, Loader2,
  AlertTriangle, TrendingUp, Clock, ShieldAlert, Calendar
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const WORKSPACE_ID = "demo-workspace";

interface Alert {
  id: string;
  alert_type: string;
  channel: string;
  threshold_value: number | null;
  schedule_hour: number | null;
  status: string;
  last_triggered: string | null;
  trigger_count: number;
}

interface TelegramStatus {
  linked: boolean;
  chat_id: string | null;
  username: string | null;
  linked_at: string | null;
}

interface LinkCode {
  code: string;
  expires_in_minutes: number;
  bot_username: string;
  instruction: string;
}

const ALERT_TYPE_CONFIG: Record<string, { label: string; desc: string; icon: React.ElementType; color: string; hasThreshold: boolean; hasHour: boolean }> = {
  daily_summary:       { label: "Resumen diario",        desc: "Recibí un resumen de profit y volumen cada día", icon: Calendar,     color: "text-arbi-green",  hasThreshold: false, hasHour: true },
  unmatched_threshold: { label: "Matcheos pendientes",   desc: "Alerta cuando hay N o más txs sin conciliar",   icon: Clock,        color: "text-arbi-yellow", hasThreshold: true,  hasHour: false },
  match_completed:     { label: "Motor completado",      desc: "Notificación al terminar el proceso de matcheo", icon: TrendingUp,   color: "text-blue-400",    hasThreshold: false, hasHour: false },
  fiscal_monthly:      { label: "Tope mensual",          desc: "Alerta al acercarte al límite mensual de facturación", icon: ShieldAlert, color: "text-arbi-red", hasThreshold: true, hasHour: false },
  fiscal_annual:       { label: "Tope anual",            desc: "Alerta al acercarte al límite anual de facturación",   icon: ShieldAlert, color: "text-arbi-red", hasThreshold: true, hasHour: false },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tgStatus, setTgStatus] = useState<TelegramStatus | null>(null);
  const [linkCode, setLinkCode] = useState<LinkCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [copied, setCopied] = useState(false);

  // Nuevo alert form
  const [newType, setNewType] = useState("daily_summary");
  const [newThreshold, setNewThreshold] = useState("");
  const [newHour, setNewHour] = useState(9);
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, tgRes] = await Promise.all([
        api.get(`/alerts/workspace/${WORKSPACE_ID}`),
        api.get("/alerts/telegram/status"),
      ]);
      setAlerts(alertsRes.data);
      setTgStatus(tgRes.data);
    } catch {
      setAlerts(MOCK_ALERTS);
      setTgStatus({ linked: false, chat_id: null, username: null, linked_at: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const { data } = await api.post(`/alerts/telegram/link-code?workspace_id=${WORKSPACE_ID}`);
      setLinkCode(data);
    } catch {
      setLinkCode(MOCK_LINK_CODE);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = async () => {
    if (!linkCode) return;
    await navigator.clipboard.writeText(`/vincular ${linkCode.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/toggle`);
      setAlerts(prev => prev.map(a => a.id === id
        ? { ...a, status: a.status === "active" ? "paused" : "active" }
        : a
      ));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch {}
  };

  const handleCreateAlert = async () => {
    setCreating(true);
    const config = ALERT_TYPE_CONFIG[newType];
    try {
      const payload: Record<string, unknown> = {
        alert_type: newType,
        channel: "telegram",
      };
      if (config.hasThreshold && newThreshold) payload.threshold_value = parseFloat(newThreshold);
      if (config.hasHour) payload.schedule_hour = newHour;

      const { data } = await api.post(`/alerts/workspace/${WORKSPACE_ID}`, payload);
      setAlerts(prev => [...prev, data]);
      setShowNewAlert(false);
      setNewThreshold("");
    } catch {
      // demo
      setAlerts(prev => [...prev, {
        id: Math.random().toString(),
        alert_type: newType,
        channel: "telegram",
        threshold_value: newThreshold ? parseFloat(newThreshold) : null,
        schedule_hour: config.hasHour ? newHour : null,
        status: "active",
        last_triggered: null,
        trigger_count: 0,
      }]);
      setShowNewAlert(false);
    } finally {
      setCreating(false);
    }
  };

  const typeConfig = ALERT_TYPE_CONFIG[newType];

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Alertas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Configurá notificaciones para Telegram sobre tus operaciones
        </p>
      </div>

      {/* Vinculación Telegram */}
      <div className={cn(
        "rounded-xl border p-5 space-y-4",
        tgStatus?.linked
          ? "bg-arbi-green-dim border-arbi-green/20"
          : "bg-[#161B27] border-[#1E2534]"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageCircle className={cn("w-5 h-5", tgStatus?.linked ? "text-arbi-green" : "text-muted-foreground")} />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Telegram</h2>
              {tgStatus?.linked
                ? <p className="text-xs text-arbi-green">Vinculado{tgStatus.username ? ` como @${tgStatus.username}` : ""}</p>
                : <p className="text-xs text-muted-foreground">Sin vincular</p>}
            </div>
          </div>
          {tgStatus?.linked
            ? <CheckCircle2 className="w-5 h-5 text-arbi-green" />
            : (
              <button
                onClick={handleGenerateCode}
                disabled={generatingCode}
                className="flex items-center gap-1.5 bg-arbi-green hover:bg-arbi-green/90 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {generatingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                Vincular Telegram
              </button>
            )}
        </div>

        {/* Código de vinculación */}
        {linkCode && !tgStatus?.linked && (
          <div className="bg-[#0F1117] rounded-lg p-4 space-y-3 border border-[#1E2534]">
            <div className="flex items-start gap-2.5">
              <div className="flex-1 space-y-2">
                <p className="text-xs text-muted-foreground">
                  1. Buscá <span className="text-foreground font-medium">@{linkCode.bot_username}</span> en Telegram
                </p>
                <p className="text-xs text-muted-foreground">
                  2. Enviá este comando:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#1E2534] rounded-lg px-3 py-2 text-sm font-mono text-arbi-green">
                    /vincular {linkCode.code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className={cn(
                      "p-2 rounded-lg transition-colors flex-shrink-0",
                      copied ? "bg-arbi-green-dim text-arbi-green" : "bg-[#1E2534] text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-arbi-yellow">
                  ⚡ Expira en {linkCode.expires_in_minutes} minutos
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Alertas configuradas
            {alerts.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">({alerts.length})</span>
            )}
          </h2>
          <button
            onClick={() => setShowNewAlert(true)}
            className="flex items-center gap-1.5 text-xs text-arbi-green hover:text-arbi-green/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva alerta
          </button>
        </div>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#161B27] border border-[#1E2534] rounded-xl animate-pulse" />
          ))
        ) : alerts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-[#161B27] border border-[#1E2534] rounded-xl">
            <Bell className="w-7 h-7 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay alertas configuradas</p>
            <button onClick={() => setShowNewAlert(true)} className="text-xs text-arbi-green mt-1 hover:underline">
              Crear la primera
            </button>
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = ALERT_TYPE_CONFIG[alert.alert_type];
            const Icon = cfg?.icon ?? Bell;
            const active = alert.status === "active";
            return (
              <div key={alert.id} className={cn(
                "bg-[#161B27] border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors",
                active ? "border-[#1E2534]" : "border-[#1E2534] opacity-60"
              )}>
                <div className={cn("p-1.5 rounded-lg bg-[#1E2534] flex-shrink-0")}>
                  <Icon className={cn("w-4 h-4", cfg?.color ?? "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cfg?.label ?? alert.alert_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.channel === "telegram" ? "📱 Telegram" : "📧 Email"}
                    {alert.threshold_value != null && ` · Tope: $${alert.threshold_value.toLocaleString("es-AR")}`}
                    {alert.schedule_hour != null && ` · ${alert.schedule_hour}:00hs`}
                    {alert.trigger_count > 0 && ` · ${alert.trigger_count} envíos`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => handleToggle(alert.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {active ? <ToggleRight className="w-5 h-5 text-arbi-green" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleDelete(alert.id)} className="text-muted-foreground hover:text-arbi-red transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal nueva alerta */}
      {showNewAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161B27] border border-[#1E2534] rounded-xl w-full max-w-md p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Nueva alerta</h3>
              <button onClick={() => setShowNewAlert(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo de alerta</label>
              <div className="space-y-1.5">
                {Object.entries(ALERT_TYPE_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setNewType(key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                        newType === key
                          ? "bg-arbi-green-dim border-arbi-green/30"
                          : "border-[#1E2534] hover:border-[#2A3347]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", cfg.color)} />
                      <div>
                        <p className={cn("text-xs font-medium", newType === key ? "text-arbi-green" : "text-foreground")}>{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Threshold */}
            {typeConfig?.hasThreshold && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {newType === "unmatched_threshold" ? "Cantidad mínima sin match" : "Límite (ARS)"}
                </label>
                <input
                  type="number"
                  value={newThreshold}
                  onChange={e => setNewThreshold(e.target.value)}
                  placeholder={newType === "unmatched_threshold" ? "ej: 5" : "ej: 1000000"}
                  className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green"
                />
              </div>
            )}

            {/* Hora */}
            {typeConfig?.hasHour && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hora de envío</label>
                <select
                  value={newHour}
                  onChange={e => setNewHour(parseInt(e.target.value))}
                  className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}:00 hs</option>
                  ))}
                </select>
              </div>
            )}

            {!tgStatus?.linked && (
              <div className="flex items-center gap-2 bg-arbi-yellow-dim border border-arbi-yellow/20 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-arbi-yellow flex-shrink-0" />
                <p className="text-xs text-arbi-yellow">Necesitás vincular Telegram primero para recibir alertas</p>
              </div>
            )}

            <button
              onClick={handleCreateAlert}
              disabled={creating}
              className="w-full bg-arbi-green hover:bg-arbi-green/90 disabled:opacity-50 text-black font-semibold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear alerta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_ALERTS: Alert[] = [
  { id: "a1", alert_type: "daily_summary", channel: "telegram", threshold_value: null, schedule_hour: 9, status: "active", last_triggered: "2026-04-07T09:00:00Z", trigger_count: 12 },
  { id: "a2", alert_type: "unmatched_threshold", channel: "telegram", threshold_value: 5, schedule_hour: null, status: "active", last_triggered: "2026-04-06T14:30:00Z", trigger_count: 3 },
  { id: "a3", alert_type: "fiscal_monthly", channel: "telegram", threshold_value: 5000000, schedule_hour: null, status: "paused", last_triggered: null, trigger_count: 0 },
];

const MOCK_LINK_CODE: LinkCode = {
  code: "AX7B9K2M",
  expires_in_minutes: 10,
  bot_username: "OrbixBot",
  instruction: "Enviá /vincular AX7B9K2M al bot",
};
