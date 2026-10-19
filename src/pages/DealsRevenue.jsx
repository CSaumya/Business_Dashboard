import { useMemo } from "react";
import {
  IndianRupee,
  Handshake,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import KPICard from "../components/KPICard";
import { deals } from "../data/dummyData";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const DealsRevenue = () => {
  const metrics = useMemo(() => {
    const wonDeals = deals.filter(
      (deal) => deal.status?.toLowerCase() === "won"
    );

    const activeDeals = deals.filter((deal) =>
      ["open", "in progress", "negotiation", "pending"].includes(
        deal.status?.toLowerCase()
      )
    );

    const totalRevenue = wonDeals.reduce(
      (sum, deal) => sum + Number(deal.value || deal.amount || 0),
      0
    );

    const pipelineValue = activeDeals.reduce(
      (sum, deal) => sum + Number(deal.value || deal.amount || 0),
      0
    );

    const winRate = deals.length
      ? Math.round((wonDeals.length / deals.length) * 100)
      : 0;

    return {
      totalRevenue,
      pipelineValue,
      wonCount: wonDeals.length,
      winRate,
    };
  }, []);

  const revenueTrend = useMemo(() => {
    const monthlyRevenue = {};

    deals.forEach((deal) => {
      if (deal.status?.toLowerCase() !== "won") return;

      const rawDate = deal.closedAt || deal.date || deal.createdAt;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const month = date.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });

      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) +
        Number(deal.value || deal.amount || 0);
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));
  }, []);

  const statusData = useMemo(() => {
    const counts = {};

    deals.forEach((deal) => {
      const status = deal.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">
            Deals & Revenue
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Track your sales pipeline, closed deals, and revenue performance.
          </p>
        </div>

        <span className="w-fit rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-muted">
          {deals.length} total deals
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Revenue from Won Deals"
          value={formatCurrency(metrics.totalRevenue)}
          icon={IndianRupee}
          color="text-emerald-500"
        />

        <KPICard
          title="Pipeline Value"
          value={formatCurrency(metrics.pipelineValue)}
          icon={Target}
          color="text-indigo-500"
        />

        <KPICard
          title="Won Deals"
          value={metrics.wonCount}
          icon={Handshake}
          color="text-blue-500"
        />

        <KPICard
          title="Win Rate"
          value={`${metrics.winRate}%`}
          icon={TrendingUp}
          color="text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <div className="mb-5">
            <h3 className="font-semibold text-text">Revenue Trend</h3>
            <p className="mt-1 text-sm text-text-muted">
              Revenue from won deals grouped by closing month
            </p>
          </div>

          <div className="h-72 w-full">
            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "var(--text)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                No dated won deals available for the revenue chart.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-text">Deal Status</h3>
          <p className="mt-1 text-sm text-text-muted">
            Breakdown by current status
          </p>

          <div className="h-56">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                No deal data available.
              </div>
            )}
          </div>

          <div className="space-y-3">
            {statusData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2 text-text-muted">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  {item.name}
                </div>
                <span className="font-semibold text-text">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Deals table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border p-5">
          <h3 className="font-semibold text-text">All Deals</h3>
          <p className="mt-1 text-sm text-text-muted">
            Review deal values, priorities, and progress.
          </p>
        </div>

        {deals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-bg text-text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Deal</th>
                  <th className="px-5 py-4 font-medium">Value</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Priority</th>
                  <th className="px-5 py-4 font-medium">Progress</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {deals.map((deal, index) => {
                  const progress = Math.min(
                    100,
                    Math.max(0, Number(deal.progress || 0))
                  );

                  const status = deal.status || "Unknown";
                  const priority = deal.priority || "Normal";

                  return (
                    <tr
                      key={deal.id || deal._id || index}
                      className="transition hover:bg-bg/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-text">
                          {deal.name || deal.title || `Deal ${index + 1}`}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {deal.company || deal.client || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-text">
                        {formatCurrency(deal.value || deal.amount || 0)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text">
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-text-muted">
                        {priority}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex min-w-28 items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                            <div
                              className="h-full rounded-full bg-indigo-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted">
                            {progress}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-text-muted">
            No deals found. Add some sample deals to dummyData.js.
          </div>
        )}
      </section>
    </div>
  );
};

export default DealsRevenue;