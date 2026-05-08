const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    createdAt: string;
    navigateTo?: string;
    isRead: boolean;
}

export const notificationService = {
    async getNotifications(): Promise<NotificationItem[]> {
        const token = localStorage.getItem("smartvision_token");

        const res = await fetch(`${BASE_URL}/Notifications`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Failed to fetch notifications");

        return res.json();
    },
};