import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth-store";
import NotificationBell from "@/features/notifications/NotificationBell";
import { useNotificationSocket } from "@/features/notifications/use-notification-socket";
import type { UserRole } from "@/stores/auth-store";

import { logout as apiLogout } from "@/features/auth/api/auth-api";

type NavigationItem = {
  label: string;
  path: string;
  allowedRoles?: UserRole[];
};

const navigation: NavigationItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Customers", path: "/customers", allowedRoles: ["OWNER", "ADMIN", "DISPATCHER"] },
  { label: "Service Requests", path: "/service-requests", allowedRoles: ["OWNER", "ADMIN", "DISPATCHER", "TECHNICIAN"] },
  { label: "Schedule", path: "/schedule", allowedRoles: ["OWNER", "ADMIN", "DISPATCHER", "TECHNICIAN"] },
  { label: "Technicians", path: "/technicians", allowedRoles: ["OWNER", "ADMIN", "DISPATCHER", "TECHNICIAN"] },
  { label: "Inventory", path: "/inventory", allowedRoles: ["OWNER", "ADMIN", "DISPATCHER"] },
  { label: "Invoices", path: "/invoices", allowedRoles: ["OWNER", "ADMIN", "DISPATCHER"] },
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
  const userRoles = useAuthStore((state) => state.user?.roles ?? []);

  const visibleItems = navigation.filter((item) => {
    if (!item.allowedRoles) {
      return true;
    }

    return item.allowedRoles.some((role) => userRoles.includes(role));
  });

  return (
    <nav className="space-y-1" aria-label="Main navigation">
      {visibleItems.map((item) => (
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

function UserSummary({ name, email }: { name: string; email: string }) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
        {initial}
      </div>

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium text-white">{name}</p>

        <p className="max-w-48 truncate text-xs text-slate-500">{email}</p>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    try {
      await apiLogout();
    } catch (error) {
      // Ignore API errors, proceed with local logout
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }

  useNotificationSocket();

  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            <Brand />
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            {user && <UserSummary name={userName} email={userEmail} />}

            <Button
              type="button"
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={handleLogout}
            >
              Logout
            </Button>

            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white sm:hidden"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
            </button>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <NavigationLinks onNavigate={closeMobileMenu} />

          <div className="mt-8 border-t border-slate-800 pt-4 sm:hidden">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
