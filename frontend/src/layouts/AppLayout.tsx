import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Customers", path: "/customers" },
  { label: "Service Requests", path: "/service-requests" },
  { label: "Technicians", path: "/technicians" },
  { label: "Inventory", path: "/inventory" },
  { label: "Invoices", path: "/invoices" },
];

function navigationClass({ isActive }: { isActive: boolean }) {
  return [
    "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
    isActive
      ? "bg-orange-500 text-white"
      : "text-slate-400 hover:bg-slate-800 hover:text-white",
  ].join(" ");
}

type NavigationLinksProps = {
  onNavigate?: () => void;
};

function NavigationLinks({ onNavigate }: NavigationLinksProps) {
  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {navigation.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={navigationClass}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div>
      <p className="text-lg font-bold text-white">Fixonaut</p>
      <p className="text-xs text-slate-500">Field operations platform</p>
    </div>
  );
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="text-xl" aria-hidden="true">
                ☰
              </span>
            </button>

            <Brand />
          </div>

          <div className="hidden text-sm text-slate-400 sm:block">
            Demo Organization
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-800 p-4 md:block">
          <NavigationLinks />
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-slate-800 bg-slate-900 p-4 shadow-2xl transition-transform duration-200 md:hidden",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          aria-label="Mobile navigation"
        >
          <div className="mb-8 flex items-center justify-between">
            <Brand />

            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
            >
              <span className="text-xl" aria-hidden="true">
                ×
              </span>
            </button>
          </div>

          <NavigationLinks onNavigate={closeMobileMenu} />
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}