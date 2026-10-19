import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays,
  CheckCircle2, ChevronDown, CircleDollarSign, Download, LayoutDashboard,
  MoreHorizontal, Target, Users, UserRoundCheck, FileText, Package, CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { leads, quotations, deals, orders, payments } from "../data/dummyData";

const periods = ["Today", "Last 7 Days", "Last 30 Days", "Custom Range"];
const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value || 0);

const shortCurrency = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
};

function dateOnly(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function dateLabel(date) {
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
function isWithin(date, start, end) {
  if (!date) return false;
  const value = dateOnly(`${date}T00:00:00`);
  return value >= dateOnly(`${start}T00:00:00`) && value <= dateOnly(`${end}T00:00:00`);
}
function sum(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0);
}
function pctChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function Comparison({ value }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${positive ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(value)}%
    </span>
  );
}

function MetricCard({ title, value, change, subtitle, icon: Icon, accent }) {
  return (
    <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 ${accent}`}>
          <Icon size={20} />
        </div>
        <Comparison value={change} />
      </div>
      <p className="mt-4 break-words text-sm font-medium text-text-muted sm:mt-5">{title}</p>
      <h3 className="mt-1 break-words text-2xl font-bold tracking-tight text-text sm:text-3xl">{value}</h3>
      <p className="mt-2 text-xs leading-5 text-text-muted">{subtitle}</p>
    </article>
  );
}

function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
      <div className="min-w-0">
        <h2 className="font-semibold text-text">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function ChartTooltip({ active, payload, label, money = false }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-xl">
      <p className="mb-2 text-xs text-text-muted">{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center gap-2 text-sm font-semibold text-text">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}: {money ? currency(item.value) : item.value}
        </div>
      ))}
    </div>
  );
}

function makeActivityRows() {
  const rows = [
    ...leads.map((item) => ({
      id: item.id, name: item.name, action: "Lead created",
      detail: `${item.company} · ${item.source}`, time: item.createdAt, status: item.status,
      sortDate: item.createdAt,
    })),
    ...quotations.map((item) => ({
      id: item.id, name: leads.find((lead) => lead.id === item.leadId)?.name || item.leadId,
      action: "Quotation updated", detail: `${item.id} · ${item.category} · ${currency(item.amount)}`,
      time: item.date, status: item.status, sortDate: item.date,
    })),
    ...deals.map((item) => ({
      id: item.id, name: item.title, action: "Deal updated",
      detail: `${item.id} · ${currency(item.value)}`, time: item.createdAt || item.expectedClose,
      status: item.status, sortDate: item.createdAt || item.expectedClose,
    })),
    ...orders.map((item) => ({
      id: item.id, name: item.customer, action: "Order created",
      detail: `${item.id} · ${currency(item.amount)}`, time: item.date,
      status: item.status, sortDate: item.date,
    })),
    ...payments.map((item) => ({
      id: item.id, name: item.orderId, action: "Payment update",
      detail: `${item.method} · ${currency(item.amount)}`, time: item.date,
      status: item.status, sortDate: item.date,
    })),
  ];
  return rows.sort((a, b) => b.sortDate.localeCompare(a.sortDate)).slice(0, 12);
}

export default function Dashboard() {
  const today = "2026-10-19";
  const [period, setPeriod] = useState("Last 30 Days");
  const [customStart, setCustomStart] = useState("2026-10-01");
  const [customEnd, setCustomEnd] = useState(today);
  const [appliedRange, setAppliedRange] = useState({ start: "2026-09-20", end: today });
  const [activityFilter, setActivityFilter] = useState("All");

  const range = useMemo(() => {
    if (period === "Custom Range") return appliedRange;
    const end = dateOnly(`${today}T00:00:00`);
    const days = period === "Today" ? 1 : period === "Last 7 Days" ? 7 : 30;
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    return { start: isoDate(start), end: today };
  }, [period, appliedRange]);

  const previousRange = useMemo(() => {
    const start = dateOnly(`${range.start}T00:00:00`);
    const end = dateOnly(`${range.end}T00:00:00`);
    const duration = Math.max(1, Math.round((end - start) / 86400000) + 1);
    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - (duration - 1));
    return { start: isoDate(previousStart), end: isoDate(previousEnd) };
  }, [range]);

  const currentLeads = useMemo(
    () => leads.filter((item) => isWithin(item.createdAt, range.start, range.end)), [range]
  );
  const previousLeads = useMemo(
    () => leads.filter((item) => isWithin(item.createdAt, previousRange.start, previousRange.end)), [previousRange]
  );
  const currentQuotes = useMemo(
    () => quotations.filter((item) => isWithin(item.date, range.start, range.end)), [range]
  );
  const currentDeals = useMemo(
    () => deals.filter((item) => isWithin(item.createdAt || item.expectedClose, range.start, range.end)), [range]
  );
  const currentOrders = useMemo(
    () => orders.filter((item) => isWithin(item.date, range.start, range.end)), [range]
  );
  const currentPayments = useMemo(
    () => payments.filter((item) => isWithin(item.date, range.start, range.end)), [range]
  );

  const qualified = currentLeads.filter((item) => item.status === "Qualified").length;
  const converted = currentLeads.filter((item) => item.status === "Converted").length;
  const revenue = sum(currentDeals.filter((item) => item.status === "Won"), "value");
  const prevQualified = previousLeads.filter((item) => item.status === "Qualified").length;
  const prevConverted = previousLeads.filter((item) => item.status === "Converted").length;
  const previousWonRevenue = sum(
    deals.filter((item) => (item.createdAt || item.expectedClose) &&
      isWithin(item.createdAt || item.expectedClose, previousRange.start, previousRange.end) &&
      item.status === "Won"), "value"
  );
  const metrics = {
    leads: currentLeads.length,
    qualified,
    converted,
    revenue,
    changes: [
      pctChange(currentLeads.length, previousLeads.length),
      pctChange(qualified, prevQualified),
      pctChange(converted, prevConverted),
      pctChange(revenue, previousWonRevenue),
    ],
  };
  const conversionRate = metrics.leads ? ((metrics.converted / metrics.leads) * 100).toFixed(1) : "0.0";

  const leadChartData = useMemo(() => {
    const days = [];
    const start = dateOnly(`${range.start}T00:00:00`);
    const end = dateOnly(`${range.end}T00:00:00`);
    const duration = Math.max(1, Math.round((end - start) / 86400000) + 1);
    const step = duration > 14 ? Math.ceil(duration / 7) : 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + step)) {
      const bucketStart = new Date(d);
      const bucketEnd = new Date(d);
      bucketEnd.setDate(bucketEnd.getDate() + step - 1);
      if (bucketEnd > end) bucketEnd.setTime(end.getTime());
      const from = isoDate(bucketStart);
      const to = isoDate(bucketEnd);
      days.push({
        day: dateLabel(bucketStart),
        leads: currentLeads.filter((item) => isWithin(item.createdAt, from, to)).length,
        previous: previousLeads.filter((item) => {
          const prevDate = dateOnly(`${item.createdAt}T00:00:00`);
          const offset = Math.round((prevDate - dateOnly(`${previousRange.start}T00:00:00`)) / 86400000);
          const mappedDate = new Date(start);
          mappedDate.setDate(mappedDate.getDate() + offset);
          return mappedDate >= bucketStart && mappedDate <= bucketEnd;
        }).length,
      });
    }
    return days;
  }, [range, previousRange, currentLeads, previousLeads]);

  const revenueChartData = useMemo(() => {
    const wonDeals = currentDeals.filter((item) => item.status === "Won");
    const start = dateOnly(`${range.start}T00:00:00`);
    const end = dateOnly(`${range.end}T00:00:00`);
    const duration = Math.max(1, Math.round((end - start) / 86400000) + 1);
    const step = duration > 14 ? Math.ceil(duration / 7) : 1;
    const result = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + step)) {
      const bucketStart = new Date(d);
      const bucketEnd = new Date(d);
      bucketEnd.setDate(bucketEnd.getDate() + step - 1);
      if (bucketEnd > end) bucketEnd.setTime(end.getTime());
      result.push({
        day: dateLabel(bucketStart),
        revenue: sum(wonDeals.filter((item) => isWithin(item.createdAt || item.expectedClose, isoDate(bucketStart), isoDate(bucketEnd))), "value"),
      });
    }
    return result;
  }, [range, currentDeals]);

  const funnelData = [
    { name: "All leads", value: currentLeads.length, color: "#3B82F6" },
    { name: "Qualified", value: qualified, color: "#8B5CF6" },
    { name: "Converted", value: converted, color: "#10B981" },
  ];
  const sourceData = useMemo(() => {
    const counts = currentLeads.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {});
    const total = currentLeads.length || 1;
    return Object.entries(counts).map(([name, count], index) => ({
      name, value: Math.round((count / total) * 100), count, color: COLORS[index % COLORS.length],
    }));
  }, [currentLeads]);

  const activities = useMemo(() => makeActivityRows(), []);
  const filteredActivities = activities.filter((item) => {
    if (activityFilter === "All") return true;
    return item.status === activityFilter;
  });

  function handlePeriodChange(value) {
    setPeriod(value);
    if (value === "Custom Range") {
      setCustomStart(appliedRange.start);
      setCustomEnd(appliedRange.end);
    }
  }
  function applyCustomRange() {
    if (!customStart || !customEnd || customStart > customEnd) return;
    setAppliedRange({ start: customStart, end: customEnd });
    setPeriod("Custom Range");
  }
  function exportActivities() {
    const header = ["Name", "Activity", "Details", "Date", "Status"];
    const rows = filteredActivities.map((item) => [item.name, item.action, item.detail, item.time, item.status]);
    const csv = [header, ...rows].map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-activities.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-bg p-3 text-text sm:p-5 lg:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
              <LayoutDashboard size={15} /><span>Workspace</span><span>/</span><span className="text-primary">Overview</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Business Overview</h1>
            <p className="mt-2 text-sm text-text-muted">Track your leads, quotations, revenue, and business performance.</p>
          </div>
          <button onClick={exportActivities} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-hover sm:w-auto">
            <Download size={17} /> Export activity
          </button>
        </header>

        <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><CalendarDays size={19} /></div>
              <div><p className="text-sm font-semibold text-text">Reporting period</p><p className="text-xs text-text-muted">Compare against the previous period</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {periods.map((item) => (
                <button key={item} onClick={() => handlePeriodChange(item)} className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${period === item ? "bg-primary text-white shadow-sm" : "bg-bg text-text-muted hover:bg-surface-hover hover:text-text"}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          {period === "Custom Range" && (
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
              <label className="grid gap-1 text-xs text-text-muted">Start date
                <input type="date" value={customStart} max={customEnd} onChange={(e) => setCustomStart(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary sm:w-auto" />
              </label>
              <label className="grid gap-1 text-xs text-text-muted">End date
                <input type="date" value={customEnd} min={customStart} onChange={(e) => setCustomEnd(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary sm:w-auto" />
              </label>
              <button onClick={applyCustomRange} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white sm:w-auto">Apply range</button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Showing {range.start} to {range.end}</span>
            <span className="rounded-md bg-primary-soft px-2 py-1 font-medium text-primary">{period}</span>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-4">
          <MetricCard title="Total Leads" value={metrics.leads.toLocaleString("en-IN")} change={metrics.changes[0]} subtitle={`${currentLeads.length} leads in selected period`} icon={Users} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
          <MetricCard title="Qualified Leads" value={metrics.qualified.toLocaleString("en-IN")} change={metrics.changes[1]} subtitle="Leads ready for conversion" icon={UserRoundCheck} accent="bg-violet-500/10 text-violet-600 dark:text-violet-400" />
          <MetricCard title="Converted Leads" value={metrics.converted.toLocaleString("en-IN")} change={metrics.changes[2]} subtitle={`${conversionRate}% of selected leads`} icon={Target} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
          <MetricCard title="Won Revenue" value={currency(metrics.revenue)} change={metrics.changes[3]} subtitle="Revenue from won deals" icon={CircleDollarSign} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
          <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:col-span-2 sm:p-6 xl:col-span-2">
            <SectionHeading title="Lead generation trend" subtitle="Leads created across the selected period" action={<button className="rounded-lg p-2 text-text-muted hover:bg-surface-hover" aria-label="Chart options"><MoreHorizontal size={20} /></button>} />
            <div className="h-[240px] w-full sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadChartData} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                  <defs><linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={12} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="previous" name="Previous period" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} fill="transparent" />
                  <Area type="monotone" dataKey="leads" name="Current period" stroke="#3B82F6" strokeWidth={2.5} fill="url(#leadFill)" activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-text-muted"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-blue-500" />Current period</span><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-400" />Previous period</span></div>
          </article>

          <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <SectionHeading title="Lead funnel" subtitle="Progress across sales stages" />
            <div className="space-y-5">
              {funnelData.map((item) => {
                const percentage = funnelData[0].value ? (item.value / funnelData[0].value) * 100 : 0;
                return <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-sm text-text-muted"><span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</div><span className="text-sm font-semibold text-text">{item.value.toLocaleString("en-IN")}</span></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-bg"><div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: item.color }} /></div>
                  <p className="mt-1.5 text-right text-xs text-text-muted">{percentage.toFixed(1)}% of total leads</p>
                </div>;
              })}
            </div>
            <div className="mt-6 rounded-xl bg-primary-soft p-4"><p className="text-sm font-semibold text-primary">Lead conversion</p><p className="mt-1 text-2xl font-bold text-text">{conversionRate}%</p><p className="mt-1 text-xs text-text-muted">Converted leads out of total leads</p></div>
          </article>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
          <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:col-span-2 sm:p-6 xl:col-span-2">
            <SectionHeading title="Revenue overview" subtitle="Revenue from won deals in the selected period" action={<span className="rounded-lg bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">INR (₹)</span>} />
            <div className="mb-4"><p className="text-xs text-text-muted">Won revenue</p><p className="mt-1 break-words text-2xl font-bold text-text">{currency(metrics.revenue)}</p></div>
            <div className="h-[230px] w-full sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={12} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={shortCurrency} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<ChartTooltip money />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <SectionHeading title="Lead sources" subtitle="Where leads originate" />
            {sourceData.length ? <>
              <div className="relative h-[210px] w-full sm:h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="none">
                      {sourceData.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip formatter={(value, _name, props) => [`${value}% (${props.payload.count} leads)`, "Share"]} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-text">100%</span><span className="text-xs text-text-muted">Lead sources</span></div>
              </div>
              <div className="mt-3 space-y-3">
                {sourceData.map((item) => <div key={item.name} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2 text-sm text-text-muted"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="truncate">{item.name}</span></div><span className="shrink-0 text-sm font-semibold text-text">{item.value}% <span className="font-normal text-text-muted">({item.count})</span></span></div>)}
              </div>
            </> : <p className="py-10 text-center text-sm text-text-muted">No lead sources for this period.</p>}
          </article>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { title: "Quotations", count: currentQuotes.length, amount: sum(currentQuotes, "amount"), icon: FileText },
            { title: "Orders", count: currentOrders.length, amount: sum(currentOrders, "amount"), icon: Package },
            { title: "Payments received", count: currentPayments.filter((p) => p.status === "Paid").length, amount: sum(currentPayments.filter((p) => p.status === "Paid"), "amount"), icon: CreditCard },
          ].map(({ title, count, amount, icon: Icon }) => <article key={title} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon size={20} /></div><div className="min-w-0"><p className="text-sm text-text-muted">{title}</p><p className="mt-1 text-xl font-bold text-text">{count}</p><p className="mt-1 break-words text-xs text-text-muted">{currency(amount)}</p></div></article>)}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
            <div><h2 className="font-semibold text-text">Recent activity</h2><p className="mt-1 text-sm text-text-muted">Latest updates across your business</p></div>
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <select value={activityFilter} onChange={(e) => setActivityFilter(e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-bg py-2 pl-3 pr-9 text-sm text-text outline-none focus:border-primary sm:w-auto">
                  <option value="All">All statuses</option><option value="New">New</option><option value="Qualified">Qualified</option><option value="Converted">Converted</option><option value="Accepted">Accepted</option><option value="Won">Won</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="In Progress">In Progress</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>
              <button onClick={exportActivities} className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-surface-hover hover:text-text" title="Export activity CSV" aria-label="Export activity CSV"><Download size={18} /></button>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead><tr className="border-y border-border bg-bg/70 text-xs uppercase tracking-wide text-text-muted"><th className="px-4 py-3 font-medium sm:px-6">Contact / Record</th><th className="px-4 py-3 font-medium">Activity</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Date</th></tr></thead>
              <tbody>
                {filteredActivities.map((item) => <tr key={item.id} className="border-b border-border last:border-0 transition hover:bg-surface-hover">
                  <td className="px-4 py-4 sm:px-6"><div className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">{item.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><span className="text-sm font-semibold text-text">{item.name}</span></div></td>
                  <td className="px-4 py-4"><p className="text-sm font-medium text-text">{item.action}</p><p className="mt-1 text-xs text-text-muted">{item.detail}</p></td>
                  <td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${["Paid", "Converted", "Accepted", "Won", "Completed"].includes(item.status) ? "bg-green-500/10 text-green-600 dark:text-green-400" : item.status === "Lost" || item.status === "Pending" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>{item.status}</span></td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm text-text-muted">{item.time}</td>
                </tr>)}
                {!filteredActivities.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-text-muted">No activities match this filter.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:px-6"><p className="text-xs text-text-muted">Showing {filteredActivities.length} activities</p><button onClick={() => setActivityFilter("All")} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Reset filter <ArrowRight size={15} /></button></div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <Link to="/leads" className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary/50 hover:shadow-lg sm:p-5"><div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-blue-500/10 p-3 text-blue-500"><Users size={22} /></div><div className="min-w-0"><p className="font-semibold text-text">Manage leads</p><p className="mt-1 text-xs text-text-muted">Explore lead records and history</p></div></div><ArrowRight size={18} className="shrink-0 text-text-muted" /></Link>
          <Link to="/deals" className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary/50 hover:shadow-lg sm:p-5"><div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500"><BriefcaseBusiness size={22} /></div><div className="min-w-0"><p className="font-semibold text-text">Explore deals</p><p className="mt-1 text-xs text-text-muted">Review revenue and deal progress</p></div></div><ArrowRight size={18} className="shrink-0 text-text-muted" /></Link>
        </section>

        <footer className="flex flex-col justify-between gap-2 border-t border-border pt-5 text-xs text-text-muted sm:flex-row"><p>Business Intelligence Dashboard</p><p>Demo data · For analytics preview only</p></footer>
      </div>
    </main>
  );
}
