"use client";

import { useState, useCallback, useRef } from "react";
import { X, Upload, FileSpreadsheet, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface UploadModalProps {
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type FileCategory = "bank" | "exchange";
type UploadState = "idle" | "uploading" | "processing" | "done" | "error";

const EXCHANGES = ["binance", "bybit", "okx", "kucoin", "otro"];

export function UploadModal({ workspaceId, onClose, onSuccess }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<FileCategory>("bank");
  const [exchangeName, setExchangeName] = useState("binance");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState("");
  const [fileId, setFileId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ parsed: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/ingest/${id}/status`);
        if (data.status === "done") {
          clearInterval(pollRef.current!);
          setProgress({ parsed: data.parsed_count, total: data.row_count });
          setState("done");
          setTimeout(onSuccess, 1500);
        } else if (data.status === "error") {
          clearInterval(pollRef.current!);
          setState("error");
          setError("Error al procesar el archivo");
        }
      } catch {
        clearInterval(pollRef.current!);
      }
    }, 1500);
  };

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    setError("");

    const form = new FormData();
    form.append("file", file);
    form.append("workspace_id", workspaceId);
    form.append("file_category", category);
    if (category === "exchange") form.append("exchange_name", exchangeName);

    try {
      const { data } = await api.post("/ingest/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileId(data.id);
      setState("processing");
      startPolling(data.id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Error al subir el archivo");
      setState("error");
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".pdf")) return <FileText className="w-5 h-5 text-arbi-red" />;
    if (name.endsWith(".csv")) return <FileText className="w-5 h-5 text-arbi-green" />;
    return <FileSpreadsheet className="w-5 h-5 text-arbi-yellow" />;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161B27] border border-[#1E2534] rounded-xl w-full max-w-lg shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2534]">
          <h2 className="text-sm font-semibold text-foreground">Importar archivo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tipo de archivo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["bank", "exchange"] as FileCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-medium border transition-colors",
                    category === cat
                      ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                      : "border-[#1E2534] text-muted-foreground hover:text-foreground hover:border-[#2A3347]"
                  )}
                >
                  {cat === "bank" ? "Extracto bancario" : "Exchange / Cripto"}
                </button>
              ))}
            </div>
          </div>

          {/* Exchange selector */}
          {category === "exchange" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exchange</label>
              <div className="flex flex-wrap gap-2">
                {EXCHANGES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setExchangeName(ex)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                      exchangeName === ex
                        ? "bg-arbi-green-dim border-arbi-green/30 text-arbi-green"
                        : "border-[#1E2534] text-muted-foreground hover:border-[#2A3347] hover:text-foreground"
                    )}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone */}
          {state === "idle" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl py-10 px-6 text-center cursor-pointer transition-colors",
                dragOver
                  ? "border-arbi-green bg-arbi-green-dim"
                  : file
                  ? "border-arbi-green/40 bg-arbi-green/5"
                  : "border-[#1E2534] hover:border-[#2A3347] hover:bg-[#0F1117]"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  {getFileIcon(file.name)}
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB · Click para cambiar
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 bg-[#1E2534] rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Arrastrá tu archivo aquí
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      CSV, Excel o PDF · Máx 50MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estado: subiendo */}
          {state === "uploading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-arbi-green animate-spin" />
              <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
            </div>
          )}

          {/* Estado: procesando */}
          {state === "processing" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-arbi-green animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Procesando con IA...</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Detectando columnas y normalizando datos
                </p>
              </div>
              {/* Animated steps */}
              <div className="w-full space-y-1.5 mt-2">
                {[
                  "Leyendo estructura del archivo",
                  "Detectando columnas con IA",
                  "Parseando transacciones",
                  "Guardando en base de datos",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-arbi-green animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado: done */}
          {state === "done" && progress && (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 className="w-10 h-10 text-arbi-green" />
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">¡Archivo procesado!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {progress.parsed} de {progress.total} filas importadas correctamente
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {(state === "error" || error) && (
            <div className="flex items-start gap-2.5 bg-arbi-red-dim border border-arbi-red/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-arbi-red flex-shrink-0 mt-0.5" />
              <p className="text-xs text-arbi-red">{error || "Error desconocido"}</p>
            </div>
          )}

          {/* Footer */}
          {state === "idle" && (
            <button
              onClick={handleUpload}
              disabled={!file}
              className="w-full bg-arbi-green hover:bg-arbi-green/90 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
            >
              Importar y procesar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
