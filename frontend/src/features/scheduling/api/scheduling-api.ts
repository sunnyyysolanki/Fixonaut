import { apiClient } from "@/lib/api-client";

import type {
  Appointment,
  Availability,
  CreateAppointmentValues,
  CreateAvailabilityValues,
  UpdateAppointmentValues,
} from "../types";

export async function getAppointments(
  from: string,
  to: string,
  technicianId?: string,
): Promise<Appointment[]> {
  const response = await apiClient.get<Appointment[]>("/appointments", {
    params: {
      from,
      to,
      technicianId: technicianId || undefined,
    },
  });

  return response.data;
}

export async function getAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.get<Appointment>(
    `/appointments/${appointmentId}`,
  );

  return response.data;
}

export async function createAppointment(
  values: CreateAppointmentValues,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>("/appointments", values);

  return response.data;
}

export async function updateAppointment(
  appointmentId: string,
  values: UpdateAppointmentValues,
): Promise<Appointment> {
  const response = await apiClient.patch<Appointment>(
    `/appointments/${appointmentId}`,
    values,
  );

  return response.data;
}

export async function confirmAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/confirm`,
  );

  return response.data;
}

export async function startAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/start`,
  );

  return response.data;
}

export async function completeAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/complete`,
  );

  return response.data;
}

export async function cancelAppointment(
  appointmentId: string,
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `/appointments/${appointmentId}/cancel`,
  );

  return response.data;
}

export async function getTechnicianAvailability(
  technicianId: string,
): Promise<Availability[]> {
  const response = await apiClient.get<Availability[]>(
    `/technicians/${technicianId}/availability`,
  );

  return response.data;
}

export async function createTechnicianAvailability(
  values: CreateAvailabilityValues,
): Promise<Availability> {
  const response = await apiClient.post<Availability>(
    `/technicians/${values.technicianId}/availability`,
    values,
  );

  return response.data;
}
