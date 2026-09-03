"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type StatusChartDatum = { key: string; label: string; value: number; color: string };

/** Gönderi durum dağılımı için özel tasarımlı donut chart. */
export function StatusDonutChart({ data }: { data: StatusChartDatum[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex w-full items-center justify-between min-h-[220px]">
        {/* Sol taraf grafik (Boş durum) */}
        <div className="relative flex w-1/2 items-center justify-center">
          <div className="h-[140px] w-[140px] rounded-full border-[18px] border-panel-secondary/40"></div>
        </div>
        {/* Sağ taraf legend (Boş durum) */}
        <div className="flex w-1/2 flex-col justify-center gap-3">
          <span className="text-xs text-muted">Henüz veri yok</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center min-h-[220px] gap-2">
      {/* Sol taraf grafik */}
      <div className="relative flex h-[160px] w-1/2 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="90%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
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
                padding: "8px 12px",
              }}
              itemStyle={{
                color: "#0F172A",
                fontWeight: 500,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sağ taraf legend */}
      <div className="flex w-1/2 flex-col justify-center gap-2.5 pr-2">
        {data.map((item) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span className="text-muted text-xs font-medium">{item.label}</span>
              </div>
              <span className="text-foreground font-semibold text-xs">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
