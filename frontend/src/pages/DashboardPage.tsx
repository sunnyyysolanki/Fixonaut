import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

import { useDashboardSummary } from "@/features/dashboard/api/use-dashboard";

function DashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary();

  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-medium text-orange-400">Overview</p>

        <h1 className="mt-1 text-3xl font-bold text-white">Dashboard</h1>

        <p className="mt-2 text-slate-400">
          Monitor today&apos;s service operations.
        </p>
      </header>

      {isLoading && <DashboardLoading />}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-400">
              Unable to load dashboard metrics.
            </p>

            <p className="mt-2 text-sm text-slate-400">Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Open Requests"
              value={String(data.openRequests)}
              description="Active operational workload"
              variant="info"
            />

            <MetricCard
              label="Assigned Today"
              value={String(data.assignedToday)}
              description="Requests scheduled today"
              variant="orange"
            />

            <MetricCard
              label="Completed This Week"
              value={String(data.completedThisWeek)}
              description="Completed service work"
              variant="success"
            />

            <MetricCard
              label="Pending Payments"
              value={formatCurrency(data.pendingPayments)}
              description="Outstanding invoice balance"
              variant="warning"
            />
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recent service activity
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Live activity will appear here as the event feed is added.
                </p>
              </div>

              <Badge variant="success">System operational</Badge>
            </CardHeader>

            <CardContent>
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-10 text-center">
                <p className="text-sm text-slate-500">
                  No recent activity to display.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
  variant,
}: {
  label: string;
  value: string;
  description: string;
  variant: "info" | "orange" | "success" | "warning";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-400">{label}</p>

          <Badge variant={variant}>Live</Badge>
        </div>

        <p className="mt-4 text-3xl font-bold text-white">{value}</p>

        <p className="mt-2 text-xs text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-2xl bg-slate-900"
        />
      ))}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default DashboardPage;
