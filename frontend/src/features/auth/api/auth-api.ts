import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/stores/auth-store";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
};

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", request);

  return response.data;
}

export type RegisterRequest = {
  organizationName: string;
  organizationSlug: string;
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  userId: string;
  organizationId: string;
  organizationName: string;
  userName: string;
  email: string;
  role: string;
};

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>("/auth/register", request);

  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
