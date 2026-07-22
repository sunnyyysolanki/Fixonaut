import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useParts } from "@/features/inventory/api/use-inventory";

import type { Part } from "@/features/inventory/types";

import { useDebounce } from "@/hooks/use-debounce";

function InventoryPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchInput);

  const { data, isLoading, isError } = useParts({
    page,
    size: 10,
    search: debouncedSearch,
  });

  const parts = data?.content ?? [];

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(0);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">Operations</p>

          <h1 className="mt-1 text-3xl font-bold text-white">Inventory</h1>

          <p className="mt-2 text-slate-400">
            Track spare parts and stock levels.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-72">
            <Input
              label="Search parts"
              placeholder="Search by SKU or name..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <Link
            to="/inventory/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            + New part
          </Link>
        </div>
      </header>

      {isLoading && <InventoryLoading />}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-400">
              Unable to load inventory.
            </p>

            <p className="mt-2 text-sm text-slate-400">Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && parts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-semibold text-white">No parts found</h2>

            <p className="mt-2 text-sm text-slate-400">
              Add your first spare part to begin tracking stock.
            </p>

            <Link
              to="/inventory/new"
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              + Create part
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && parts.length > 0 && (
        <>
          <PartDesktopTable parts={parts} />
          <PartMobileCards parts={parts} />

          <Pagination
            page={page}
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

function PartDesktopTable({ parts }: { parts: Part[] }) {
  return (
    <Card className="hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-slate-400">Part</th>

              <th className="px-6 py-4 text-slate-400">SKU</th>

              <th className="px-6 py-4 text-slate-400">Stock</th>

              <th className="px-6 py-4 text-slate-400">Reorder level</th>

              <th className="px-6 py-4 text-slate-400">Status</th>

              <th className="px-6 py-4 text-slate-400">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{part.name}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Unit: {part.unit}
                  </p>
                </td>

                <td className="px-6 py-4 text-slate-300">{part.sku}</td>

                <td className="px-6 py-4">
                  <StockValue part={part} />
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {part.reorderLevel}
                </td>

                <td className="px-6 py-4">
                  <PartStatus part={part} />
                </td>

                <td className="px-6 py-4">
                  <Link
                    to={`/inventory/${part.id}`}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    View
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

function PartMobileCards({ parts }: { parts: Part[] }) {
  return (
    <div className="grid gap-4 md:hidden">
      {parts.map((part) => (
        <Card key={part.id}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/inventory/${part.id}`}
                  className="block truncate font-semibold text-white hover:text-orange-400"
                >
                  {part.name}
                </Link>

                <p className="mt-1 text-sm text-slate-400">SKU: {part.sku}</p>
              </div>

              <PartStatus part={part} />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Available stock</p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {part.quantityOnHand}
                </p>
              </div>

              <p className="text-sm text-slate-400">
                Reorder at {part.reorderLevel}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StockValue({ part }: { part: Part }) {
  return (
    <span
      className={
        part.lowStock ? "font-semibold text-amber-400" : "text-slate-200"
      }
    >
      {part.quantityOnHand} {part.unit}
    </span>
  );
}

function PartStatus({ part }: { part: Part }) {
  if (!part.active) {
    return <Badge variant="neutral">Inactive</Badge>;
  }

  if (part.lowStock) {
    return <Badge variant="warning">Low stock</Badge>;
  }

  return <Badge variant="success">Healthy</Badge>;
}

function Pagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        Page {page + 1} of {Math.max(totalPages, 1)}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function InventoryLoading() {
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

export default InventoryPage;
