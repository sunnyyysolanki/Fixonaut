import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

type RefreshResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: any;
};

export function useSessionBootstrap() {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isBootstrapped) {
      return;
    }

    if (isAuthenticated) {
      setBootstrapped(true);
      return;
    }

    async function bootstrap() {
      try {
        const response = await apiClient.post<RefreshResponse>(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );
        setAuth(response.data.user, response.data.accessToken);
      } catch (error) {
        // Failed to refresh token, stay unauthenticated
      } finally {
        setBootstrapped(true);
      }
    }

    bootstrap();
  }, [isBootstrapped, isAuthenticated, setAuth, setBootstrapped]);

  return isBootstrapped;
}
