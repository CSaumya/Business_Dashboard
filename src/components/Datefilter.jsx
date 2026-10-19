import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

const periods = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Custom Range", value: "custom" },
];

const Datefilter = ({ onChange }) => {
  const [period, setPeriod] = useState("7days");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handlePeriodChange = (value) => {
    setPeriod(value);

    if (value !== "custom") {
      onChange?.({ period: value, startDate: "", endDate: "" });
    }
  };

  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);

    if (start && end && start <= end) {
      onChange?.({
        period: "custom",
        startDate: start,
        endDate: end,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <CalendarDays size={20} className="text-primary" />

        <div>
          <h3 className="font-semibold text-text">Date Range</h3>
          <p className="text-xs text-text-muted">
            Filter dashboard performance
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={period}
            onChange={(event) => handlePeriodChange(event.target.value)}
            className="appearance-none rounded-xl border border-border bg-bg py-2.5 pl-3 pr-9 text-sm text-text outline-none focus:border-primary"
            aria-label="Select date range"
          >
            {periods.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>

        {period === "custom" && (
          <>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) =>
                handleCustomDateChange(event.target.value, endDate)
              }
              className="min-w-0 rounded-xl border border-border bg-bg p-2.5 text-sm text-text outline-none focus:border-primary"
              aria-label="Start date"
            />

            <span className="text-sm text-text-muted">to</span>

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) =>
                handleCustomDateChange(startDate, event.target.value)
              }
              className="min-w-0 rounded-xl border border-border bg-bg p-2.5 text-sm text-text outline-none focus:border-primary"
              aria-label="End date"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Datefilter;