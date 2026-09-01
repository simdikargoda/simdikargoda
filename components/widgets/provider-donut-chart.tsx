"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type ChartDatum = { key: string; label: string; value: number };

const PALLETTE = [
  "#0ea5e9", // sky (primary)
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#64748b", // slate
];

/** Kargo firması dağılımı için premium donut chart. */
export function ProviderDonutChart({ data }: { data: ChartDatum[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="flex h-56 w-full items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
            isAnimationActive
          >
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={PALLETTE[index % PALLETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} gönderi`,
              name,
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e8edf4",
              boxShadow: "0 8px 24px -6px rgba(2,6,23,0.12)",
              fontSize: 13,
              background: "rgba(255,255,255,0.96)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Orta istatistik */}
      <div className="pointer-events-none absolute flex flex-col items-center">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
          Gönderi
        </span>
        <span className="text-2xl font-semibold text-foreground">{total}</span>
      </div>
    </div>
  );
}
