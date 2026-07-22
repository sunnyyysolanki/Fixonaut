export type Technician = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  skills: string | null;
  serviceArea: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTechnicianValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  skills: string;
  serviceArea: string;
};

export type UpdateTechnicianValues = {
  name: string;
  phone: string;
  skills: string;
  serviceArea: string;
};

export type TechnicianFilters = {
  page: number;
  size: number;
  search: string;
};

export type TechnicianPageResponse = {
  content: Technician[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};
