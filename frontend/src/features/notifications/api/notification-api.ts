import { apiClient } from "@/lib/api-client";

import type { Notification, NotificationPageResponse } from "../types";

export async function getNotifications(
  unreadOnly = false,
  page = 0,
  size = 20,
): Promise<NotificationPageResponse> {
  const response = await apiClient.get<NotificationPageResponse>(
    "/notifications",
    {
      params: {
        unreadOnly,
        page,
        size,
      },
    },
  );

  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    "/notifications/unread-count",
  );

  return response.data.count;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<Notification> {
  const response = await apiClient.patch<Notification>(
    `/notifications/${notificationId}/read`,
  );

  return response.data;
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const response = await apiClient.post<{ updated: number }>(
    "/notifications/read-all",
  );

  return response.data.updated;
}
