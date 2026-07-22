import { Client } from "@stomp/stompjs";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth-store";

export function useNotificationSocket() {
    const queryClient = useQueryClient();

    const accessToken = useAuthStore(
        (state) => state.accessToken,
    );

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated,
    );

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            return;
        }

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",

            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },

            reconnectDelay: 5000,

            debug: () => {
                // Keep empty in development to avoid noisy logs.
            },

            onConnect: () => {
                client.subscribe(
                    "/user/queue/notifications",
                    () => {
                        queryClient.invalidateQueries({
                            queryKey: ["notifications"],
                        });
                    },
                );
            },

            onStompError: (frame) => {
                console.error(
                    "WebSocket broker error:",
                    frame.headers["message"],
                );
            },

            onWebSocketError: (event) => {
                console.error("WebSocket connection error:", event);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [
        accessToken,
        isAuthenticated,
        queryClient,
    ]);
}