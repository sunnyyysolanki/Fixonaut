export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type Appointment = {
  id: string;
  serviceRequestId: string;
  serviceRequestTitle: string;
  technicianId: string;
  technicianName: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppointmentValues = {
  serviceRequestId: string;
  technicianId: string;
  startsAt: string;
  endsAt: string;
  notes: string;
};

export type UpdateAppointmentValues = {
  startsAt: string;
  endsAt: string;
  notes: string;
};

export type Availability = {
  id: string;
  technicianId: string;
  technicianName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAvailabilityValues = {
  technicianId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
