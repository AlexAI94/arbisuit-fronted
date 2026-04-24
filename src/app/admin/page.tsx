"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";
import {
  Users, Activity, Briefcase, TrendingUp,
  CheckCircle2, XCircle, Shield, RefreshCw,
  LogOut, Calendar, Clock
} from "lucide-react";

const SUPERADMIN_EMAIL = "alexgarayy@icloud.com";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  two_fa_enabled: boolean;
  created_at: string;
  last_login: string | null;
  workspaces: number;
  plan: string;
}

interface Stats {
  total_users: number;
  active_users: number;
  total_workspaces: number;
  paying_users: number;
  mrr: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (user.email !== SUPERADMIN_EMAIL) { router.push("/dashboard"); return; }
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/api/v1/admin/stats"),
        api.get("/api/v1/admin/users"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string) {
    setToggling(id);
    try {
      const res = await api.patch(`/api/v1/admin/users/${id}/toggle-active`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u));
    } finally {
      setToggling(null);
    }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.email !== SUPERADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen bg-[#0B0E17] text-white">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#0F1117] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-arbi-green/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-arbi-green" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Orbix Admin</h1>
            <p className="text-slate-500 text-xs">Panel de control interno</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={() => { logout(); router.push("/auth/login"); }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Usuarios totales", value: stats?.total_users ?? "—", icon: Users, color: "text-blue-400" },
            { label: "Usuarios activos", value: stats?.active_users ?? "—", icon: Activity, color: "text-arbi-green" },
            { label: "Workspaces", value: stats?.total_workspaces ?? "—", icon: Briefcase, color: "text-purple-400" },
            { label: "Pagando", value: stats?.paying_users ?? 0, icon: CheckCircle2, color: "text-yellow-400" },
            { label: "MRR (USD)", value: `$${stats?.mrr ?? 0}`, icon: TrendingUp, color: "text-arbi-green" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#0F1117] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-xs">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{loading ? "…" : kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-[#0F1117] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4">
            <h2 className="text-white font-semibold">Usuarios registrados</h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="bg-[#161B27] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-arbi-green/50 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Usuario", "Plan", "Workspaces", "2FA", "Registrado", "Último login", "Estado", "Acción"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">Cargando...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">Sin resultados</td>
                  </tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{u.full_name}</p>
                      <p className="text-slate-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{u.workspaces}</td>
                    <td className="px-4 py-3">
                      {u.two_fa_enabled
                        ? <CheckCircle2 className="w-4 h-4 text-arbi-green" />
                        : <XCircle className="w-4 h-4 text-slate-600" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        {formatDate(u.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(u.last_login)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.is_active
                          ? "bg-arbi-green/15 text-arbi-green"
                          : "bg-red-500/15 text-red-400"
                      }`}>
                        {u.is_active ? "Activo" : "Suspendido"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.email !== SUPERADMIN_EMAIL && (
                        <button
                          onClick={() => toggleActive(u.id)}
                          disabled={toggling === u.id}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            u.is_active
                              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                              : "border-arbi-green/30 text-arbi-green hover:bg-arbi-green/10"
                          } disabled:opacity-50`}
                        >
                          {toggling === u.id ? "..." : u.is_active ? "Suspender" : "Activar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
