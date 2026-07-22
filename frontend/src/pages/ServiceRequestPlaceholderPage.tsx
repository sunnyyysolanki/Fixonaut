import { Link, useLocation } from "react-router-dom";

function ServiceRequestPlaceholderPage() {
  const location = useLocation();

  return (
    <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
      <h1 className="text-xl font-semibold text-white">
        Service request detail
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        This screen will be implemented next.
      </p>

      <p className="mt-4 break-all text-xs text-slate-500">
        {location.pathname}
      </p>

      <Link
        to="/service-requests"
        className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
      >
        ← Back to service requests
      </Link>
    </section>
  );
}

export default ServiceRequestPlaceholderPage;
