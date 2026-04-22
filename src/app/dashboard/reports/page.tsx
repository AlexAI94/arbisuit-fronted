"use client";

import { useState } from "react";
import {
  FileText, FileSpreadsheet, Download, Calendar,
  CheckCircle2, Loader2, AlertCircle, Info
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const WORKSPACE_ID = "demo-workspace";

type Format = "pdf" | "excel";

interface DownloadState {
  loading: boolean;
  error: string;
  done: boolean;
}

export default function ReportsPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstDay = today.substring(0, 8) + "01";

  const [periodStart, setPeriodStart] = useState(firstDay);
  const [periodEnd, setPeriodEnd] = useState(today);
  const [reconciliationId, setReconciliationId] = useState("");
  const [state, setState] = useState<Record<Format, DownloadState>>({
    pdf:   { loading: false, error: "", done: false },
    excel: { loading: false, error: "", done: false },
  });

  const handleDownload = async (format: Format) => {
    setState(prev => ({ ...prev, [format]: { loading: true, error: "", done: false } }));

    try {
      const params = new URLSearchParams({
        format,
        period_start: periodStart,
        period_end: periodEnd,
        ...(reconciliationId ? { reconciliation_id: reconciliationId } : {}),
      });

      const response = await api.get(
        `/reports/${WORKSPACE_ID}/download?${params}`,
        { responseType: "blob" }
      );

      // Crear link de descarga
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const filename = `arbisuite_${periodStart}_${periodEnd}.${ext}`;
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setState(prev => ({ ...prev, [format]: { loading: false, error: "", done: true } }));
      setTimeout(() => setState(prev => ({ ...prev, [format]: { loading: false, error: "", done: false } })), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Error al generar el reporte";
      setState(prev => ({ ...prev, [format]: { loading: false, error: msg, done: false } }));
    }
  };

  const REPORT_FORMATS = [
    {
      format: "pdf" as Format,
      icon: FileText,
      title: "Reporte PDF",
      description: "Documento profesional con portada, resumen ejecutivo y tabla de conciliaciones. Ideal para presentar a contadores.",
      badge: "Para contadores",
      badgeColor: "text-arbi-green bg-arbi-green-dim border-arbi-green/20",
      sections: [
        "Portada con datos del período",
        "Resumen ejecutivo con KPIs",
        "Tabla de conciliaciones detallada",
        "Listado de transacciones sin match",
        "Nota contable al pie",
      ],
    },
    {
      format: "excel" as Format,
      icon: FileSpreadsheet,
      title: "Reporte Excel",
      description: "Workbook con 4 hojas: Resumen, Detalle de matches, Sin match y Serie diaria lista para graficar.",
      badge: "Para análisis",
      badgeColor: "text-arbi-yellow bg-arbi-yellow-dim border-arbi-yellow/20",
      sections: [
        "Hoja: KPIs y resumen",
        "Hoja: Detalle de conciliaciones",
        "Hoja: Transacciones sin match",
        "Hoja: Serie temporal diaria",
      ],
    },
  ];

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reportes</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Exportá tus conciliaciones con trazabilidad completa para uso contable o análisis
        </p>
      </div>

      {/* Configuración del período */}
      <div className="bg-[#161B27] border border-[#1E2534] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-arbi-green" />
          <h2 className="text-sm font-semibold text-foreground">Período del reporte</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <input
              type="date"
              value={periodStart}
              onChange={e => setPeriodStart(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green focus:border-arbi-green transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <input
              type="date"
              value={periodEnd}
              onChange={e => setPeriodEnd(e.target.value)}
              className="w-full bg-[#0F1117] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-arbi-green focus:border-arbi-green transition-colors"
            />
          </div>
        </div>

        {/* Atajos de período */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Este mes", start: firstDay, end: today },
            {
              label: "Mes anterior",
              start: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().substring(0, 8) + "01"; })(),
              end: (() => { const d = new Date(); d.setDate(0); return d.toISOString().split("T")[0]; })(),
            },
            {
              label: "Últimos 7 días",
              start: (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().split("T")[0]; })(),
              end: today,
            },
          ].map(({ label, start, end }) => (
            <button
              key={label}
              onClick={() => { setPeriodStart(start); setPeriodEnd(end); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs border transition-colors",
                periodStart === start && periodEnd === end
                  ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                  : "border-[#1E2534] text-muted-foreground hover:text-foreground hover:border-[#2A3347]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-2.5 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-400/80">
          El reporte incluye todas las conciliaciones confirmadas y sugeridas del período seleccionado,
          más las transacciones bancarias sin match pendientes de revisión.
        </p>
      </div>

      {/* Formatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_FORMATS.map(({ format, icon: Icon, title, description, badge, badgeColor, sections }) => {
          const s = state[format];
          return (
            <div key={format} className="bg-[#161B27] border border-[#1E2534] rounded-xl p-5 space-y-4 hover:border-[#2A3347] transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#1E2534] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded border", badgeColor)}>
                      {badge}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

              {/* Secciones incluidas */}
              <ul className="space-y-1">
                {sections.map(s => (
                  <li key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-arbi-green flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>

              {/* Error */}
              {s.error && (
                <div className="flex items-center gap-2 bg-arbi-red-dim border border-arbi-red/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 text-arbi-red flex-shrink-0" />
                  <p className="text-xs text-arbi-red">{s.error}</p>
                </div>
              )}

              {/* Botón */}
              <button
                onClick={() => handleDownload(format)}
                disabled={s.loading || !periodStart || !periodEnd}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  s.done
                    ? "bg-arbi-green-dim border border-arbi-green/30 text-arbi-green"
                    : "bg-[#1E2534] hover:bg-[#2A3347] border border-[#2A3347] hover:border-[#3A4A6A] text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {s.loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                ) : s.done ? (
                  <><CheckCircle2 className="w-4 h-4" /> Descargado</>
                ) : (
                  <><Download className="w-4 h-4" /> Descargar {format.toUpperCase()}</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
