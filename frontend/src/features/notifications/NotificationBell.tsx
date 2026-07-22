import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "./api/use-notifications";

function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unreadCountQuery = useUnreadNotificationCount();

  const notificationsQuery = useNotifications(false, 0, 8);

  const markReadMutation = useMarkNotificationAsRead();

  const markAllReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = unreadCountQuery.data ?? 0;
  const notifications = notificationsQuery.data?.content ?? [];

  function handleNotificationClick(
    notificationId: string,
    referenceType: string | null,
    referenceId: string | null,
  ) {
    markReadMutation.mutate(notificationId);

    if (!referenceType || !referenceId) {
      return;
    }

    const destination = getReferenceDestination(referenceType, referenceId);

    if (destination) {
      setOpen(false);
      navigate(destination);
    }
  }

  function handleMarkAllRead() {
    markAllReadMutation.mutate();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label={`Notifications${
          unreadCount > 0 ? `, ${unreadCount} unread` : ""
        }`}
        aria-expanded={open}
      >
        <span className="text-xl" aria-hidden="true">
          ♢
        </span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <h2 className="font-semibold text-white">Notifications</h2>

                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isPending}
                  className="text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationsQuery.isLoading && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Loading notifications...
                </p>
              )}

              {!notificationsQuery.isLoading && notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  No notifications yet.
                </p>
              )}

              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.referenceType,
                      notification.referenceId,
                    )
                  }
                  className={[
                    "block w-full border-b border-slate-800 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-800",
                    !notification.read ? "bg-orange-950/20" : "",
                  ].join(" ")}
                >
                  <div className="flex gap-3">
                    <span
                      className={[
                        "mt-1 h-2 w-2 shrink-0 rounded-full",
                        notification.read ? "bg-slate-700" : "bg-orange-500",
                      ].join(" ")}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-slate-600">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getReferenceDestination(referenceType: string, referenceId: string) {
  switch (referenceType) {
    case "SERVICE_REQUEST":
      return `/service-requests/${referenceId}`;

    case "QUOTE":
      return `/quotes/${referenceId}`;

    case "INVOICE":
      return `/invoices/${referenceId}`;

    default:
      return null;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default NotificationBell;
