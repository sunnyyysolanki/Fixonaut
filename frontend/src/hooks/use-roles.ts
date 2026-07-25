import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/stores/auth-store";

/**
 * Returns true when the signed-in user has at least one of the given roles.
 * Use to keep UI actions in sync with backend @PreAuthorize rules so users
 * are never shown a control that will 403.
 */
export function useHasAnyRole(...allowed: UserRole[]): boolean {
  return useAuthStore(
    (state) =>
      state.user?.roles.some((role) => allowed.includes(role)) ?? false,
  );
}
