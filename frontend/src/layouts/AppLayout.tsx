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
    "rounded-lg px-3 py-2 text-sm transition",
    isActive
      ? "bg-orange-500 text-white"
      : "text-slate-400 hover:bg-slate-800 hover:text-white",
  ].join(" ");
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-bold text-white">Fixonaut</p>
            <p className="text-xs text-slate-500">Field operations platform</p>
          </div>

          <div className="text-sm text-slate-400">
            Demo Organization
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-73px)] w-64 border-r border-slate-800 p-4 md:block">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navigationClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}