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
