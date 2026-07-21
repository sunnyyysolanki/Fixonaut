function DashboardPage() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-400">Overview</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Monitor today&apos;s service operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open Requests" value="24" />
        <MetricCard label="Assigned Today" value="12" />
        <MetricCard label="Completed This Week" value="86" />
        <MetricCard label="Pending Payments" value="₹42,500" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Recent service activity
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Activity will appear here when service-request workflows are added.
        </p>
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </article>
  );
}

export default DashboardPage;