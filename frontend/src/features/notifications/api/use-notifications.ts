import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification-api";

const notificationKeys = {
  all: ["notifications"] as const,

  list: (unreadOnly: boolean, page: number, size: number) =>
    [...notificationKeys.all, "list", unreadOnly, page, size] as const,

  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useNotifications(unreadOnly = false, page = 0, size = 20) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly, page, size),
    queryFn: () => getNotifications(unreadOnly, page, size),
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}
