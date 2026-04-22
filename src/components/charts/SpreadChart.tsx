"use client";

import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";

interface Bucket {
  label: string;
  count: number;
}

interface Props {
  data: Bucket[];
  height?: number;
}

const BAR_COLORS = [
  "#1E2534", "#2A3347", "#3A4A6A", "#4A6A9A",
  "#00C896", "#00E5A8", "#00C896", "#FFB547",
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161B27] border border-[#1E2534] rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1">Spread {label}</p>
      <p className="text-foreground font-semibold">{payload[0].value} operaciones</p>
    </div>
  );
}

export function SpreadChart({ data, height = 160 }: Props) {
  const hasData = data.some(d => d.count > 0);
  if (!hasData) return (
    <div className="flex items-center justify-center h-[160px] text-muted-foreground text-sm">
      Sin datos
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2534" horizontal={true} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#788088", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "#788088", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1E2534" }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
