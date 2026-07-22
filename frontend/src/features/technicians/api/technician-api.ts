import { apiClient } from "@/lib/api-client";
import type {
  CreateTechnicianValues,
  Technician,
  TechnicianFilters,
  TechnicianPageResponse,
  UpdateTechnicianValues,
} from "../types";

export async function getTechnicians(
  filters: TechnicianFilters,
): Promise<TechnicianPageResponse> {
  const response = await apiClient.get<TechnicianPageResponse>("/technicians", {
    params: {
      page: filters.page,
      size: filters.size,
      search: filters.search || undefined,
    },
  });

  return response.data;
}

export async function createTechnician(
  values: CreateTechnicianValues,
): Promise<Technician> {
  const response = await apiClient.post<Technician>("/technicians", values);

  return response.data;
}

export async function updateTechnician(
  technicianId: string,
  values: UpdateTechnicianValues,
): Promise<Technician> {
  const response = await apiClient.patch<Technician>(
    `/technicians/${technicianId}`,
    values,
  );

  return response.data;
}

export async function deactivateTechnician(
  technicianId: string,
): Promise<Technician> {
  const response = await apiClient.patch<Technician>(
    `/technicians/${technicianId}/deactivate`,
  );

  return response.data;
}
