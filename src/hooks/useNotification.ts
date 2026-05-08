import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "../services/notificationService";
import type { NotificationItem } from "../services/notificationService";

const POLL_INTERVAL = 60_000;

export const NOTIFICATION_META: Record<string, { color: string; bg: string }> = {
  NEW_AUDIT: { color: "text-blue-600", bg: "bg-blue-50" },
  CRITICAL_ISSUE: { color: "text-red-600", bg: "bg-red-50" },
  NEW_USER: { color: "text-green-600", bg: "bg-green-50" },
  ROLE_CHANGED: { color: "text-purple-600", bg: "bg-purple-50" },
  TASK_ASSIGNED: { color: "text-yellow-600", bg: "bg-yellow-50" },
  OVERDUE_TASK: { color: "text-orange-600", bg: "bg-orange-50" },
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("smartvision_read_notifications");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("smartvision_token");
    if (!token) return;

    setIsLoading(true);

    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch {
      // sessiz geç
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev).add(id);
      localStorage.setItem(
          "smartvision_read_notifications",
          JSON.stringify([...next])
      );
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);

    setReadIds((prev) => {
      const next = new Set([...prev, ...allIds]);
      localStorage.setItem(
          "smartvision_read_notifications",
          JSON.stringify([...next])
      );
      return next;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const notificationsWithRead = notifications.map((n) => ({
    ...n,
    isRead: readIds.has(n.id),
  }));

  return {
    notifications: notificationsWithRead,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};