"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp, LayoutDashboard, ArrowLeftRight,
  FileText, Bell, Settings, LogOut, ChevronDown,
  Building2, BookOpen, FolderUp, Menu, X, Crown, GitCompare
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/importar", icon: FolderUp, label: "Importar" },
  { href: "/dashboard/reconciliations", icon: ArrowLeftRight, label: "Conciliaciones" },
  { href: "/dashboard/trazabilidad", icon: GitCompare, label: "Trazabilidad" },
  { href: "/dashboard/transactions", icon: FileText, label: "Transacciones" },
  { href: "/dashboard/reports", icon: FileText, label: "Reportes" },
  { href: "/dashboard/alerts", icon: Bell, label: "Alertas" },
  { href: "/dashboard/guia", icon: BookOpen, label: "Guía de uso" },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1E2534]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-arbi-green rounded-md flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white text-base">Orbix</span>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-3 border-b border-[#1E2534]">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#161B27] transition-colors group">
          <div className="w-6 h-6 bg-[#1E2534] rounded flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-sm text-foreground flex-1 text-left truncate">Workspace 1</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-arbi-green-dim text-arbi-green font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#161B27]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-[#1E2534] space-y-0.5">
        <Link
          href="/pricing"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-arbi-yellow hover:text-arbi-yellow/80 hover:bg-arbi-yellow/5 transition-colors"
        >
          <Crown className="w-4 h-4" />
          Ver planes
        </Link>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-[#161B27] transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div className="w-7 h-7 bg-arbi-green/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-arbi-green">
              {user?.full_name?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.full_name ?? "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-arbi-red transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 h-screen bg-[#0F1117] border-r border-[#1E2534] flex-col fixed left-0 top-0 z-40">
        <NavContent />
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0F1117] border-b border-[#1E2534] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-arbi-green rounded-md flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-white text-sm">Orbix</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white transition-colors p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ── Mobile drawer backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 h-full w-72 bg-[#0F1117] border-r border-[#1E2534] z-50 flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
