import { useQuery } from "@tanstack/react-query";

import { getDashboardActivity, getDashboardSummary } from "./dashboard-api";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: getDashboardSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: getDashboardActivity,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
