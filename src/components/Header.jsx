import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

const pageTitles = {
  "/": "Overview",
  "/leads": "Leads",
  "/quotations": "Quotations",
  "/deals": "Deals & Revenue",
  "/orders": "Orders",
  "/payments": "Payments",
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    const enabled = document.documentElement.classList.contains("dark");
    setDarkMode(enabled);
    localStorage.setItem("theme", enabled ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl p-2 text-text hover:bg-bg lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <p className="text-xs text-text-muted">
              Dashboard / {pageTitle}
            </p>
            <h1 className="mt-1 truncate text-xl font-bold text-text sm:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 md:flex">
            <Search size={18} className="text-text-muted" />
            <input
              type="search"
              placeholder="Search..."
              className="w-28 bg-transparent text-sm text-text outline-none placeholder:text-text-muted lg:w-40"
              aria-label="Search dashboard"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-xs text-text-muted lg:inline">
              /
            </kbd>
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-border p-2.5 text-text transition hover:bg-bg"
            aria-label="Toggle dark mode"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            className="relative rounded-xl border border-border p-2.5 text-text transition hover:bg-bg"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white sm:flex">
            SA
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;