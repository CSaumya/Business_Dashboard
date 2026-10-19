import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  BriefcaseBusiness,
  ShoppingBag,
  CreditCard,
  Menu,
  X,
  ChartNoAxesCombined,
  ChevronLeft,
} from "lucide-react";

const navItems = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Leads", path: "/leads", icon: Users },
  { name: "Quotations", path: "/quotations", icon: FileText },
  { name: "Deals & Revenue", path: "/deals", icon: BriefcaseBusiness },
  { name: "Orders", path: "/orders", icon: ShoppingBag },
  { name: "Payments", path: "/payments", icon: CreditCard },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-50 rounded-xl border border-border bg-surface p-2.5 text-text shadow-sm lg:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white">
              <ChartNoAxesCombined size={22} />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-text">
                Insight<span className="text-primary">Flow</span>
              </h1>
              <p className="text-xs text-text-muted">Business Analytics</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-text-muted hover:bg-surface-hover lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-text-muted hover:bg-surface-hover hover:text-text"
                  }`
                }
              >
                <Icon size={19} />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom card */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ChartNoAxesCombined size={19} />
            </div>
            <p className="text-sm font-semibold text-text">
              Performance overview
            </p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Monitor leads, revenue, and business growth in one place.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 px-2 text-xs text-text-muted">
            <span className="size-2 rounded-full bg-emerald-500" />
            Demo workspace
          </div>
        </div>
      </aside>
    </>
  );
}