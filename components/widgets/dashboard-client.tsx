"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Boxes, PackageCheck, Truck, RotateCcw, TrendingUp, TrendingDown, ArrowRight, Plus, FileUp, Calculator, Printer, FileText, ChevronDown, Download } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { formatKurus } from "@/lib/money";
import { toast } from "sonner";

// --- Özel TL İkonu (lucide benzeri) ---
const TLIcon = (props: any) => (
  <span className={cn("inline-flex items-center justify-center font-bold font-sans", props.className)} style={{ fontSize: "1.15em", lineHeight: 1 }}>
    ₺
  </span>
);


const PROVIDER_COLORS: Record<string, string> = {
  aras: "#3b82f6",
  yurtici: "#a855f7",
  mng: "#10b981",
  surat: "#f59e0b",
  hepsijet: "#ef4444",
  ptt: "#6366f1",
};
const DEFAULT_COLOR = "#64748b";

const STATUS_COLORS: Record<string, string> = {
  delivered: "#22c55e",
  in_transit: "#f59e0b",
  returned: "#f43f5e",
  created: "#3b82f6",
};

// --- YARDIMCI BİLEŞENLER ---

function StatCard({
  title, value, prevValue, trend, isUp, icon: Icon, colorClass
}: any) {
  return (
    <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs font-medium px-1">
        <span className={cn("flex items-center gap-0.5", isUp ? "text-emerald-500" : "text-rose-500")}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend}
        </span>
        <span className="text-muted">Önceki: {prevValue}</span>
      </div>
    </div>
  );
}

function CardDateFilter({ initialValue, options }: { initialValue: string, options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialValue);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="text-xs font-medium text-muted bg-panel-secondary px-2.5 py-1 rounded-lg flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {selected} <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}/>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-28 rounded-lg border border-panel-secondary bg-white p-1 shadow-lg z-10">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => {
                setSelected(opt);
                setIsOpen(false);
                toast.success("Filtre Uygulandı", { description: `Grafik "${opt}" aralığına göre güncellendi.` });
              }}
              className={cn(
                "w-full text-left px-2 py-1.5 text-[11px] rounded-md transition-colors",
                selected === opt ? "bg-primary/5 text-primary font-bold" : "text-muted hover:bg-panel-secondary hover:text-foreground font-medium"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function calcTrend(current: number, yesterday: number) {
  if (yesterday === 0) return { isUp: true, text: "Yüksek", diff: current };
  const diff = current - yesterday;
  const pct = (diff / yesterday) * 100;
  return { isUp: pct >= 0, text: `${Math.abs(pct).toFixed(1)}%`, diff };
}

function getProviderName(code: string) {
  const map: Record<string, string> = {
    aras: "Aras Kargo", dhl: "DHL", hepsijet: "HepsiJET", ptt: "PTT Kargo", yurtici: "Yurtiçi Kargo", mng: "MNG Kargo", surat: "Sürat Kargo"
  };
  return map[code] || code;
}
function getStatusName(code: string) {
  const map: Record<string, string> = {
    delivered: "Teslim Edildi", in_transit: "Dağıtımda", returned: "İade", created: "Oluşturuldu"
  };
  return map[code] || "Diğer";
}

export function DashboardClient({ data, initialRange = "Bugün", userName = "Kullanıcı" }: { data: any, initialRange?: string, userName?: string }) {
  const router = useRouter();
  const { kpi, shipmentTrend, revenueTrend, byProvider, byStatus, topCustomers, recentTransactions } = data;
  const [dateRange, setDateRange] = useState(initialRange);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const totalShipments = kpi.totalShipments.value;
  
  const [todayFormatted, setTodayFormatted] = useState("");
  
  useEffect(() => {
    const today = new Date();
    setTodayFormatted(today.toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);
  
  const providerData = byProvider.map((p: any) => ({
    name: getProviderName(p.name),
    value: p.count,
    color: PROVIDER_COLORS[p.name] || DEFAULT_COLOR,
    pct: p.percentage
  }));

  const statusData = byStatus.map((s: any) => ({
    name: getStatusName(s.name),
    value: s.count,
    color: STATUS_COLORS[s.name] || DEFAULT_COLOR,
    pct: s.percentage
  }));

  // Trend Calculations
  const tTotal = calcTrend(kpi.totalShipments.value, kpi.totalShipments.yesterday);
  const tDeliv = calcTrend(kpi.delivered.value, kpi.delivered.yesterday);
  const tTrans = calcTrend(kpi.inTransit.value, kpi.inTransit.yesterday);
  const tRet = calcTrend(kpi.returned.value, kpi.returned.yesterday);
  const tRev = calcTrend(kpi.revenueKurus.value, kpi.revenueKurus.yesterday);

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Hoş geldiniz, <span className="text-sky-500">{userName?.split(" (")[0]}</span>
          </h1>
          <p className="text-sm font-medium text-muted mt-1">Bugünkü operasyonel özet ve önemli metrikler</p>
        </div>
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => {
              const csvContent = [
                "Bölüm;Kategori;Değer",
                `KPI;Toplam Gönderi;${kpi.totalShipments.value}`,
                `KPI;Teslim Edilen;${kpi.delivered.value}`,
                `KPI;Dağıtımda;${kpi.inTransit.value}`,
                `KPI;İade;${kpi.returned.value}`,
                `KPI;Toplam Ciro;${formatKurus(kpi.revenueKurus.value).replace(/₺/g, "").trim()}`,
                ...byProvider.map((p: any) => `Firma Dağılımı;${getProviderName(p.name)};${p.count}`),
                ...byStatus.map((s: any) => `Durum Dağılımı;${getStatusName(s.name)};${s.count}`)
              ].join("\n");
              
              const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `dashboard-ozet-${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success("CSV İndirildi", { description: "Veriler başarıyla bilgisayarınıza kaydedildi." });
            }}
            className="flex items-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm hover:text-foreground hover:border-slate-300 transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV indir
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="flex items-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm hover:text-foreground hover:border-slate-300 transition-colors"
            >
              <Calendar className="h-4 w-4 text-muted" />
              <span className="text-muted mr-1">{todayFormatted}</span>
              <span className="font-semibold text-foreground">{dateRange}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform text-muted ml-1", isDateOpen && "rotate-180")} />
            </button>
            
            {isDateOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-panel-secondary bg-white p-1 shadow-lg z-50">
                {["Bugün", "Dün", "Son 7 Gün", "Son 30 Gün", "Bu Ay"].map(range => (
                  <button
                    key={range}
                    onClick={() => {
                      setDateRange(range);
                      setIsDateOpen(false);
                      router.push(`?range=${encodeURIComponent(range)}`);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-panel-secondary transition-colors",
                      dateRange === range ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* METRİK KARTLARI (5 KOLON) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Toplam Gönderi" value={kpi.totalShipments.value} prevValue={kpi.totalShipments.yesterday} trend={tTotal.text} isUp={tTotal.isUp}
          icon={Boxes} colorClass="bg-blue-50 text-blue-500"
        />
        <StatCard
          title="Teslim Edildi" value={kpi.delivered.value} prevValue={kpi.delivered.yesterday} trend={tDeliv.text} isUp={tDeliv.isUp}
          icon={PackageCheck} colorClass="bg-emerald-50 text-emerald-500"
        />
        <StatCard
          title="Dağıtımda" value={kpi.inTransit.value} prevValue={kpi.inTransit.yesterday} trend={tTrans.text} isUp={tTrans.isUp}
          icon={Truck} colorClass="bg-orange-50 text-orange-500"
        />
        <StatCard
          title="İade / Geri Dönen" value={kpi.returned.value} prevValue={kpi.returned.yesterday} trend={tRet.text} isUp={tRet.isUp}
          icon={RotateCcw} colorClass="bg-rose-50 text-rose-500"
        />
        <StatCard
          title="Toplam Ciro" value={formatKurus(kpi.revenueKurus.value)} prevValue={formatKurus(kpi.revenueKurus.yesterday)} trend={tRev.text} isUp={tRev.isUp}
          icon={TLIcon} colorClass="bg-blue-50 text-blue-500"
        />
      </div>

      {/* ORTA SATIR */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gönderi Trendi */}
        <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Gönderi Trendi</h3>
            <CardDateFilter initialValue="7 Gün" options={["Bugün", "7 Gün", "30 Gün", "Bu Ay"]} />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={shipmentTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" name="Gönderi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kargo Firmalarına Göre Dağılım */}
        <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Kargo Firmalarına Göre Dağılım</h3>
            <CardDateFilter initialValue="7 Gün" options={["Bugün", "7 Gün", "30 Gün", "Bu Ay"]} />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/2 h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={totalShipments === 0 ? [{ name: "Veri Yok", value: 1, color: "#e2e8f0" }] : providerData} 
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none"
                  >
                    {(totalShipments === 0 ? [{ name: "Veri Yok", value: 1, color: "#e2e8f0" }] : providerData).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-foreground">{totalShipments}</span>
                <span className="text-[10px] text-muted">Toplam</span>
              </div>
            </div>
            <div className="w-full sm:w-1/2 space-y-3 px-4">
              {providerData.map((p: any) => (
                <div key={p.name} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                    <span className="text-foreground">{p.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-foreground">{p.pct}%</span>
                    <span className="text-muted">({p.value})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Son İşlemler */}
        <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Son İşlemler</h3>
            <Link href="/yonetim/kargo" className="text-xs font-medium text-muted hover:text-foreground cursor-pointer">Tümünü Gör</Link>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              {recentTransactions.map((tx: any, i: number) => {
                let Icon = Boxes;
                let color = "text-blue-500";
                let bg = "bg-blue-50";
                if (tx.type === "delivered") { Icon = PackageCheck; color = "text-green-500"; bg = "bg-green-50"; }
                if (tx.type === "returned") { Icon = RotateCcw; color = "text-orange-500"; bg = "bg-orange-50"; }
                
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", bg, color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{tx.title}</p>
                        <p className="text-xs font-medium text-muted mt-0.5">{tx.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-muted">
                      {tx.timeAgo}
                      <div className={cn("h-1.5 w-1.5 rounded-full", bg.replace('bg-', 'bg-').replace('50', '500'))}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-panel-secondary text-center">
              <Link href="/yonetim/kargo" className="text-xs font-semibold text-muted hover:text-foreground flex items-center justify-center w-full gap-1">
                Tüm aktiviteleri göster <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ALT SATIR */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gönderi Durumları */}
        <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Gönderi Durumları</h3>
            <CardDateFilter initialValue="7 Gün" options={["Bugün", "7 Gün", "30 Gün", "Bu Ay"]} />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/2 h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={totalShipments === 0 ? [{ name: "Veri Yok", value: 1, color: "#e2e8f0" }] : statusData} 
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none"
                  >
                    {(totalShipments === 0 ? [{ name: "Veri Yok", value: 1, color: "#e2e8f0" }] : statusData).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-foreground">{totalShipments}</span>
                <span className="text-[10px] text-muted">Toplam</span>
              </div>
            </div>
            <div className="w-full sm:w-1/2 space-y-4 px-4">
              {statusData.map((s: any) => (
                <div key={s.name} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-foreground">{s.name}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-foreground">{s.value}</span>
                    <span className="text-muted">(%{s.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aylık Ciro Trendi */}
        <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">Aylık Ciro Trendi</h3>
            <CardDateFilter initialValue="6 Ay" options={["3 Ay", "6 Ay", "1 Yıl", "Tümü"]} />
          </div>
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <defs>
                  <linearGradient id="colorCiro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} tickFormatter={(val) => `${val/1000}B`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: number) => [formatKurus(value), "Ciro"]} 
                />
                <Bar 
                  dataKey="amountKurus" 
                  name="Ciro" 
                  fill="url(#colorCiro)" 
                  radius={[6, 6, 0, 0]} 
                  minPointSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* En Aktif Müşteriler */}
        <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-foreground">En Aktif Müşteriler</h3>
            <span className="text-xs font-medium text-muted hover:text-foreground cursor-pointer">Tümünü Gör</span>
          </div>
          <div className="space-y-4">
            {topCustomers.length > 0 ? topCustomers.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 font-bold uppercase text-[10px]">
                    {c.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">{c.name}</p>
                    <p className="text-xs font-medium text-muted mt-0.5">{c.count} gönderi</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-xs font-bold text-foreground flex items-center">
                    {formatKurus(c.revenueKurus)}
                  </span>
                </div>
              </div>
            )) : <p className="text-xs text-muted">Kayıt bulunamadı.</p>}
          </div>
        </div>
      </div>

      {/* HIZLI İŞLEMLER */}
      <div className="rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/yonetim/kargo/yeni" className="group flex items-center gap-3 rounded-xl border border-panel-secondary bg-white p-3 hover:border-primary/50 transition-colors">
            <div className="rounded-lg bg-blue-50 text-blue-500 p-2.5 transition-colors group-hover:bg-blue-100"><Plus className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-foreground">Yeni Kargo Oluştur</p>
              <p className="text-[10px] font-medium text-muted">Hızlı kargo kaydı</p>
            </div>
          </Link>
          
          <Link href="/yonetim/kargo/excel" className="group flex items-center gap-3 rounded-xl border border-panel-secondary bg-white p-3 hover:border-emerald-500/50 transition-colors">
            <div className="rounded-lg bg-emerald-50 text-emerald-500 p-2.5 transition-colors group-hover:bg-emerald-100"><FileUp className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-foreground">Toplu Kargo Yükle</p>
              <p className="text-[10px] font-medium text-muted">Excel ile toplu işlem</p>
            </div>
          </Link>

          <Link href="/yonetim/fiyatlandirma" className="group flex items-center gap-3 rounded-xl border border-panel-secondary bg-white p-3 hover:border-purple-500/50 transition-colors">
            <div className="rounded-lg bg-purple-50 text-purple-500 p-2.5 transition-colors group-hover:bg-purple-100"><Calculator className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-foreground">Fiyat Hesapla</p>
              <p className="text-[10px] font-medium text-muted">Kargo fiyatı hesapla</p>
            </div>
          </Link>

          <Link href="/yonetim/kargo" className="group flex items-center gap-3 rounded-xl border border-panel-secondary bg-white p-3 hover:border-amber-500/50 transition-colors">
            <div className="rounded-lg bg-amber-50 text-amber-500 p-2.5 transition-colors group-hover:bg-amber-100"><Printer className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-foreground">Barkod Yazdır</p>
              <p className="text-[10px] font-medium text-muted">Toplu barkod yazdır</p>
            </div>
          </Link>

          <Link href="/yonetim/raporlar" className="group flex items-center gap-3 rounded-xl border border-panel-secondary bg-white p-3 hover:border-indigo-500/50 transition-colors">
            <div className="rounded-lg bg-indigo-50 text-indigo-500 p-2.5 transition-colors group-hover:bg-indigo-100"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-foreground">Rapor Oluştur</p>
              <p className="text-[10px] font-medium text-muted">Detaylı raporlar</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}


