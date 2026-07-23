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
  sessionExpired: boolean;
  isBootstrapped: boolean;

  setAuth: (user: AuthUser, accessToken: string) => void;
  clearAuth: () => void;
  setSessionExpired: () => void;
  setBootstrapped: (value: boolean) => void;
  hasRole: (role: UserRole) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  sessionExpired: false,
  isBootstrapped: false,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: true,
      sessionExpired: false,
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      sessionExpired: false,
    }),

  setSessionExpired: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      sessionExpired: true,
    }),

  setBootstrapped: (value) => set({ isBootstrapped: value }),

  hasRole: (role) => get().user?.roles.includes(role) ?? false,
}));
