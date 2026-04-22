"use client";

import { useState } from "react";

const BANKS = [
  {
    name: "Mercado Pago",
    emoji: "💙",
    color: "border-blue-500/30 bg-blue-500/5",
    badge: "bg-blue-500/20 text-blue-300",
    steps: [
      "Abrí la app de Mercado Pago en tu celular",
      "Tocá en \"Actividad\" (íconos abajo de la pantalla)",
      "Tocá los tres puntos ··· arriba a la derecha",
      "Seleccioná \"Descargar movimientos\"",
      "Elegí el período y el formato CSV",
      "El archivo llega a tu email o se descarga directo",
    ],
    tip: "Podés filtrar por tipo de movimiento antes de exportar para tener solo transferencias.",
  },
  {
    name: "Brubank",
    emoji: "🟣",
    color: "border-purple-500/30 bg-purple-500/5",
    badge: "bg-purple-500/20 text-purple-300",
    steps: [
      "Abrí la app de Brubank",
      "Tocá en \"Movimientos\" en el menú principal",
      "Tocá el ícono de exportar (flecha hacia arriba) arriba a la derecha",
      "Elegí el rango de fechas",
      "Seleccioná formato CSV o Excel",
      "Descargá o compartí el archivo",
    ],
    tip: "Brubank permite exportar hasta 3 meses por vez.",
  },
  {
    name: "Banco Galicia",
    emoji: "🔴",
    color: "border-red-500/30 bg-red-500/5",
    badge: "bg-red-500/20 text-red-300",
    steps: [
      "Ingresá al homebanking de Galicia (web o app)",
      "Ir a \"Mis cuentas\" → seleccioná la cuenta",
      "Clic en \"Movimientos\"",
      "Elegí el período (hasta 3 meses)",
      "Clic en el botón \"Exportar\" → Excel",
      "Se descarga automáticamente",
    ],
    tip: "Si usás la app móvil, el ícono de exportar aparece arriba a la derecha en la pantalla de movimientos.",
  },
  {
    name: "BBVA",
    emoji: "🔵",
    color: "border-sky-500/30 bg-sky-500/5",
    badge: "bg-sky-500/20 text-sky-300",
    steps: [
      "Ingresá al homebanking de BBVA",
      "Ir a \"Cuentas\" → seleccioná la cuenta",
      "Clic en \"Movimientos\"",
      "Aplicá los filtros de fecha que necesitás",
      "Clic en \"Descargar\" → CSV",
    ],
    tip: "BBVA también permite descarga desde la app móvil en Cuenta → Movimientos → ícono de descarga.",
  },
  {
    name: "Santander",
    emoji: "🟥",
    color: "border-red-600/30 bg-red-600/5",
    badge: "bg-red-600/20 text-red-300",
    steps: [
      "Ingresá al homebanking de Santander",
      "Ir a \"Cuentas\" → seleccioná tu cuenta en pesos",
      "Clic en \"Movimientos\"",
      "Seleccioná el período",
      "Clic en \"Exportar\" → CSV o Excel",
    ],
    tip: "Si no ves el botón de exportar, probá desde un navegador de escritorio (no móvil).",
  },
  {
    name: "Naranja X",
    emoji: "🟠",
    color: "border-orange-500/30 bg-orange-500/5",
    badge: "bg-orange-500/20 text-orange-300",
    steps: [
      "Abrí la app de Naranja X",
      "Ir a \"Movimientos\"",
      "Tocá el ícono de filtro/exportar",
      "Elegí el mes a exportar",
      "Seleccioná CSV y descargá",
    ],
    tip: "Naranja X permite exportar mes a mes.",
  },
];

const EXCHANGES = [
  {
    name: "Binance — P2P",
    emoji: "🟡",
    color: "border-yellow-500/30 bg-yellow-500/5",
    badge: "bg-yellow-500/20 text-yellow-300",
    steps: [
      "Ingresá a Binance (web o app)",
      "Ir a \"Órdenes\" en el menú superior",
      "Seleccioná \"Historial P2P\"",
      "Filtrá por fecha y tipo (Compra/Venta)",
      "Clic en \"Exportar\" → seleccioná rango",
      "Descargá el CSV",
    ],
    tip: "El CSV de P2P incluye: fecha, moneda, cantidad, precio, contraparte y estado. Orbix usa fecha y monto para el match.",
  },
  {
    name: "Binance — Spot / Wallet",
    emoji: "🟡",
    color: "border-yellow-500/30 bg-yellow-500/5",
    badge: "bg-yellow-500/20 text-yellow-300",
    steps: [
      "Ir a \"Billetera\" → \"Historial de transacciones\"",
      "Clic en \"Generar estado de cuenta\"",
      "Seleccioná el período (hasta 3 meses por descarga)",
      "Elegí las monedas que querés incluir",
      "Descargá el CSV cuando esté listo (puede tardar unos minutos)",
    ],
    tip: "Para operaciones de conversión (swap), el historial está en Billetera → Conversión → Historial.",
  },
  {
    name: "Bitso",
    emoji: "🟢",
    color: "border-green-500/30 bg-green-500/5",
    badge: "bg-green-500/20 text-green-300",
    steps: [
      "Ingresá a Bitso (web preferentemente)",
      "Ir a \"Historial\" en el menú lateral",
      "Filtrá por tipo de transacción y período",
      "Clic en el botón de descarga (abajo a la derecha)",
      "Descargá el CSV",
    ],
    tip: "Bitso genera un CSV separado para depósitos, retiros y trades. Importá todos para mejor cobertura.",
  },
  {
    name: "Lemon Cash",
    emoji: "🍋",
    color: "border-lime-500/30 bg-lime-500/5",
    badge: "bg-lime-500/20 text-lime-300",
    steps: [
      "Abrí la app de Lemon Cash",
      "Ir a \"Actividad\" en la barra inferior",
      "Tocá el ícono de exportar (arriba a la derecha)",
      "Seleccioná el período",
      "Elegí CSV o Excel y descargá",
    ],
    tip: "Lemon incluye todas las operaciones: compras, ventas, swaps y transferencias en un solo archivo.",
  },
  {
    name: "Ripio",
    emoji: "🔷",
    color: "border-blue-400/30 bg-blue-400/5",
    badge: "bg-blue-400/20 text-blue-300",
    steps: [
      "Ingresá a Ripio (web o app)",
      "Ir a tu perfil → \"Historial\"",
      "Filtrá por período",
      "Clic en \"Exportar\" → CSV",
    ],
    tip: "Ripio permite exportar por tipo de operación (compra, venta, depósito, retiro).",
  },
  {
    name: "Buenbit",
    emoji: "🔶",
    color: "border-orange-400/30 bg-orange-400/5",
    badge: "bg-orange-400/20 text-orange-300",
    steps: [
      "Ingresá a Buenbit (web)",
      "Ir a \"Cuenta\" → \"Movimientos\"",
      "Seleccioná el período",
      "Clic en \"Exportar historial\" → CSV",
    ],
    tip: "Para P2P en Buenbit, el historial está en la sección específica de P2P.",
  },
  {
    name: "OKX / Bybit / KuCoin",
    emoji: "🌐",
    color: "border-slate-500/30 bg-slate-500/5",
    badge: "bg-slate-500/20 text-slate-300",
    steps: [
      "Ingresá a la plataforma desde un navegador de escritorio",
      "Buscar \"Transaction History\", \"Orders\" o \"Statement\"",
      "Filtrá por período y tipo de operación",
      "Clic en \"Export\" o \"Download\" → CSV",
    ],
    tip: "En exchanges internacionales, la opción de exportar suele estar en Assets → Transaction History.",
  },
];

type Tab = "bancos" | "exchanges" | "flujo";

export default function GuiaPage() {
  const [tab, setTab] = useState<Tab>("flujo");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Guía de uso</h1>
        <p className="text-slate-400 mt-1">Cómo funciona Orbix y cómo obtener tus archivos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-arbi-surface-2 rounded-xl p-1 w-fit">
        {(["flujo", "bancos", "exchanges"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? "bg-arbi-green text-arbi-surface"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "flujo" ? "Cómo funciona" : t === "bancos" ? "Bancos" : "Exchanges"}
          </button>
        ))}
      </div>

      {/* Cómo funciona */}
      {tab === "flujo" && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {[
              {
                n: "1",
                title: "Descargás tus archivos",
                desc: "Exportás el resumen de tu banco (CSV/Excel) y el historial de tu exchange (CSV). No se necesita ninguna API ni acceso a tus cuentas.",
                icon: "📥",
              },
              {
                n: "2",
                title: "Importás en Orbix",
                desc: "Subís los archivos desde la sección Importar. El sistema detecta automáticamente las columnas (fecha, monto, descripción). Si falla la detección, podés indicar manualmente qué columna es cuál.",
                icon: "📂",
              },
              {
                n: "3",
                title: "El motor concilia",
                desc: "Orbix corre 4 fases: primero busca matches exactos, luego fuzzy (por similitud), luego agrupa múltiples operaciones cripto para una sola transferencia bancaria, y finalmente usa IA para los casos difíciles.",
                icon: "⚡",
              },
              {
                n: "4",
                title: "Revisás y aprobás",
                desc: "Los matches con alta confianza se aprueban solos. Los demás aparecen en la cola de revisión con un score de confianza. Vos decidís aprobar o rechazar cada uno.",
                icon: "✅",
              },
              {
                n: "5",
                title: "Generás reportes",
                desc: "Con la conciliación aprobada, generás el reporte PDF para tu contador o el Excel detallado para tu archivo histórico. También podés configurar alertas automáticas por Telegram.",
                icon: "📊",
              },
            ].map((item) => (
              <div key={item.n} className="bg-arbi-surface-2 rounded-xl p-5 border border-white/5 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-arbi-green/20 border border-arbi-green/30 flex items-center justify-center text-arbi-green font-bold">
                    {item.n}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Motor detail */}
          <div className="bg-arbi-surface-2 rounded-xl p-5 border border-white/5">
            <h3 className="text-white font-semibold mb-4">Las 4 fases del motor de conciliación</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Fase 1 — Exacto", color: "text-arbi-green border-arbi-green/30 bg-arbi-green/10", desc: "Mismo monto ±0% y misma fecha. Se confirma automáticamente." },
                { label: "Fase 2 — Fuzzy", color: "text-arbi-yellow border-arbi-yellow/30 bg-arbi-yellow/10", desc: "Score por similitud de monto (55%), fecha (30%) y texto (15%). ≥85% auto-confirma." },
                { label: "Fase 3 — Multi-tx", color: "text-blue-400 border-blue-400/30 bg-blue-400/10", desc: "Suma de N operaciones cripto = 1 transferencia bancaria (subset-sum)." },
                { label: "Fase 4 — IA", color: "text-purple-400 border-purple-400/30 bg-purple-400/10", desc: "GPT analiza descripción, contraparte y contexto para sugerir match." },
              ].map((f) => (
                <div key={f.label} className={`rounded-lg p-3 border ${f.color}`}>
                  <div className="font-semibold text-sm mb-1">{f.label}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bancos */}
      {tab === "bancos" && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">Clic en cada banco para ver los pasos detallados.</p>
          {BANKS.map((bank) => (
            <div key={bank.name} className={`rounded-xl border ${bank.color} overflow-hidden`}>
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(expanded === bank.name ? null : bank.name)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bank.emoji}</span>
                  <span className="text-white font-medium">{bank.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bank.badge}`}>CSV / Excel</span>
                </div>
                <span className="text-slate-500 text-lg">{expanded === bank.name ? "−" : "+"}</span>
              </button>
              {expanded === bank.name && (
                <div className="px-4 pb-4 space-y-3">
                  <ol className="space-y-2">
                    {bank.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-arbi-green font-bold flex-shrink-0">{i + 1}.</span>
                        <span className="text-slate-300">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="bg-arbi-green/10 border border-arbi-green/20 rounded-lg p-3">
                    <p className="text-arbi-green text-xs">💡 {bank.tip}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Exchanges */}
      {tab === "exchanges" && (
        <div className="space-y-3">
          <p className="text-slate-400 text-sm">Clic en cada exchange para ver los pasos detallados.</p>
          {EXCHANGES.map((ex) => (
            <div key={ex.name} className={`rounded-xl border ${ex.color} overflow-hidden`}>
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(expanded === ex.name ? null : ex.name)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ex.emoji}</span>
                  <span className="text-white font-medium">{ex.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ex.badge}`}>CSV</span>
                </div>
                <span className="text-slate-500 text-lg">{expanded === ex.name ? "−" : "+"}</span>
              </button>
              {expanded === ex.name && (
                <div className="px-4 pb-4 space-y-3">
                  <ol className="space-y-2">
                    {ex.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="text-arbi-green font-bold flex-shrink-0">{i + 1}.</span>
                        <span className="text-slate-300">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="bg-arbi-green/10 border border-arbi-green/20 rounded-lg p-3">
                    <p className="text-arbi-green text-xs">💡 {ex.tip}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
