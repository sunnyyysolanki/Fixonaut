import { Client } from "@stomp/stompjs";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type {
    Notification,
    NotificationPageResponse,
} from "./types";

import { useAuthStore } from "@/stores/auth-store";

function addNotificationToCache(
    queryClient: ReturnType<typeof useQueryClient>,
    notification: Notification,
) {
    queryClient.setQueriesData<NotificationPageResponse>(
        {
            queryKey: ["notifications", "list"],
        },
        (previousData) => {
            if (!previousData) {
                return previousData;
            }

            const alreadyExists = previousData.content.some(
                (item) => item.id === notification.id,
            );

            if (alreadyExists) {
                return previousData;
            }

            return {
                ...previousData,
                content: [
                    notification,
                    ...previousData.content,
                ].slice(0, previousData.size),
                totalElements: previousData.totalElements + 1,
            };
        },
    );

    queryClient.setQueryData<number>(
        ["notifications", "unread-count"],
        (previousCount = 0) => previousCount + 1,
    );
}

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
                // Keep empty to avoid noisy production logs.
            },

            onConnect: () => {
                client.subscribe(
                    "/user/queue/notifications",
                    (message) => {
                        try {
                            const notification =
                                JSON.parse(
                                    message.body,
                                ) as Notification;

                            addNotificationToCache(
                                queryClient,
                                notification,
                            );

                            queryClient.invalidateQueries({
                                queryKey: ["notifications"],
                            });
                        } catch (error) {
                            console.error(
                                "Unable to process notification",
                                error,
                            );
                        }
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
                console.error(
                    "WebSocket connection error:",
                    event,
                );
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