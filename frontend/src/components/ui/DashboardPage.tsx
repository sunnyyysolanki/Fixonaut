import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

function DashboardPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-400">Overview</p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor today&apos;s service operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open Requests" value="24" />
        <MetricCard label="Assigned Today" value="12" />
        <MetricCard label="Completed This Week" value="86" />
        <MetricCard label="Pending Payments" value="₹42,500" />
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent service activity
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              The latest updates from your service team.
            </p>
          </div>

          <Badge variant="success">System operational</Badge>
        </CardHeader>

        <CardContent>
          <EmptyState
            title="No activity yet"
            description="Service activity will appear here when requests and technician workflows are added."
          />
        </CardContent>
      </Card>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;