import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  createTechnicianAvailability,
  getAppointment,
  getAppointments,
  getTechnicianAvailability,
  startAppointment,
  updateAppointment,
} from "./scheduling-api";

import type {
  Appointment,
  CreateAppointmentValues,
  CreateAvailabilityValues,
  UpdateAppointmentValues,
} from "../types";

const schedulingKeys = {
  all: ["scheduling"] as const,

  appointments: (from: string, to: string, technicianId?: string) =>
    [...schedulingKeys.all, "appointments", from, to, technicianId] as const,

  appointment: (appointmentId: string) =>
    [...schedulingKeys.all, "appointment", appointmentId] as const,

  availability: (technicianId: string) =>
    [...schedulingKeys.all, "availability", technicianId] as const,
};

export function useAppointments(
  from: string,
  to: string,
  technicianId?: string,
) {
  return useQuery({
    queryKey: schedulingKeys.appointments(from, to, technicianId),
    queryFn: () => getAppointments(from, to, technicianId),
    enabled: Boolean(from && to),
  });
}

export function useAppointment(appointmentId: string) {
  return useQuery({
    queryKey: schedulingKeys.appointment(appointmentId),
    queryFn: () => getAppointment(appointmentId),
    enabled: Boolean(appointmentId),
  });
}

function refreshScheduling(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({
    queryKey: schedulingKeys.all,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateAppointmentValues) => createAppointment(values),

    onSuccess: () => {
      refreshScheduling(queryClient);
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      values,
    }: {
      appointmentId: string;
      values: UpdateAppointmentValues;
    }) => updateAppointment(appointmentId, values),

    onSuccess: (appointment: Appointment) => {
      refreshScheduling(queryClient);

      queryClient.setQueryData(
        schedulingKeys.appointment(appointment.id),
        appointment,
      );
    },
  });
}

function createAppointmentAction(
  mutationFn: (appointmentId: string) => Promise<Appointment>,
) {
  return function useAppointmentAction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,

      onSuccess: (appointment: Appointment) => {
        refreshScheduling(queryClient);

        queryClient.setQueryData(
          schedulingKeys.appointment(appointment.id),
          appointment,
        );
      },
    });
  };
}

export const useConfirmAppointment =
  createAppointmentAction(confirmAppointment);

export const useStartAppointment = createAppointmentAction(startAppointment);

export const useCompleteAppointment =
  createAppointmentAction(completeAppointment);

export const useCancelAppointment = createAppointmentAction(cancelAppointment);

export function useTechnicianAvailability(technicianId: string) {
  return useQuery({
    queryKey: schedulingKeys.availability(technicianId),
    queryFn: () => getTechnicianAvailability(technicianId),
    enabled: Boolean(technicianId),
  });
}

export function useCreateTechnicianAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateAvailabilityValues) =>
      createTechnicianAvailability(values),

    onSuccess: (_, values) => {
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.availability(values.technicianId),
      });
    },
  });
}
