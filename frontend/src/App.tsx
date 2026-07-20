import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type HealthResponse = {
  status: string;
  service: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<HealthResponse>("/health")
      .then((response) => {
        setHealth(response.data);
      })
      .catch(() => {
        setError("Backend is not reachable");
      });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl md:p-12">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
          Fixonaut
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          Field service, under control.
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-400">
          Fixonaut helps service businesses manage customers, technicians,
          jobs, inventory, and invoices.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-xl bg-slate-800 p-4 text-slate-300">
          <span
            className={`h-3 w-3 rounded-full ${health
              ? "bg-emerald-500"
              : error
                ? "bg-red-500"
                : "bg-yellow-400"
              }`}
          />

          {health && (
            <span>
              Backend connected: {health.service} is {health.status}
            </span>
          )}

          {error && <span>{error}</span>}

          {!health && !error && <span>Checking backend connection...</span>}
        </div>
      </section>
    </main>
  );
}

export default App;