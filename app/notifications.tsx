import React, { useState, useContext, useMemo, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	Bell,
	Car,
	AlertTriangle,
	Clock,
	CheckCircle,
	X,
	ChevronRight,
} from "lucide-react-native";

// Import components
import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";
import { ThemeContext } from "./preferences";

interface Notification {
	id: string;
	type: "alert" | "info" | "success";
	title: string;
	message: string;
	time: string;
	isRead: boolean;
	actionable?: boolean;
}

function NotificationsScreen() {
	const insets = useSafeAreaInsets();
	const { isDarkMode } = useContext(ThemeContext);

	// Define theme colors as memoized values to prevent recalculations
	const themeColors = useMemo(
		() => ({
			backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6",
			cardBackgroundColor: isDarkMode ? "#374151" : "#FFFFFF",
			textColor: isDarkMode ? "#FFFFFF" : "#1F2937",
			textSecondaryColor: isDarkMode ? "#D1D5DB" : "#6B7280",
			unreadBgColor: isDarkMode ? "#1E3A8A" : "#EFF6FF",
			buttonBgColor: isDarkMode ? "#2563EB" : "#3B82F6",
			markAllBgColor: isDarkMode ? "#374151" : "#E5E7EB",
			emptyIconColor: isDarkMode ? "#6B7280" : "#9CA3AF",
			iconColors: {
				alert: isDarkMode ? "#F87171" : "#EF4444",
				success: isDarkMode ? "#34D399" : "#10B981",
				info: isDarkMode ? "#60A5FA" : "#3B82F6",
			},
			bgColors: {
				alert: isDarkMode ? "#7F1D1D" : "#FEE2E2",
				success: isDarkMode ? "#065F46" : "#D1FAE5",
				info: isDarkMode ? "#1E3A8A" : "#DBEAFE",
			},
			titleColors: {
				unread: isDarkMode ? "#93C5FD" : "#1E40AF",
				read: isDarkMode ? "#FFFFFF" : "#1F2937",
			},
		}),
		[isDarkMode]
	);

	const [notifications, setNotifications] = useState<Notification[]>([
		{
			id: "1",
			type: "alert",
			title: "Parking Time Expiring",
			message: "Your parking in Slot A12 will expire in 15 minutes.",
			time: "15 min ago",
			isRead: false,
			actionable: true,
		},
		{
			id: "2",
			type: "info",
			title: "Preferred Spot Available",
			message: "A parking spot is now available in your preferred Section B.",
			time: "1 hour ago",
			isRead: true,
			actionable: true,
		},
		{
			id: "3",
			type: "success",
			title: "Parking Successful",
			message: "Your vehicle has been properly parked in Slot C5.",
			time: "Yesterday",
			isRead: true,
		},
		{
			id: "4",
			type: "alert",
			title: "Vehicle Misaligned",
			message:
				"Your vehicle appears to be misaligned in the parking slot. Please adjust.",
			time: "2 days ago",
			isRead: true,
		},
		{
			id: "5",
			type: "info",
			title: "New Feature Available",
			message:
				"Try our new voice guidance feature for easier parking alignment.",
			time: "3 days ago",
			isRead: true,
		},
	]);

	// Memoize handlers to prevent rerenders
	const markAsRead = useCallback((id: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification.id === id
					? { ...notification, isRead: true }
					: notification
			)
		);
	}, []);

	const deleteNotification = useCallback((id: string) => {
		setNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);
	}, []);

	const markAllAsRead = useCallback(() => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	}, []);

	const getIconForType = useCallback(
		(type: string) => {
			switch (type) {
				case "alert":
					return (
						<AlertTriangle size={22} color={themeColors.iconColors.alert} />
					);
				case "success":
					return (
						<CheckCircle size={22} color={themeColors.iconColors.success} />
					);
				case "info":
				default:
					return <Bell size={22} color={themeColors.iconColors.info} />;
			}
		},
		[themeColors.iconColors]
	);

	const getBackgroundForType = useCallback(
		(type: string) => {
			return themeColors.bgColors[type as keyof typeof themeColors.bgColors];
		},
		[themeColors.bgColors]
	);

	// Create a memoized NotificationCard component
	const NotificationCard = useCallback(
		({ notification }: { notification: Notification }) => (
			<View
				className="mb-3 rounded-lg overflow-hidden"
				style={{
					backgroundColor: notification.isRead
						? themeColors.cardBackgroundColor
						: themeColors.unreadBgColor,
				}}
			>
				<View className="p-4">
					<View className="flex-row justify-between items-start">
						<View className="flex-row items-center">
							<View
								className="p-2 rounded-full mr-3"
								style={{
									backgroundColor: getBackgroundForType(notification.type),
								}}
							>
								{getIconForType(notification.type)}
							</View>
							<View className="flex-1">
								<Text
									style={{
										fontWeight: "bold",
										color: notification.isRead
											? themeColors.titleColors.read
											: themeColors.titleColors.unread,
									}}
								>
									{notification.title}
								</Text>
								<Text
									style={{
										color: themeColors.textSecondaryColor,
										fontSize: 14,
										marginTop: 4,
									}}
								>
									{notification.message}
								</Text>
								<View className="flex-row items-center mt-2">
									<Clock size={14} color={themeColors.textSecondaryColor} />
									<Text
										style={{
											color: themeColors.textSecondaryColor,
											fontSize: 12,
											marginLeft: 4,
										}}
									>
										{notification.time}
									</Text>
								</View>
							</View>
							<TouchableOpacity
								onPress={() => deleteNotification(notification.id)}
								className="p-1"
							>
								<X size={18} color={themeColors.textSecondaryColor} />
							</TouchableOpacity>
						</View>
					</View>

					{notification.actionable && (
						<View
							className="mt-3 pt-3"
							style={{
								borderTopWidth: 1,
								borderTopColor: isDarkMode ? "#4B5563" : "#F3F4F6",
							}}
						>
							<TouchableOpacity
								onPress={() => markAsRead(notification.id)}
								className="flex-row items-center justify-center py-2 rounded-md"
								style={{ backgroundColor: themeColors.buttonBgColor }}
							>
								<Car size={16} color="#FFFFFF" className="mr-2" />
								<Text className="text-white font-medium">
									{notification.type === "alert"
										? "Extend Parking"
										: "Navigate to Spot"}
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>
			</View>
		),
		[
			deleteNotification,
			markAsRead,
			themeColors,
			getBackgroundForType,
			getIconForType,
			isDarkMode,
		]
	);

	// Create a memoized EmptyState component
	const EmptyState = useMemo(
		() => (
			<View className="items-center justify-center py-20">
				<View
					className="p-5 rounded-full mb-4"
					style={{ backgroundColor: isDarkMode ? "#374151" : "#F3F4F6" }}
				>
					<Bell size={40} color={themeColors.emptyIconColor} />
				</View>
				<Text
					style={{
						color: themeColors.textSecondaryColor,
						textAlign: "center",
						marginBottom: 8,
					}}
				>
					No notifications yet
				</Text>
				<Text
					style={{
						color: isDarkMode ? "#9CA3AF" : "#9CA3AF",
						textAlign: "center",
						fontSize: 14,
					}}
				>
					We'll notify you when there are updates about your parking
				</Text>
			</View>
		),
		[isDarkMode, themeColors.emptyIconColor, themeColors.textSecondaryColor]
	);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.backgroundColor }}
		>
			<Header
				title="Notifications"
				onNotificationsPress={() => {}}
				onSettingsPress={() => {}}
			/>

			<ScrollView className="flex-1 px-4 py-4">
				<View className="flex-row justify-between items-center mb-4">
					<Text
						className="text-lg font-bold"
						style={{ color: themeColors.textColor }}
					>
						Notifications {unreadCount > 0 && `(${unreadCount} new)`}
					</Text>
					{notifications.length > 0 && (
						<TouchableOpacity
							onPress={markAllAsRead}
							className="px-3 py-1 rounded-full"
							style={{ backgroundColor: themeColors.markAllBgColor }}
						>
							<Text
								style={{ color: themeColors.textSecondaryColor, fontSize: 14 }}
							>
								Mark all as read
							</Text>
						</TouchableOpacity>
					)}
				</View>

				{notifications.length > 0
					? notifications.map((notification) => (
							<NotificationCard
								key={notification.id}
								notification={notification}
							/>
					  ))
					: EmptyState}

				<View className="h-20" />
			</ScrollView>

			<NavigationBar activeTab="notifications" />
		</SafeAreaView>
	);
}

export default React.memo(NotificationsScreen);
