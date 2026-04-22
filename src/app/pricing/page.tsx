"use client";

import { useState } from "react";
import { Check, TrendingUp, Zap, Shield, Crown } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: 35000,
    opsLabel: "Hasta 1.000 operaciones / mes",
    opsRange: "0 – 1.000 ops",
    color: "border-white/10",
    badgeColor: "bg-white/5 text-slate-300",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    cta: "Empezar gratis 7 días",
    ctaClass: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    features: [
      "Importación CSV / Excel / PDF",
      "Motor de conciliación 4 fases",
      "Dashboard con métricas",
      "Historial 3 meses",
      "1 usuario",
      "Soporte por email",
    ],
    missing: ["Alertas Telegram", "Reportes PDF/Excel", "Multi-usuario"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Shield,
    price: 50000,
    opsLabel: "Hasta 2.500 operaciones / mes",
    opsRange: "1.000 – 2.500 ops",
    color: "border-arbi-green/50",
    badgeColor: "bg-arbi-green/20 text-arbi-green",
    iconBg: "bg-arbi-green/20",
    iconColor: "text-arbi-green",
    cta: "Empezar gratis 7 días",
    ctaClass: "bg-arbi-green hover:bg-arbi-green/90 text-black font-bold",
    popular: true,
    features: [
      "Todo lo de Starter",
      "Alertas por Telegram",
      "Reportes PDF y Excel",
      "Historial 12 meses",
      "Alertas fiscales automáticas",
      "Hasta 3 usuarios",
      "Soporte prioritario",
    ],
    missing: ["API acceso", "Manager dedicado"],
  },
  {
    id: "elite",
    name: "Elite",
    icon: Crown,
    price: 100000,
    opsLabel: "Operaciones ilimitadas",
    opsRange: "+ 2.500 ops",
    color: "border-arbi-yellow/40",
    badgeColor: "bg-arbi-yellow/20 text-arbi-yellow",
    iconBg: "bg-arbi-yellow/20",
    iconColor: "text-arbi-yellow",
    cta: "Contactar",
    ctaClass: "bg-arbi-yellow hover:bg-arbi-yellow/90 text-black font-bold",
    features: [
      "Todo lo de Pro",
      "Operaciones ilimitadas",
      "Usuarios ilimitados",
      "Historial completo",
      "API para integraciones",
      "Onboarding personalizado",
      "Manager dedicado",
      "SLA garantizado",
    ],
    missing: [],
  },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const discount = 0.15; // 15% descuento anual

  return (
    <div className="min-h-screen bg-[#0B0E17] text-white">
      {/* Nav mínima */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 max-w-6xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-arbi-green rounded-md flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white">Orbix</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Ir al dashboard →
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-arbi-green/10 border border-arbi-green/20 text-arbi-green text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            Pagos en ARS · Sin dólares · Sin sorpresas
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold">
            Precios simples,<br />
            <span className="text-arbi-green">resultados reales</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Elegí el plan según tu volumen mensual de operaciones. Podés cambiar de plan en cualquier momento.
          </p>
        </div>

        {/* Toggle anual/mensual */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? "text-white" : "text-slate-500"}`}>Mensual</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-arbi-green" : "bg-white/10"}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm ${annual ? "text-white" : "text-slate-500"}`}>
            Anual
            <span className="ml-1.5 text-xs text-arbi-green font-semibold">−15%</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const finalPrice = annual ? Math.round(plan.price * (1 - discount)) : plan.price;
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border ${plan.color} bg-[#0F1117] p-6 flex flex-col gap-6 ${plan.popular ? "ring-1 ring-arbi-green/30" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-arbi-green rounded-full text-xs font-bold text-black">
                    Más popular
                  </div>
                )}

                {/* Header del plan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${plan.badgeColor}`}>
                      {plan.opsRange}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                    <p className="text-slate-500 text-xs mt-0.5">{plan.opsLabel}</p>
                  </div>
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-white">{formatPrice(finalPrice)}</span>
                      <span className="text-slate-500 text-sm mb-1">/mes</span>
                    </div>
                    {annual && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="line-through">{formatPrice(plan.price)}</span>
                        <span className="text-arbi-green ml-1">ahorrás {formatPrice(plan.price * discount * 12)}/año</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button className={`w-full py-2.5 rounded-xl text-sm transition-colors ${plan.ctaClass}`}>
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-arbi-green flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-35">
                      <div className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-3 h-px bg-slate-600" />
                      </div>
                      <span className="text-sm text-slate-500">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* VIP banner */}
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/2 p-8 text-center space-y-3">
          <div className="text-3xl">👑</div>
          <h3 className="text-xl font-bold text-white">Plan VIP — próximamente</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Para mesas de arbitraje y equipos grandes. Incluirá gestor de cuenta dedicado, integración a medida, reportes personalizados y condiciones especiales.
          </p>
          <button className="mt-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/30 transition-colors">
            Anotarme en la lista de espera
          </button>
        </div>

        {/* FAQ / garantías */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {[
            { icon: "🔒", title: "7 días gratis", desc: "Probá cualquier plan sin tarjeta de crédito. Cancelás cuando quieras." },
            { icon: "🔄", title: "Cambiás de plan", desc: "Podés subir o bajar de plan en cualquier momento sin penalidad." },
            { icon: "💬", title: "Soporte en español", desc: "El equipo responde por Telegram o email. Sin bots, persona real." },
          ].map((item) => (
            <div key={item.title} className="bg-[#0F1117] border border-white/5 rounded-xl p-5 text-center space-y-2">
              <div className="text-2xl">{item.icon}</div>
              <h4 className="text-white font-semibold text-sm">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
