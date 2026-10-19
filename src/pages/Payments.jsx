import { useMemo, useState } from "react";
import {
  CreditCard,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Search,
  Download,
  AlertCircle,
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
import { payments } from "../data/dummyData";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#06b6d4"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getStatus = (payment) => payment.status || "Pending";

const getValue = (payment) =>
  Number(
    payment.amount ??
      payment.value ??
      payment.total ??
      0
  );

const Payments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const metrics = useMemo(() => {
    const successful = payments.filter((payment) =>
      ["paid", "completed", "success", "successful"].includes(
        getStatus(payment).toLowerCase()
      )
    );

    const pending = payments.filter((payment) =>
      ["pending", "processing", "in progress"].includes(
        getStatus(payment).toLowerCase()
      )
    );

    const failed = payments.filter((payment) =>
      ["failed", "declined", "cancelled", "canceled"].includes(
        getStatus(payment).toLowerCase()
      )
    );

    return {
      total: payments.length,
      totalAmount: payments.reduce(
        (sum, payment) => sum + getValue(payment),
        0
      ),
      received: successful.reduce(
        (sum, payment) => sum + getValue(payment),
        0
      ),
      pending: pending.length,
      failed: failed.length,
    };
  }, []);

  const statusData = useMemo(() => {
    const counts = {};

    payments.forEach((payment) => {
      const status = getStatus(payment);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const methodData = useMemo(() => {
    const totals = {};

    payments.forEach((payment) => {
      const method =
        payment.method ||
        payment.paymentMethod ||
        payment.payment_method ||
        "Other";

      totals[method] = (totals[method] || 0) + getValue(payment);
    });

    return Object.entries(totals).map(([method, amount]) => ({
      method,
      amount,
    }));
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const reference =
        payment.transactionId ||
        payment.transaction_id ||
        payment.reference ||
        payment.id ||
        "";

      const order =
        payment.orderId ||
        payment.order_id ||
        payment.orderNumber ||
        "";

      const customer =
        payment.customer ||
        payment.client ||
        payment.company ||
        "";

      const matchesSearch = `${reference} ${order} ${customer}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || getStatus(payment) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const statuses = [
    "All",
    ...new Set(payments.map((payment) => getStatus(payment))),
  ];

  const exportCSV = () => {
    const headers = [
      "Transaction ID",
      "Order ID",
      "Customer",
      "Amount",
      "Method",
      "Status",
      "Date",
    ];

    const rows = filteredPayments.map((payment, index) => [
      payment.transactionId ||
        payment.transaction_id ||
        payment.reference ||
        `TXN-${index + 1}`,
      payment.orderId ||
        payment.order_id ||
        payment.orderNumber ||
        "",
      payment.customer || payment.client || payment.company || "",
      getValue(payment),
      payment.method ||
        payment.paymentMethod ||
        payment.payment_method ||
        "Other",
      getStatus(payment),
      payment.date || payment.createdAt || payment.paymentDate || "",
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
    link.download = "payments.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Payments</h2>
          <p className="mt-1 text-sm text-text-muted">
            Monitor collections, outstanding payments, and transaction status.
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
          title="Total Transactions"
          value={metrics.total}
          icon={CreditCard}
          color="text-indigo-500"
        />

        <KPICard
          title="Total Payment Value"
          value={formatCurrency(metrics.totalAmount)}
          icon={IndianRupee}
          color="text-blue-500"
        />

        <KPICard
          title="Amount Received"
          value={formatCurrency(metrics.received)}
          icon={CheckCircle2}
          color="text-emerald-500"
        />

        <KPICard
          title="Pending Payments"
          value={metrics.pending}
          icon={Clock3}
          color="text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <h3 className="font-semibold text-text">
            Payment Value by Method
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            Compare transaction amounts across payment methods.
          </p>

          <div className="mt-4 h-72">
            {methodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={methodData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                  />
                  <XAxis
                    dataKey="method"
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
                    dataKey="amount"
                    name="Payment Value"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                No payment methods available.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-text">Payment Status</h3>
          <p className="mt-1 text-sm text-text-muted">
            Transaction status distribution
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
                No payment data available.
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

                <span className="font-semibold text-text">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Payments table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold text-text">All Transactions</h3>
            <p className="mt-1 text-sm text-text-muted">
              {filteredPayments.length} transactions found
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
              <Search size={17} className="text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted sm:w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none"
              aria-label="Filter payments by status"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-bg text-text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Transaction</th>
                  <th className="px-5 py-4 font-medium">Order Reference</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment, index) => {
                  const rawDate =
                    payment.date ||
                    payment.createdAt ||
                    payment.paymentDate;

                  const date = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-IN")
                    : "—";

                  const status = getStatus(payment);
                  const isFailed = [
                    "failed",
                    "declined",
                    "cancelled",
                    "canceled",
                  ].includes(status.toLowerCase());

                  return (
                    <tr
                      key={payment.id || payment._id || index}
                      className="transition hover:bg-bg/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-text">
                          {payment.transactionId ||
                            payment.transaction_id ||
                            payment.reference ||
                            `TXN-${String(index + 1).padStart(3, "0")}`}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {payment.customer ||
                            payment.client ||
                            payment.company ||
                            "Customer not specified"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-text-muted">
                        {payment.orderId ||
                          payment.order_id ||
                          payment.orderNumber ||
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-text">
                        {formatCurrency(getValue(payment))}
                      </td>

                      <td className="px-5 py-4 text-text-muted">
                        {payment.method ||
                          payment.paymentMethod ||
                          payment.payment_method ||
                          "Other"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            isFailed
                              ? "bg-red-500/10 text-red-500"
                              : status.toLowerCase() === "paid" ||
                                  status.toLowerCase() === "completed" ||
                                  status.toLowerCase() === "success"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {isFailed && <AlertCircle size={13} />}
                          {status}
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
            No payments match your search or status filter.
          </div>
        )}
      </section>

      {/* Failed payments summary */}
      {metrics.failed > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
          <div>
            <h3 className="font-semibold text-text">Failed payments need attention</h3>
            <p className="mt-1 text-sm text-text-muted">
              {metrics.failed} transaction(s) have a failed, declined, or cancelled status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;