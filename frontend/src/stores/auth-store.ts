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
  role: UserRole;
  organizationId: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));