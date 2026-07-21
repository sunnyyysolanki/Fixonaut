import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type HealthResponse = {
  status: string;
  service: string;
};

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await apiClient.get<HealthResponse>("/health");
      return response.data;
    },
  });
}