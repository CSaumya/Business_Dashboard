import { TrendingUp, TrendingDown } from "lucide-react";

const KPICard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "text-blue-500",
}) => {
  const isPositive = change >= 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-text-muted">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-bold text-text">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`rounded-xl bg-bg p-3 ${color}`}>
            <Icon size={22} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={`flex items-center gap-1 font-medium ${
              isPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            {isPositive ? "+" : ""}
            {change}%
          </span>

          <span className="text-text-muted">
            vs. previous period
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;