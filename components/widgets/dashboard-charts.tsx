"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export function ShipmentTrendChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#64748b" }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#64748b" }} 
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            itemStyle={{ color: "#0ea5e9", fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            name="Gönderi" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: { month: string; amountKurus: number }[] }) {
  // Convert kurus to TL for chart
  const chartData = data.map(d => ({
    ...d,
    amountTL: d.amountKurus / 100
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#64748b" }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#64748b" }} 
            tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            formatter={(value: number) => [`₺${value.toLocaleString("tr-TR")}`, 'Ciro']}
            cursor={{ fill: "#f1f5f9" }}
          />
          <Bar 
            dataKey="amountTL" 
            fill="#bae6fd" 
            radius={[4, 4, 0, 0]} 
            activeBar={{ fill: "#38bdf8" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
