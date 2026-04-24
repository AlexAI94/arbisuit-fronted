"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2, ChevronRight, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { EntityLogo } from "@/components/ui/EntitySelect";

// ── Types ─────────────────────────────────────────────────────────────────────

type FileSource = "bank" | "exchange";
type UploadStep = "upload" | "mapping" | "processing" | "done";

interface UploadedFile {
  file: File;
  source: FileSource;
  detectedColumns: string[];
  mapping: { date: string; amount: string; description: string };
  detectedSource: string;
}

interface MatchResult {
  matched: number;
  autoConfirmed: number;
  needsReview: number;
  unmatched: number;
  totalBank: number;
  totalExchange: number;
}

// ── Bank / Exchange sources ───────────────────────────────────────────────────

const BANK_SOURCES = [
  { id: "mercadopago", label: "Mercado Pago", domain: "mercadopago.com.ar" },
  { id: "brubank",     label: "Brubank",       domain: "brubank.com" },
  { id: "galicia",    label: "Banco Galicia",  domain: "galicia.com.ar" },
  { id: "bbva",       label: "BBVA",           domain: "bbva.com.ar" },
  { id: "santander",  label: "Santander",      domain: "santander.com.ar" },
  { id: "naranjaX",   label: "Naranja X",      domain: "naranjax.com" },
  { id: "uala",       label: "Ualá",           domain: "uala.com.ar" },
  { id: "otro",       label: "Otro banco",     domain: "" },
];

const EXCHANGE_SOURCES = [
  { id: "binance_p2p",  label: "Binance P2P",  domain: "binance.com" },
  { id: "binance_spot", label: "Binance Spot",  domain: "binance.com" },
  { id: "bitso",        label: "Bitso",         domain: "bitso.com" },
  { id: "lemon",        label: "Lemon Cash",    domain: "lemon.me" },
  { id: "ripio",        label: "Ripio",         domain: "ripio.com" },
  { id: "buenbit",      label: "Buenbit",       domain: "buenbit.com" },
  { id: "bybit",        label: "Bybit",         domain: "bybit.com" },
  { id: "otro",         label: "Otro exchange", domain: "" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectColumns(fileName: string): string[] {
  // Simulate column detection based on filename hints
  const lower = fileName.toLowerCase();
  if (lower.includes("binance") || lower.includes("p2p")) {
    return ["Order Number", "Date", "Type", "Asset", "Total Price", "Unit Price", "Counterpart", "Status"];
  }
  if (lower.includes("mercado") || lower.includes("mp")) {
    return ["Fecha", "Descripción", "Importe", "Saldo"];
  }
  return ["Fecha", "Concepto", "Débito", "Crédito", "Saldo"];
}

function guessMapping(columns: string[]): { date: string; amount: string; description: string } {
  const lower = columns.map((c) => c.toLowerCase());
  const date = columns[lower.findIndex((c) => c.includes("fecha") || c.includes("date"))] || columns[0];
  const amount =
    columns[lower.findIndex((c) => c.includes("importe") || c.includes("total price") || c.includes("monto") || c.includes("amount"))] ||
    columns[2];
  const description =
    columns[lower.findIndex((c) => c.includes("concepto") || c.includes("descripción") || c.includes("type") || c.includes("description"))] ||
    columns[1];
  return { date, amount, description };
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────

function DropZone({
  source,
  onFile,
  file,
  onRemove,
}: {
  source: FileSource;
  onFile: (f: File) => void;
  file: File | null;
  onRemove: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  const label = source === "bank" ? "Archivo bancario" : "Archivo del exchange";
  const icon = source === "bank" ? "🏦" : "🪙";
  const accent = source === "bank" ? "border-blue-500/40 bg-blue-500/5" : "border-arbi-green/40 bg-arbi-green/5";
  const accentHover = source === "bank" ? "hover:border-blue-500/60" : "hover:border-arbi-green/60";

  if (file) {
    return (
      <div className={`rounded-xl border ${source === "bank" ? "border-blue-500/30 bg-blue-500/5" : "border-arbi-green/30 bg-arbi-green/5"} p-4 flex items-center gap-3`}>
        <FileSpreadsheet className={`w-8 h-8 flex-shrink-0 ${source === "bank" ? "text-blue-400" : "text-arbi-green"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{file.name}</p>
          <p className="text-slate-500 text-xs">{formatBytes(file.size)}</p>
        </div>
        <button onClick={onRemove} className="text-slate-500 hover:text-arbi-red transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer p-6 text-center
        ${dragging ? (source === "bank" ? "border-blue-500/80 bg-blue-500/10" : "border-arbi-green/80 bg-arbi-green/10") : `${accent} ${accentHover}`}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.pdf"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
      />
      <span className="text-3xl block mb-2">{icon}</span>
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-slate-500 text-xs mt-1">CSV, Excel o PDF · arrastrá o hacé clic</p>
    </div>
  );
}

// ── Source Selector ───────────────────────────────────────────────────────────

function SourceSelector({
  type,
  value,
  onChange,
}: {
  type: FileSource;
  value: string;
  onChange: (v: string) => void;
}) {
  const items = type === "bank" ? BANK_SOURCES : EXCHANGE_SOURCES;
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`rounded-lg p-2.5 text-center border transition-colors ${
            value === item.id
              ? type === "bank"
                ? "border-blue-500/60 bg-blue-500/15 text-white"
                : "border-arbi-green/60 bg-arbi-green/15 text-white"
              : "border-white/5 bg-arbi-surface-2 text-slate-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <div className="flex justify-center mb-1">
            {item.domain
              ? <EntityLogo domain={item.domain} name={item.label} size={28} />
              : <span className="text-xl">🏦</span>
            }
          </div>
          <div className="text-xs leading-tight">{item.label}</div>
        </button>
      ))}
    </div>
  );
}

// ── Column Mapper ─────────────────────────────────────────────────────────────

function ColumnMapper({
  label,
  columns,
  mapping,
  onChange,
}: {
  label: string;
  columns: string[];
  mapping: { date: string; amount: string; description: string };
  onChange: (m: { date: string; amount: string; description: string }) => void;
}) {
  const fields: { key: keyof typeof mapping; label: string; desc: string }[] = [
    { key: "date", label: "Fecha", desc: "Cuándo ocurrió la operación" },
    { key: "amount", label: "Monto", desc: "Importe de la transacción" },
    { key: "description", label: "Descripción", desc: "Concepto o referencia" },
  ];

  return (
    <div className="bg-arbi-surface-2 rounded-xl border border-white/5 p-4 space-y-3">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      {fields.map((f) => (
        <div key={f.key} className="flex items-center gap-3">
          <div className="w-28 flex-shrink-0">
            <p className="text-white text-sm font-medium">{f.label}</p>
            <p className="text-slate-600 text-xs">{f.desc}</p>
          </div>
          <select
            value={mapping[f.key]}
            onChange={(e) => onChange({ ...mapping, [f.key]: e.target.value })}
            className="flex-1 bg-arbi-surface border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-arbi-green/50"
          >
            {columns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

// ── Processing Animation ──────────────────────────────────────────────────────

function ProcessingView({ onDone }: { onDone: (r: MatchResult) => void }) {
  const [currentPhase, setCurrentPhase] = useState(0);

  const phases = [
    { label: "Leyendo archivos y normalizando columnas…", duration: 1200 },
    { label: "Fase 1: buscando matches exactos…", duration: 1000 },
    { label: "Fase 2: algoritmo fuzzy (monto + fecha + texto)…", duration: 1400 },
    { label: "Fase 3: agrupando operaciones multi-tx…", duration: 1200 },
    { label: "Fase 4: sugerencias IA para casos ambiguos…", duration: 1600 },
    { label: "Generando reporte de conciliación…", duration: 800 },
  ];

  useState(() => {
    let idx = 0;
    const advance = () => {
      if (idx >= phases.length) {
        onDone({ matched: 47, autoConfirmed: 38, needsReview: 9, unmatched: 6, totalBank: 53, totalExchange: 61 });
        return;
      }
      setCurrentPhase(idx);
      idx++;
      setTimeout(advance, phases[idx - 1]?.duration ?? 1000);
    };
    advance();
  });

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-arbi-green/20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-arbi-green border-t-transparent animate-spin" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ArrowLeftRight className="w-6 h-6 text-arbi-green" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-white font-semibold">Conciliando operaciones</p>
        <p className="text-slate-400 text-sm">{phases[currentPhase]?.label}</p>
      </div>
      <div className="w-64 space-y-1.5">
        {phases.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
              i < currentPhase ? "bg-arbi-green" : i === currentPhase ? "border-2 border-arbi-green animate-pulse" : "border border-white/10"
            }`}>
              {i < currentPhase && <CheckCircle2 className="w-3 h-3 text-black" />}
            </div>
            <span className={`text-xs ${i <= currentPhase ? "text-slate-300" : "text-slate-600"}`}>
              {i === 0 ? "Normalización" : `Fase ${i}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Results View ──────────────────────────────────────────────────────────────

function ResultsView({ result }: { result: MatchResult }) {
  const matchRate = Math.round((result.matched / result.totalBank) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-arbi-green/20 border-2 border-arbi-green/40 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-arbi-green" />
        </div>
        <h2 className="text-white text-xl font-bold">Conciliación completada</h2>
        <p className="text-slate-400 text-sm mt-1">{result.totalBank} transacciones bancarias · {result.totalExchange} operaciones cripto</p>
      </div>

      {/* Match rate */}
      <div className="bg-arbi-surface-2 rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 text-sm">Tasa de conciliación</span>
          <span className="text-arbi-green font-bold text-xl">{matchRate}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2">
          <div className="bg-arbi-green rounded-full h-2 transition-all" style={{ width: `${matchRate}%` }} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Auto-confirmados", value: result.autoConfirmed, color: "text-arbi-green", bg: "bg-arbi-green/10 border-arbi-green/20", icon: "✅" },
          { label: "Para revisar", value: result.needsReview, color: "text-arbi-yellow", bg: "bg-arbi-yellow/10 border-arbi-yellow/20", icon: "⚠️" },
          { label: "Sin conciliar", value: result.unmatched, color: "text-arbi-red", bg: "bg-arbi-red/10 border-arbi-red/20", icon: "❌" },
          { label: "Total matches", value: result.matched, color: "text-white", bg: "bg-white/5 border-white/10", icon: "🔗" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {result.needsReview > 0 && (
        <div className="bg-arbi-yellow/10 border border-arbi-yellow/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-arbi-yellow flex-shrink-0" />
          <div>
            <p className="text-arbi-yellow font-medium text-sm">Revisión pendiente</p>
            <p className="text-slate-400 text-xs">{result.needsReview} matches tienen confianza entre 60-84% y requieren tu aprobación.</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/reconciliations"
          className="flex-1 py-3 rounded-xl bg-arbi-green text-arbi-surface font-semibold text-sm text-center hover:bg-arbi-green/90 transition-colors flex items-center justify-center gap-2"
        >
          Revisar conciliaciones <ChevronRight className="w-4 h-4" />
        </Link>
        <Link
          href="/dashboard/importar"
          onClick={() => window.location.reload()}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
        >
          Nueva importación
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ImportarPage() {
  const [step, setStep] = useState<UploadStep>("upload");
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [exchangeFile, setExchangeFile] = useState<File | null>(null);
  const [bankSource, setBankSource] = useState("mercadopago");
  const [exchangeSource, setExchangeSource] = useState("binance_p2p");
  const [bankMapping, setBankMapping] = useState({ date: "", amount: "", description: "" });
  const [exchangeMapping, setExchangeMapping] = useState({ date: "", amount: "", description: "" });
  const [bankColumns, setBankColumns] = useState<string[]>([]);
  const [exchangeColumns, setExchangeColumns] = useState<string[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);

  const handleBankFile = (f: File) => {
    setBankFile(f);
    const cols = detectColumns(f.name);
    setBankColumns(cols);
    setBankMapping(guessMapping(cols));
  };

  const handleExchangeFile = (f: File) => {
    setExchangeFile(f);
    const cols = detectColumns(f.name);
    setExchangeColumns(cols);
    setExchangeMapping(guessMapping(cols));
  };

  const canProceed = bankFile && exchangeFile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Importar archivos</h1>
        <p className="text-slate-400 mt-1">Subí tu resumen bancario y el historial del exchange para conciliar</p>
      </div>

      {/* Progress */}
      {step !== "done" && (
        <div className="flex items-center gap-2">
          {[
            { id: "upload", label: "Archivos" },
            { id: "mapping", label: "Columnas" },
            { id: "processing", label: "Procesando" },
          ].map((s, i, arr) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 ${step === s.id ? "text-arbi-green" : ["upload","mapping","processing","done"].indexOf(step) > i ? "text-arbi-green/60" : "text-slate-600"}`}>
                <div className={`w-6 h-6 rounded-full border text-xs flex items-center justify-center font-medium ${step === s.id ? "border-arbi-green bg-arbi-green/20 text-arbi-green" : ["upload","mapping","processing","done"].indexOf(step) > i ? "border-arbi-green/40 bg-arbi-green/10 text-arbi-green/60" : "border-white/10 text-slate-600"}`}>
                  {["upload","mapping","processing","done"].indexOf(step) > i ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="flex-1 h-px bg-white/5" />}
            </div>
          ))}
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Bank */}
          <div className="bg-arbi-surface-2 rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              🏦 <span>Archivo bancario</span>
            </h2>
            <DropZone source="bank" onFile={handleBankFile} file={bankFile} onRemove={() => setBankFile(null)} />
            <div>
              <p className="text-slate-500 text-xs mb-2">¿De qué banco es el archivo?</p>
              <SourceSelector type="bank" value={bankSource} onChange={setBankSource} />
            </div>
          </div>

          {/* Exchange */}
          <div className="bg-arbi-surface-2 rounded-xl border border-white/5 p-5 space-y-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              🪙 <span>Archivo del exchange</span>
            </h2>
            <DropZone source="exchange" onFile={handleExchangeFile} file={exchangeFile} onRemove={() => setExchangeFile(null)} />
            <div>
              <p className="text-slate-500 text-xs mb-2">¿De qué exchange es el archivo?</p>
              <SourceSelector type="exchange" value={exchangeSource} onChange={setExchangeSource} />
            </div>
          </div>

          <button
            disabled={!canProceed}
            onClick={() => setStep("mapping")}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
              canProceed
                ? "bg-arbi-green text-arbi-surface hover:bg-arbi-green/90"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            {canProceed ? <>Continuar <ChevronRight className="w-4 h-4" /></> : "Subí ambos archivos para continuar"}
          </button>
        </div>
      )}

      {/* Step: Mapping */}
      {step === "mapping" && (
        <div className="space-y-5">
          <div className="bg-arbi-green/10 border border-arbi-green/20 rounded-xl p-4">
            <p className="text-arbi-green text-sm font-medium">Detección automática completada</p>
            <p className="text-slate-400 text-xs mt-0.5">
              Revisá que las columnas detectadas sean correctas. Si no, seleccioná las correctas.
            </p>
          </div>

          <ColumnMapper
            label="Archivo bancario"
            columns={bankColumns.length ? bankColumns : ["Fecha", "Descripción", "Importe", "Saldo"]}
            mapping={bankMapping}
            onChange={setBankMapping}
          />

          <ColumnMapper
            label="Archivo del exchange"
            columns={exchangeColumns.length ? exchangeColumns : ["Date", "Type", "Amount", "Price", "Status"]}
            mapping={exchangeMapping}
            onChange={setExchangeMapping}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setStep("upload")}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep("processing")}
              className="flex-1 py-3 rounded-xl bg-arbi-green text-arbi-surface font-semibold text-sm hover:bg-arbi-green/90 transition-colors flex items-center justify-center gap-2"
            >
              Iniciar conciliación <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <div className="bg-arbi-surface-2 rounded-xl border border-white/5 p-6">
          <ProcessingView
            onDone={(r) => {
              setResult(r);
              setStep("done");
            }}
          />
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <div className="bg-arbi-surface-2 rounded-xl border border-white/5 p-6">
          <ResultsView result={result} />
        </div>
      )}
    </div>
  );
}
