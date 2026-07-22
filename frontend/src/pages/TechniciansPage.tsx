import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useTechnicians } from "@/features/technicians/api/use-technicians";

import type { Technician } from "@/features/technicians/types";

import { useDebounce } from "@/hooks/use-debounce";

function TechniciansPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchInput);

  const { data, isLoading, isError } = useTechnicians({
    page,
    size: 10,
    search: debouncedSearch,
  });

  const technicians = data?.content ?? [];

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(0);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">Operations</p>

          <h1 className="mt-1 text-3xl font-bold text-white">Technicians</h1>

          <p className="mt-2 text-slate-400">
            Manage technicians and their service capabilities.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-72">
            <Input
              label="Search technicians"
              placeholder="Search by name or area..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <Link
            to="/technicians/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            + New technician
          </Link>
        </div>
      </header>

      {isLoading && <TechniciansLoading />}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-400">
              Unable to load technicians.
            </p>

            <p className="mt-2 text-sm text-slate-400">Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && technicians.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xl text-slate-400">
              +
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              No technicians found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Create your first technician to assign service requests.
            </p>

            <Link
              to="/technicians/new"
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              + Create technician
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && technicians.length > 0 && (
        <>
          <TechnicianDesktopTable technicians={technicians} />

          <TechnicianMobileCards technicians={technicians} />

          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 0}
            hasPrevious={page > 0}
            hasNext={data ? !data.last : false}
            onPrevious={() => setPage((currentPage) => currentPage - 1)}
            onNext={() => setPage((currentPage) => currentPage + 1)}
          />
        </>
      )}
    </section>
  );
}

function TechnicianDesktopTable({
  technicians,
}: {
  technicians: Technician[];
}) {
  return (
    <Card className="hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-400">
                Technician
              </th>

              <th className="px-6 py-4 font-medium text-slate-400">Phone</th>

              <th className="px-6 py-4 font-medium text-slate-400">Skills</th>

              <th className="px-6 py-4 font-medium text-slate-400">
                Service area
              </th>

              <th className="px-6 py-4 font-medium text-slate-400">Status</th>

              <th className="px-6 py-4 font-medium text-slate-400">Schedule</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {technicians.map((technician) => (
              <tr key={technician.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{technician.name}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    {technician.email}
                  </p>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                  {technician.phone}
                </td>

                <td className="max-w-xs px-6 py-4 text-slate-400">
                  <p className="truncate">{technician.skills ?? "—"}</p>
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {technician.serviceArea ?? "—"}
                </td>

                <td className="px-6 py-4">
                  <TechnicianStatus active={technician.active} />
                </td>

                <td className="px-6 py-4">
                  <Link
                    to={`/technicians/${technician.id}/availability`}
                    className="whitespace-nowrap text-orange-400 hover:text-orange-300"
                  >
                    Availability
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TechnicianMobileCards({ technicians }: { technicians: Technician[] }) {
  return (
    <div className="grid gap-4 md:hidden">
      {technicians.map((technician) => (
        <Card key={technician.id}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">
                  {technician.name}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {technician.email}
                </p>
              </div>

              <TechnicianStatus active={technician.active} />
            </div>

            <div className="space-y-2 text-sm text-slate-400">
              <p>{technician.phone}</p>

              <p>{technician.serviceArea ?? "No area specified"}</p>

              <p>{technician.skills ?? "No skills specified"}</p>
            </div>

            <Link
              to={`/technicians/${technician.id}/availability`}
              className="inline-flex text-sm text-orange-400 hover:text-orange-300"
            >
              Manage availability →
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TechnicianStatus({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

function Pagination({
  currentPage,
  totalPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        Page {currentPage + 1} of {Math.max(totalPages, 1)}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function TechniciansLoading() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-2xl bg-slate-900"
        />
      ))}
    </div>
  );
}

export default TechniciansPage;
