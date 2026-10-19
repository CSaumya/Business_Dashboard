import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Download,
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
import { leads } from "../data/dummyData";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

const Leads = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const getStatus = (lead) => lead.status || "New";

  const metrics = useMemo(() => {
    const converted = leads.filter((lead) =>
      ["converted", "qualified", "won"].includes(
        getStatus(lead).toLowerCase()
      )
    ).length;

    const newLeads = leads.filter(
      (lead) => getStatus(lead).toLowerCase() === "new"
    ).length;

    return {
      total: leads.length,
      newLeads,
      converted,
      conversionRate: leads.length
        ? Math.round((converted / leads.length) * 100)
        : 0,
    };
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const name = lead.name || lead.fullName || lead.company || "";
      const email = lead.email || "";
      const status = getStatus(lead);

      const matchesSearch = `${name} ${email}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const sourceData = useMemo(() => {
    const counts = {};

    leads.forEach((lead) => {
      const source = lead.source || "Other";
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const trendData = useMemo(() => {
    const counts = {};

    leads.forEach((lead) => {
      const rawDate = lead.createdAt || lead.date || lead.createdDate;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const day = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

      counts[day] = (counts[day] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .slice(-7);
  }, []);

  const exportCSV = () => {
    const columns = ["Name", "Email", "Source", "Status"];
    const rows = filteredLeads.map((lead) => [
      lead.name || lead.fullName || lead.company || "",
      lead.email || "",
      lead.source || "Other",
      getStatus(lead),
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [
      columns.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "leads.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const statuses = [
    "All",
    ...new Set(leads.map((lead) => getStatus(lead))),
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Leads</h2>
          <p className="mt-1 text-sm text-text-muted">
            Track lead acquisition, sources, and conversion performance.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Leads"
          value={metrics.total}
          icon={Users}
          color="text-blue-500"
        />

        <KPICard
          title="New Leads"
          value={metrics.newLeads}
          icon={UserPlus}
          color="text-indigo-500"
        />

        <KPICard
          title="Qualified / Converted"
          value={metrics.converted}
          icon={UserCheck}
          color="text-emerald-500"
        />

        <KPICard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={Users}
          color="text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <h3 className="font-semibold text-text">Lead Acquisition Trend</h3>
          <p className="mt-1 text-sm text-text-muted">
            Leads grouped by creation date
          </p>

          <div className="mt-4 h-72">
            {trendData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient
                      id="leadGradient"
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
                    dataKey="date"
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Leads"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#leadGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                Add creation dates to your dummy leads to show this trend.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-text">Lead Sources</h3>
          <p className="mt-1 text-sm text-text-muted">
            Where your leads come from
          </p>

          <div className="h-56">
            {sourceData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {sourceData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                No lead sources available.
              </div>
            )}
          </div>

          <div className="space-y-3">
            {sourceData.map((item, index) => (
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
                <span className="font-semibold text-text">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Leads table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold text-text">All Leads</h3>
            <p className="mt-1 text-sm text-text-muted">
              {filteredLeads.length} leads found
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
              <Search size={17} className="text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads..."
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted sm:w-44"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
              <Filter size={17} className="text-text-muted" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="min-w-0 bg-transparent text-sm text-text outline-none"
                aria-label="Filter leads by status"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredLeads.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-bg text-text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Lead</th>
                  <th className="px-5 py-4 font-medium">Source</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead, index) => {
                  const name =
                    lead.name ||
                    lead.fullName ||
                    lead.company ||
                    `Lead ${index + 1}`;

                  const created = lead.createdAt || lead.date || lead.createdDate;
                  const date = created
                    ? new Date(created).toLocaleDateString("en-IN")
                    : "—";

                  return (
                    <tr
                      key={lead.id || lead._id || index}
                      className="transition hover:bg-bg/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-text">{name}</p>
                        <p className="mt-1 text-xs text-text-muted">
                          {lead.email || "No email provided"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-text-muted">
                        {lead.source || "Other"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text">
                          {getStatus(lead)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-text-muted">
                        {date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-text-muted">
            No leads match your search or status filter.
          </div>
        )}
      </section>
    </div>
  );
};

export default Leads;