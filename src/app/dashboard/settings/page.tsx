"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { User, Lock, Bell, Shield, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"perfil" | "seguridad" | "notificaciones">("perfil");

  const tabs = [
    { id: "perfil" as const, label: "Perfil", icon: User },
    { id: "seguridad" as const, label: "Seguridad", icon: Lock },
    { id: "notificaciones" as const, label: "Notificaciones", icon: Bell },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Administrá tu cuenta y preferencias</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0F1117] border border-white/5 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-arbi-green/15 text-arbi-green"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {activeTab === "perfil" && (
        <div className="space-y-4">
          <div className="bg-[#0F1117] border border-white/5 rounded-xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Información personal</h2>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-arbi-green/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-arbi-green">
                  {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{user?.full_name}</p>
                <p className="text-slate-500 text-sm">{user?.email}</p>
                <span className="text-xs text-arbi-green bg-arbi-green/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {user?.role ?? "owner"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Nombre completo</label>
                <input
                  defaultValue={user?.full_name ?? ""}
                  disabled
                  className="w-full bg-[#161B27] border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Email</label>
                <input
                  defaultValue={user?.email ?? ""}
                  disabled
                  className="w-full bg-[#161B27] border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Para modificar el perfil, la funcionalidad estará disponible próximamente.
            </p>
          </div>
        </div>
      )}

      {/* Seguridad */}
      {activeTab === "seguridad" && (
        <div className="space-y-4">
          <div className="bg-[#0F1117] border border-white/5 rounded-xl divide-y divide-white/5">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-white text-sm font-medium">Contraseña</p>
                  <p className="text-slate-500 text-xs">Cambiá tu contraseña de acceso</p>
                </div>
              </div>
              <button className="text-arbi-green text-xs hover:underline">Cambiar</button>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-white text-sm font-medium">Autenticación de dos factores (2FA)</p>
                  <p className="text-slate-500 text-xs">
                    {user?.two_fa_enabled ? "Activado — tu cuenta está protegida" : "Desactivado — recomendamos activarlo"}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                user?.two_fa_enabled
                  ? "bg-arbi-green/15 text-arbi-green"
                  : "bg-yellow-500/15 text-yellow-400"
              }`}>
                {user?.two_fa_enabled ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {activeTab === "notificaciones" && (
        <div className="bg-[#0F1117] border border-white/5 rounded-xl divide-y divide-white/5">
          {[
            { label: "Alertas de spread", desc: "Cuando el spread supera tu umbral configurado", default: true },
            { label: "Resumen diario", desc: "Reporte diario de tus operaciones a las 9:00", default: false },
            { label: "Conciliaciones pendientes", desc: "Recordatorio de matches sin confirmar", default: true },
          ].map((item) => (
            <div key={item.label} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors ${item.default ? "bg-arbi-green" : "bg-slate-700"} relative cursor-pointer`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.default ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
