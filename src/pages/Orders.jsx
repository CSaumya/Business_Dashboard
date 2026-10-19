import { useMemo, useState } from "react";
import {
  ShoppingCart,
  IndianRupee,
  PackageCheck,
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
import { orders } from "../data/dummyData";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const getStatus = (order) => order.status || "Pending";

const getValue = (order) =>
  Number(order.value ?? order.amount ?? order.total ?? 0);

const Orders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const metrics = useMemo(() => {
    const completed = orders.filter((order) =>
      ["completed", "delivered", "fulfilled"].includes(
        getStatus(order).toLowerCase()
      )
    );

    const pending = orders.filter((order) =>
      ["pending", "processing", "in progress"].includes(
        getStatus(order).toLowerCase()
      )
    );

    return {
      total: orders.length,
      totalValue: orders.reduce((sum, order) => sum + getValue(order), 0),
      completed: completed.length,
      pending: pending.length,
    };
  }, []);

  const statusData = useMemo(() => {
    const counts = {};

    orders.forEach((order) => {
      const status = getStatus(order);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const monthlyData = useMemo(() => {
    const totals = {};

    orders.forEach((order) => {
      const rawDate = order.date || order.createdAt || order.orderDate;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const month = date.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });

      totals[month] = (totals[month] || 0) + getValue(order);
    });

    return Object.entries(totals).map(([month, value]) => ({
      month,
      value,
    }));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderName =
        order.orderNumber || order.name || order.title || order.id || "";

      const customer =
        order.customer || order.client || order.company || "";

      const matchesSearch = `${orderName} ${customer}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || getStatus(order) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const statuses = [
    "All",
    ...new Set(orders.map((order) => getStatus(order))),
  ];

  const exportCSV = () => {
    const headers = [
      "Order",
      "Customer",
      "Value",
      "Status",
      "Payment Status",
      "Deal ID",
    ];

    const rows = filteredOrders.map((order, index) => [
      order.orderNumber || order.name || order.title || `Order ${index + 1}`,
      order.customer || order.client || order.company || "",
      getValue(order),
      getStatus(order),
      order.paymentStatus || order.payment_status || "Unknown",
      order.dealId || order.deal_id || "",
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
    link.download = "orders.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text">Orders</h2>
          <p className="mt-1 text-sm text-text-muted">
            Track order volumes, fulfilment, and payment progress.
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
          title="Total Orders"
          value={metrics.total}
          icon={ShoppingCart}
          color="text-indigo-500"
        />

        <KPICard
          title="Total Order Value"
          value={formatCurrency(metrics.totalValue)}
          icon={IndianRupee}
          color="text-emerald-500"
        />

        <KPICard
          title="Completed Orders"
          value={metrics.completed}
          icon={PackageCheck}
          color="text-blue-500"
        />

        <KPICard
          title="Pending Orders"
          value={metrics.pending}
          icon={Clock3}
          color="text-amber-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-2">
          <h3 className="font-semibold text-text">Order Value by Month</h3>
          <p className="mt-1 text-sm text-text-muted">
            Total order value grouped by order date
          </p>

          <div className="mt-4 h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
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
                  <Bar
                    dataKey="value"
                    name="Order Value"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-muted">
                Add order dates to your dummy data to display this chart.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-text">Order Status</h3>
          <p className="mt-1 text-sm text-text-muted">
            Current order distribution
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
                No orders available.
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

      {/* Orders table */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold text-text">All Orders</h3>
            <p className="mt-1 text-sm text-text-muted">
              {filteredOrders.length} orders found
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
              <Search size={17} className="text-text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders..."
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted sm:w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none"
              aria-label="Filter orders by status"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-bg text-text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Value</th>
                  <th className="px-5 py-4 font-medium">Order Status</th>
                  <th className="px-5 py-4 font-medium">Payment Status</th>
                  <th className="px-5 py-4 font-medium">Deal ID</th>
                  <th className="px-5 py-4 font-medium">Order Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredOrders.map((order, index) => {
                  const rawDate =
                    order.date || order.createdAt || order.orderDate;

                  const orderDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-IN")
                    : "—";

                  return (
                    <tr
                      key={order.id || order._id || index}
                      className="transition hover:bg-bg/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-text">
                          {order.orderNumber ||
                            order.name ||
                            order.title ||
                            `Order ${index + 1}`}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {order.customer ||
                            order.client ||
                            order.company ||
                            "Customer not specified"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-text">
                        {formatCurrency(getValue(order))}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text">
                          {getStatus(order)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-text-muted">
                        {order.paymentStatus ||
                          order.payment_status ||
                          "Unknown"}
                      </td>

                      <td className="px-5 py-4 text-text-muted">
                        {order.dealId || order.deal_id || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-text-muted">
                        {orderDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-text-muted">
            No orders match your search or status filter.
          </div>
        )}
      </section>
    </div>
  );
};

export default Orders;