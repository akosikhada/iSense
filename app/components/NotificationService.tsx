import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SoundService from "./SoundService";
import VibrationService from "./VibrationService";

export interface NotificationData {
	id: string;
	type: "alert" | "info" | "success";
	title: string;
	message: string;
	time: Date;
	isRead: boolean;
	actionable?: boolean;
}

// In a real app, this would integrate with platform-specific notification libraries
// For example: expo-notifications or react-native-push-notification

let notificationsEnabled = true;
let storedNotifications: NotificationData[] = [];

// Initialize the notification system
const initNotifications = async (): Promise<void> => {
	try {
		// Load notification permission state from storage
		const storedNotificationsEnabled = await AsyncStorage.getItem(
			"notificationsEnabled"
		);
		if (storedNotificationsEnabled !== null) {
			notificationsEnabled = storedNotificationsEnabled === "true";
		}

		// Load existing notifications
		const storedNotificationsJson = await AsyncStorage.getItem("notifications");
		if (storedNotificationsJson) {
			try {
				const parsed = JSON.parse(storedNotificationsJson);
				// Convert string dates to Date objects
				storedNotifications = parsed.map((notif: any) => ({
					...notif,
					time: new Date(notif.time),
				}));
			} catch (e) {
				console.error("Error parsing stored notifications", e);
				storedNotifications = [];
			}
		}

		return Promise.resolve();
	} catch (error) {
		console.error("Error initializing notifications:", error);
		return Promise.reject(error);
	}
};

// Get all notifications
const getNotifications = async (): Promise<NotificationData[]> => {
	try {
		// Return a copy of the notifications array, sorted by date (newest first)
		return [...storedNotifications].sort(
			(a, b) => b.time.getTime() - a.time.getTime()
		);
	} catch (error) {
		console.error("Error getting notifications:", error);
		return [];
	}
};

// Get count of unread notifications
const getUnreadCount = async (): Promise<number> => {
	try {
		return storedNotifications.filter((n) => !n.isRead).length;
	} catch (error) {
		console.error("Error getting unread count:", error);
		return 0;
	}
};

// Send a new notification
const sendNotification = async (
	notification: Omit<NotificationData, "id" | "time" | "isRead">
): Promise<string | undefined> => {
	try {
		if (!notificationsEnabled) {
			return undefined;
		}

		const storedNotificationsEnabled = await AsyncStorage.getItem(
			"notificationsEnabled"
		);
		if (storedNotificationsEnabled === "false") {
			return undefined;
		}

		// Generate a unique ID
		const id = Date.now().toString();

		// Create new notification
		const newNotification: NotificationData = {
			id,
			...notification,
			time: new Date(),
			isRead: false,
		};

		// Add to storage
		storedNotifications.push(newNotification);
		await saveNotificationsToStorage();

		// If app is in foreground, show alert (in a real app, this would use proper notification system)
		if (Platform.OS === "ios") {
			Alert.alert(notification.title, notification.message);
		}

		// Play sound if enabled
		await SoundService.playSound("notification");

		// Trigger vibration if enabled
		await VibrationService.triggerVibration("notification");

		return id;
	} catch (error) {
		console.error("Error sending notification:", error);
		return undefined;
	}
};

// Mark a notification as read
const markAsRead = async (id: string): Promise<void> => {
	try {
		storedNotifications = storedNotifications.map((notification) =>
			notification.id === id ? { ...notification, isRead: true } : notification
		);

		await saveNotificationsToStorage();
		return Promise.resolve();
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return Promise.reject(error);
	}
};

// Mark all notifications as read
const markAllAsRead = async (): Promise<void> => {
	try {
		storedNotifications = storedNotifications.map((notification) => ({
			...notification,
			isRead: true,
		}));

		await saveNotificationsToStorage();
		return Promise.resolve();
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return Promise.reject(error);
	}
};

// Delete a notification
const deleteNotification = async (id: string): Promise<void> => {
	try {
		storedNotifications = storedNotifications.filter(
			(notification) => notification.id !== id
		);

		await saveNotificationsToStorage();
		return Promise.resolve();
	} catch (error) {
		console.error("Error deleting notification:", error);
		return Promise.reject(error);
	}
};

// Clear all notifications
const clearAllNotifications = async (): Promise<void> => {
	try {
		storedNotifications = [];
		await saveNotificationsToStorage();
		return Promise.resolve();
	} catch (error) {
		console.error("Error clearing notifications:", error);
		return Promise.reject(error);
	}
};

// Save notifications to AsyncStorage
const saveNotificationsToStorage = async (): Promise<void> => {
	try {
		await AsyncStorage.setItem(
			"notifications",
			JSON.stringify(storedNotifications)
		);
		return Promise.resolve();
	} catch (error) {
		console.error("Error saving notifications to storage:", error);
		return Promise.reject(error);
	}
};

// Update notification enabled state
const setNotificationsEnabled = async (enabled: boolean): Promise<void> => {
	notificationsEnabled = enabled;
	try {
		await AsyncStorage.setItem("notificationsEnabled", enabled.toString());
		return Promise.resolve();
	} catch (error) {
		console.error("Error setting notifications enabled state:", error);
		return Promise.reject(error);
	}
};

const NotificationService = {
	initNotifications,
	getNotifications,
	getUnreadCount,
	sendNotification,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	clearAllNotifications,
	setNotificationsEnabled,
};

export default NotificationService;
