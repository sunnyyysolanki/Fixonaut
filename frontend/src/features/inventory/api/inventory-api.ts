import { apiClient } from "@/lib/api-client";

import type {
  CreatePartValues,
  InventoryTransaction,
  Part,
  PartFilters,
  PartPageResponse,
  StockInValues,
  UpdatePartValues,
} from "../types";

export async function getParts(
  filters: PartFilters,
): Promise<PartPageResponse> {
  const response = await apiClient.get<PartPageResponse>("/parts", {
    params: {
      page: filters.page,
      size: filters.size,
      search: filters.search || undefined,
    },
  });

  return response.data;
}

export async function getPart(partId: string): Promise<Part> {
  const response = await apiClient.get<Part>(`/parts/${partId}`);

  return response.data;
}

export async function createPart(values: CreatePartValues): Promise<Part> {
  const response = await apiClient.post<Part>("/parts", values);

  return response.data;
}

export async function updatePart(
  partId: string,
  values: UpdatePartValues,
): Promise<Part> {
  const response = await apiClient.patch<Part>(`/parts/${partId}`, values);

  return response.data;
}

export async function stockIn(
  partId: string,
  values: StockInValues,
): Promise<Part> {
  const response = await apiClient.post<Part>(
    `/parts/${partId}/stock-in`,
    values,
  );

  return response.data;
}

export async function getPartTransactions(
  partId: string,
): Promise<InventoryTransaction[]> {
  const response = await apiClient.get<InventoryTransaction[]>(
    `/parts/${partId}/transactions`,
  );

  return response.data;
}
