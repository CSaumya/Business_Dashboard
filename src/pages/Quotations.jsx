import { useMemo, useState } from "react";
import {
  FileText,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Search,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import KPICard from "../components/KPICard";
import { quotations } from "../data/dummyData";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getStatus = (quotation) => quotation.status || "Pending";

const getValue = (quotation) =>
  Number(quotation.value ?? quotation.amount ?? quotation.total ?? 0);

const Quotations = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const metrics = useMemo(() => {
    const approved = quotations.filter((quotation) =>
      ["approved", "accepted", "converted", "won"].includes(
        getStatus(quotation).toLowerCase()
      )
    );

    const pending = quotations.filter((quotation) =>
      ["pending", "sent", "draft", "under review"].includes(
        getStatus(quotation).toLowerCase()
      )
    );

    return {
      total: quotations.length,
      totalValue: quotations.reduce(
        (sum, quotation) => sum + getValue(quotation),
        0
      ),
      approved: approved.length,
      pending: pending.length,
    };
  }, []);

  const statusData = useMemo(() => {
    const counts = {};

    quotations.forEach((quotation) => {
      const status = getStatus(quotation);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const categoryData = useMemo(() => {
    const totals = {};

    quotations.forEach((quotation) => {
      const category =
        quotation.category || quotation.service || "Other";

      totals[category] = (totals[category] || 0) + getValue(quotation);
    });

    return Object.entries(totals).map(([category, value]) => ({
      category,
      value,
    }));
  }, []);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const name =
        quotation.name ||
        quotation.title ||
        quotation.quotationNumber ||
        quotation.quoteNumber ||
        "";

      const customer =
        quotation.customer ||
        quotation.client ||
        quotation.company ||
        "";

      const matchesSearch =
        `${name} ${customer}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || getStatus(quotation) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const statuses = [
    "All",
    ...new Set(quotations.map((quotation) => getStatus(quotation))),
  ];

  const exportCSV = () => {
    const headers = [
      "Quotation",
      "Customer",
      "Category",
      "Value",
      "Status",
    ];

    const rows = filteredQuotations.map((quotation, index) => [
      quotation.name ||
        quotation.title ||
        quotation.quotationNumber ||
        quotation.quoteNumber ||
        `Quotation ${index + 1}`,
      quotation.customer || quotation.client || quotation.company || "",
      quotation.category || quotation.service || "Other",
      getValue(quotation),
      getStatus(quotation),
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "quotations.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Quotations</h2>
          <p className="mt-1 text-sm text-text-muted">
            Monitor quotation values, statuses, and sales conversion.
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
          title="Total Quotations"
          value={metrics.total}
          icon={FileText}
          color="text-indigo-500"
        />

        <KPICard
          title="Total Quotation Value"
          value={formatCurrency(metrics.totalValue)}
          icon={IndianRupee}
          color="text-emerald-500"
        />

        <KPICard
          title="Approved Quotations"
          value={metrics.approved}
          icon={CheckCircle2}
          color="text-blue-500"
        />

        <KPICard
          title="Pending Quotations"
          value={metrics.pending}
          icon={Clock3}
          color="text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <h3 className="font-semibold text-text">
            Quotation Value by Category
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Compare the total value of quotations across services.
          </p>

          <div className="mt-4 h-72">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                  />
                  <XAxis
                    dataKey="category"
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
                  <Bar
                    dataKey="value"
                    name="Quotation Value"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                No quotation data available.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-text">Quotation Status</h3>
          <p className="mt-1 text-sm text-text-muted">
            Current quotation distribution
          </p>

          <div className="h-56">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={4}
                  >
                    {statusData.map((item, index) => (
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
                No quotation statuses available.
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

      {/* Quotations table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold text-text">All Quotations</h3>
            <p className="mt-1 text-sm text-text-muted">
              {filteredQuotations.length} quotations found
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
              <Search size={17} className="text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search quotations..."
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted sm:w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none"
              aria-label="Filter quotations by status"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredQuotations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-bg text-text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Quotation</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Value</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Lead / Deal</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredQuotations.map((quotation, index) => (
                  <tr
                    key={quotation.id || quotation._id || index}
                    className="transition hover:bg-bg/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-text">
                        {quotation.name ||
                          quotation.title ||
                          quotation.quotationNumber ||
                          quotation.quoteNumber ||
                          `Quotation ${index + 1}`}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {quotation.customer ||
                          quotation.client ||
                          quotation.company ||
                          "Customer not specified"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-text-muted">
                      {quotation.category || quotation.service || "Other"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-text">
                      {formatCurrency(getValue(quotation))}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text">
                        {getStatus(quotation)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-text-muted">
                      {quotation.dealId
                        ? `Deal: ${quotation.dealId}`
                        : quotation.leadId
                          ? `Lead: ${quotation.leadId}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-text-muted">
            No quotations match your search or status filter.
          </div>
        )}
      </section>
    </div>
  );
};

export default Quotations;