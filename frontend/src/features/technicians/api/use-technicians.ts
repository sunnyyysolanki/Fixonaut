import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTechnician,
  deactivateTechnician,
  getTechnicians,
  updateTechnician,
} from "./technician-api";

import type {
  CreateTechnicianValues,
  Technician,
  TechnicianFilters,
  UpdateTechnicianValues,
} from "../types";

const technicianKeys = {
  all: ["technicians"] as const,

  list: (filters: TechnicianFilters) =>
    [...technicianKeys.all, "list", filters] as const,

  detail: (technicianId: string) =>
    [...technicianKeys.all, "detail", technicianId] as const,
};

export function useTechnicians(filters: TechnicianFilters) {
  return useQuery({
    queryKey: technicianKeys.list(filters),
    queryFn: () => getTechnicians(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateTechnicianValues) => createTechnician(values),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: technicianKeys.all,
      });
    },
  });
}

export function useUpdateTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      technicianId,
      values,
    }: {
      technicianId: string;
      values: UpdateTechnicianValues;
    }) => updateTechnician(technicianId, values),

    onSuccess: (technician: Technician) => {
      queryClient.invalidateQueries({
        queryKey: technicianKeys.all,
      });

      queryClient.setQueryData(
        technicianKeys.detail(technician.id),
        technician,
      );
    },
  });
}

export function useDeactivateTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateTechnician,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: technicianKeys.all,
      });
    },
  });
}
