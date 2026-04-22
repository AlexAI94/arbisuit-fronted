"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    id: 1,
    icon: "🧭",
    title: "Bienvenido a Orbix",
    subtitle: "Tu plataforma de conciliación cripto-bancaria",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Orbix te permite cruzar automáticamente tus <span className="text-arbi-green font-semibold">movimientos bancarios</span> con
          tus <span className="text-arbi-green font-semibold">operaciones cripto</span> (P2P, Spot, OTC) para tener una conciliación perfecta.
        </p>
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: "📤", label: "Importás tus archivos" },
            { icon: "⚡", label: "El motor concilia solo" },
            { icon: "📊", label: "Generás reportes" },
          ].map((item) => (
            <div key={item.label} className="bg-arbi-surface-2 rounded-xl p-4 text-center border border-white/5">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm">
          No necesitás conectar APIs ni dar acceso a tus cuentas. Todo funciona con archivos que vos descargás.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    icon: "🏦",
    title: "Descargá tu resumen bancario",
    subtitle: "Cómo exportar movimientos de cada banco argentino",
    content: (
      <div className="space-y-3">
        <p className="text-slate-400 text-sm mb-4">Buscá la opción de exportar movimientos en tu banco y descargá el archivo CSV o Excel.</p>
        <div className="space-y-2">
          {[
            {
              bank: "Mercado Pago",
              emoji: "💙",
              steps: "App → Actividad → ··· (arriba derecha) → Descargar movimientos → CSV",
            },
            {
              bank: "Brubank",
              emoji: "🟣",
              steps: "App → Movimientos → ícono exportar (arriba derecha) → Elegir período → Exportar",
            },
            {
              bank: "Banco Galicia",
              emoji: "🔴",
              steps: "Online banking → Mis cuentas → Movimientos → Exportar → Excel",
            },
            {
              bank: "BBVA",
              emoji: "🔵",
              steps: "Online banking → Cuentas → Movimientos → Descargar CSV",
            },
            {
              bank: "Santander",
              emoji: "🟥",
              steps: "Online banking → Cuentas → Movimientos → Exportar → CSV",
            },
            {
              bank: "HSBC / Supervielle / Macro",
              emoji: "🏛️",
              steps: "Online banking → Extractos → Descargar → Excel o CSV",
            },
          ].map((item) => (
            <div key={item.bank} className="bg-arbi-surface-2 rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span>{item.emoji}</span>
                <span className="text-white font-medium text-sm">{item.bank}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed pl-6">{item.steps}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: "🪙",
    title: "Descargá tu historial del exchange",
    subtitle: "Cómo exportar operaciones de cada plataforma cripto",
    content: (
      <div className="space-y-3">
        <p className="text-slate-400 text-sm mb-4">Cada exchange tiene su propia sección de historial. Siempre buscá "exportar", "descargar" o "CSV".</p>
        <div className="space-y-2">
          {[
            {
              exchange: "Binance — P2P",
              emoji: "🟡",
              steps: "Órdenes → Historial P2P → Exportar → seleccioná rango de fechas → Descargar CSV",
            },
            {
              exchange: "Binance — Spot / Cripto",
              emoji: "🟡",
              steps: "Billetera → Historial de transacciones → Generar estado de cuenta → CSV",
            },
            {
              exchange: "Bitso",
              emoji: "🟢",
              steps: "Historial → filtrar por tipo → Descargar CSV (botón abajo a la derecha)",
            },
            {
              exchange: "Lemon Cash",
              emoji: "🍋",
              steps: "Actividad → Exportar movimientos → CSV o Excel",
            },
            {
              exchange: "Ripio",
              emoji: "🔷",
              steps: "Cuenta → Historial → Exportar → CSV",
            },
            {
              exchange: "Buenbit",
              emoji: "🔶",
              steps: "Cuenta → Movimientos → Exportar historial → CSV",
            },
            {
              exchange: "OKX / Bybit / KuCoin",
              emoji: "🌐",
              steps: "Assets → Transaction History → Export → CSV (varía por plataforma)",
            },
          ].map((item) => (
            <div key={item.exchange} className="bg-arbi-surface-2 rounded-lg p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span>{item.emoji}</span>
                <span className="text-white font-medium text-sm">{item.exchange}</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed pl-6">{item.steps}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 4,
    icon: "📂",
    title: "Importá los archivos",
    subtitle: "Formatos soportados: CSV, Excel (.xlsx) y PDF",
    content: (
      <div className="space-y-4">
        <p className="text-slate-300 leading-relaxed">
          Desde el menú <span className="text-arbi-green font-semibold">Importar</span> subís tus archivos.
          Orbix detecta automáticamente el formato y las columnas.
        </p>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Subí el archivo bancario",
              desc: "CSV o Excel con tus movimientos en pesos",
            },
            {
              step: "2",
              title: "Subí el archivo del exchange",
              desc: "CSV con tus operaciones cripto del mismo período",
            },
            {
              step: "3",
              title: "Confirmá las columnas",
              desc: "Si la detección automática falla, indicás cuál columna es fecha, monto y descripción",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-arbi-green/20 border border-arbi-green/40 flex items-center justify-center text-arbi-green font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{item.title}</div>
                <div className="text-slate-500 text-xs mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-arbi-green/10 border border-arbi-green/20 rounded-lg p-3">
          <p className="text-arbi-green text-xs">
            💡 Tip: importá siempre el mismo período en ambos archivos (ej: todo el mes de marzo) para que la conciliación sea completa.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    icon: "⚡",
    title: "El motor de conciliación",
    subtitle: "4 fases automáticas para encontrar cada match",
    content: (
      <div className="space-y-3">
        <p className="text-slate-400 text-sm">
          El motor analiza cada transacción bancaria e intenta vincularla con una o más operaciones cripto.
        </p>
        <div className="space-y-2">
          {[
            {
              phase: "Fase 1",
              label: "Exacto",
              color: "text-arbi-green",
              bg: "bg-arbi-green/10 border-arbi-green/20",
              desc: "Mismo monto y fecha → match automático al 100%",
            },
            {
              phase: "Fase 2",
              label: "Fuzzy",
              color: "text-arbi-yellow",
              bg: "bg-arbi-yellow/10 border-arbi-yellow/20",
              desc: "Monto y fecha similares → score de similitud, sugiere match",
            },
            {
              phase: "Fase 3",
              label: "Multi-tx",
              color: "text-blue-400",
              bg: "bg-blue-400/10 border-blue-400/20",
              desc: "1 transferencia bancaria = N operaciones cripto (ej: consolidación del día)",
            },
            {
              phase: "Fase 4",
              label: "IA",
              color: "text-purple-400",
              bg: "bg-purple-400/10 border-purple-400/20",
              desc: "GPT analiza descripción y sugiere el match más probable",
            },
          ].map((item) => (
            <div key={item.phase} className={`rounded-lg p-3 border ${item.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${item.color}`}>{item.phase}</span>
                <span className="text-white text-sm font-medium">{item.label}</span>
              </div>
              <p className="text-slate-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-xs">
          Los matches con score ≥ 85% se aprueban solos. El resto los revisás vos en la pantalla de Conciliación.
        </p>
      </div>
    ),
  },
  {
    id: 6,
    icon: "📊",
    title: "Reportes y alertas",
    subtitle: "Exportá para contaduría y recibí alertas por Telegram",
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          {[
            {
              icon: "📄",
              title: "Reporte PDF para el contador",
              desc: "Resumen mensual con todas las operaciones conciliadas, spreads y P&L. Listo para presentar.",
            },
            {
              icon: "📊",
              title: "Excel detallado",
              desc: "Todas las transacciones en formato tabla para análisis propio o archivo histórico.",
            },
            {
              icon: "🤖",
              title: "Alertas por Telegram",
              desc: "Recibís notificaciones cuando hay operaciones sin conciliar, alertas fiscales y resumen diario.",
            },
            {
              icon: "⚠️",
              title: "Alertas fiscales",
              desc: "Orbix detecta automáticamente operaciones que podrían requerir declaración o que superan umbrales AFIP.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-white font-medium text-sm">{item.title}</div>
                <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-arbi-surface-2 rounded-lg p-3 border border-white/5 text-center">
          <p className="text-arbi-green font-semibold text-sm">¡Todo listo para empezar!</p>
          <p className="text-slate-500 text-xs mt-1">Podés volver a esta guía desde el menú → Guía de uso</p>
        </div>
      </div>
    ),
  },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem("arbisuite_onboarding_done");
    if (!done) setOpen(true);
  }, []);

  const close = () => {
    localStorage.setItem("arbisuite_onboarding_done", "1");
    setOpen(false);
  };

  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-arbi-surface rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{current.icon}</span>
            <div>
              <h2 className="text-white font-semibold text-base leading-tight">{current.title}</h2>
              <p className="text-slate-500 text-xs mt-0.5">{current.subtitle}</p>
            </div>
          </div>
          <button
            onClick={close}
            className="text-slate-500 hover:text-white transition-colors text-xl leading-none px-1"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 px-5 pt-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1 rounded-full transition-all ${
                i === step
                  ? "bg-arbi-green flex-1"
                  : i < step
                  ? "bg-arbi-green/40 w-6"
                  : "bg-white/10 w-6"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {current.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-white/5">
          <button
            onClick={close}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Saltar guía
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors"
              >
                Anterior
              </button>
            )}
            {isLast ? (
              <button
                onClick={close}
                className="px-5 py-2 rounded-lg bg-arbi-green text-arbi-surface font-semibold text-sm hover:bg-arbi-green/90 transition-colors"
              >
                Comenzar
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-lg bg-arbi-green text-arbi-surface font-semibold text-sm hover:bg-arbi-green/90 transition-colors"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
