import { apiClient } from "@/lib/api-client";
import type { DashboardActivity, DashboardSummary } from "../types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>("/dashboard/summary");

  return response.data;
}
export async function getDashboardActivity(): Promise<DashboardActivity[]> {
  const response = await apiClient.get<DashboardActivity[]>(
    "/dashboard/activity",
  );

  return response.data;
}
