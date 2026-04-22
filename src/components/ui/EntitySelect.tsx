"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Building2, Wallet, Globe, ChevronDown } from "lucide-react";
import { ENTITIES, EntityDef, EntityType, logoUrl, faviconUrl } from "@/lib/entities";
import { cn } from "@/lib/utils";

interface EntitySelectProps {
  value: string;
  entityType?: EntityType;
  onChange: (name: string, type: EntityType) => void;
  placeholder?: string;
  className?: string;
}

const TYPE_LABELS: Record<EntityType, string> = {
  bank: "Bancos",
  wallet: "Billeteras",
  exchange: "Exchanges",
};

const TYPE_ORDER: EntityType[] = ["bank", "wallet", "exchange"];

function EntityLogo({ domain, name, size = 20 }: { domain: string; name: string; size?: number }) {
  const [src, setSrc] = useState(logoUrl(domain));
  const [errored, setErrored] = useState(false);

  const fallbackSrc = faviconUrl(domain);
  const initials = name.slice(0, 2).toUpperCase();

  if (errored) {
    return (
      <div
        className="rounded-full bg-[#1E2534] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-muted-foreground"
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-contain flex-shrink-0 bg-white"
      style={{ width: size, height: size }}
      onError={() => {
        if (src === logoUrl(domain)) {
          setSrc(fallbackSrc);
        } else {
          setErrored(true);
        }
      }}
    />
  );
}

function typeIcon(type: EntityType, size = 12) {
  if (type === "bank") return <Building2 style={{ width: size, height: size }} />;
  if (type === "wallet") return <Wallet style={{ width: size, height: size }} />;
  return <Globe style={{ width: size, height: size }} />;
}

export function EntitySelect({ value, entityType, onChange, placeholder = "Buscar banco, exchange o billetera...", className }: EntitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Entidad seleccionada actualmente
  const selected = ENTITIES.find(e => e.name === value);

  // Filtrar entidades
  const filtered = ENTITIES.filter(e => {
    if (entityType && e.type !== entityType) return false;
    if (!search) return true;
    return e.name.toLowerCase().includes(search.toLowerCase());
  });

  // Agrupar por tipo
  const grouped = TYPE_ORDER.reduce<Record<EntityType, EntityDef[]>>((acc, type) => {
    acc[type] = filtered.filter(e => e.type === type);
    return acc;
  }, { bank: [], wallet: [], exchange: [] });

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (entity: EntityDef) => {
    onChange(entity.name, entity.type);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 text-sm text-left hover:border-[#2A3347] focus:outline-none focus:border-arbi-green/50 transition-colors"
      >
        {selected ? (
          <>
            <EntityLogo domain={selected.domain} name={selected.name} size={20} />
            <span className="flex-1 text-white truncate">{selected.name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {typeIcon(selected.type)}
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-[#0F1117] border border-[#1E2534] rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#1E2534]">
            <div className="flex items-center gap-2 bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-72 overflow-y-auto py-1">
            {TYPE_ORDER.map(type => {
              const items = grouped[type];
              if (items.length === 0) return null;
              return (
                <div key={type}>
                  <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {TYPE_LABELS[type]}
                  </p>
                  {items.map(entity => (
                    <button
                      key={entity.name}
                      type="button"
                      onClick={() => handleSelect(entity)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#161B27] transition-colors text-left",
                        value === entity.name && "bg-arbi-green/10 text-arbi-green"
                      )}
                    >
                      <EntityLogo domain={entity.domain} name={entity.name} size={22} />
                      <span className="flex-1 truncate text-white">{entity.name}</span>
                      {entity.country && entity.country !== "AR" && (
                        <span className="text-xs text-muted-foreground">{entity.country}</span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin resultados para "{search}"
              </div>
            )}
          </div>

          {/* Opción custom */}
          {search && !ENTITIES.find(e => e.name.toLowerCase() === search.toLowerCase()) && (
            <div className="p-2 border-t border-[#1E2534]">
              <button
                type="button"
                onClick={() => {
                  onChange(search, entityType ?? "bank");
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-arbi-green hover:bg-arbi-green/10 rounded-lg transition-colors"
              >
                <span>+ Usar "{search}" como entidad personalizada</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Export del logo para uso en otras partes
export { EntityLogo };
