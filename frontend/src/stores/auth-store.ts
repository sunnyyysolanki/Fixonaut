import { create } from "zustand";

export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "DISPATCHER"
  | "TECHNICIAN"
  | "CUSTOMER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  roles: UserRole[];
  organizationId: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    }),

  hasRole: (role) => get().user?.roles.includes(role) ?? false,
}));
