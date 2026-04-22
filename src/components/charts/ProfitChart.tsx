"use client";

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface DataPoint {
  date: string;
  profit: number;
  volumen: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const profit = payload.find((p: any) => p.dataKey === "profit")?.value ?? 0;
  const volumen = payload.find((p: any) => p.dataKey === "volumen")?.value ?? 0;

  return (
    <div className="bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2.5 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1.5">
        {format(parseISO(label), "dd MMM yyyy", { locale: es })}
      </p>
      <p className="text-arbi-green font-mono font-semibold">
        Profit: ${profit.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
      </p>
      <p className="text-blue-400 font-mono">
        Vol: ${volumen.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
      </p>
    </div>
  );
}

export function ProfitChart({ data, height = 200 }: Props) {
  const hasData = data.some(d => d.profit > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        Sin datos para el período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00C896" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#1E2534" vertical={false} />

        <XAxis
          dataKey="date"
          tick={{ fill: "#788088", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => format(parseISO(v), "dd/MM", { locale: es })}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="profit"
          orientation="left"
          tick={{ fill: "#788088", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={48}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          yAxisId="profit"
          type="monotone"
          dataKey="profit"
          stroke="#00C896"
          strokeWidth={2}
          fill="url(#profitGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#00C896", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
