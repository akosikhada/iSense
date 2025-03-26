import React, { useContext, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, Settings, Bell } from "lucide-react-native";
import { ThemeContext } from "../ThemeContext";

interface NavigationBarProps {
	activeTab?: string;
}

const NavigationBar = ({ activeTab = "home" }: NavigationBarProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const { isDarkMode } = useContext(ThemeContext);

	const currentTab =
		activeTab || (pathname === "/" ? "home" : pathname.substring(1));

	// Define theme colors
	const backgroundColor = isDarkMode ? "#1F2937" : "#FFFFFF";
	const activeTabBackground = isDarkMode ? "#374151" : "#EFF6FF";
	const activeIconColor = isDarkMode ? "#60A5FA" : "#3B82F6";
	const inactiveIconColor = isDarkMode ? "#9CA3AF" : "#64748B";
	const activeTextColor = isDarkMode ? "#60A5FA" : "#3B82F6";
	const inactiveTextColor = isDarkMode ? "#9CA3AF" : "#6B7280";
	const borderColor = isDarkMode ? "#374151" : "#E5E7EB";

	// Memoize navigation functions to prevent rerenders
	const navigateToHome = useCallback(() => {
		if (currentTab !== "home") {
			router.push("/");
		}
	}, [currentTab, router]);

	const navigateToPreferences = useCallback(() => {
		if (currentTab !== "preferences") {
			router.push("/preferences");
		}
	}, [currentTab, router]);

	const navigateToNotifications = useCallback(() => {
		if (currentTab !== "notifications") {
			router.push("/notifications");
		}
	}, [currentTab, router]);

	return (
		<View
			className="w-full h-[70px] border-t flex-row justify-around items-center px-4 absolute bottom-0 left-0 right-0 shadow-md"
			style={{
				backgroundColor: backgroundColor,
				borderColor: borderColor,
			}}
		>
			<TouchableOpacity
				className={`flex-1 items-center justify-center py-2 ${
					currentTab === "home" ? "rounded-xl" : ""
				}`}
				style={{
					backgroundColor:
						currentTab === "home" ? activeTabBackground : "transparent",
				}}
				onPress={navigateToHome}
				activeOpacity={0.7}
			>
				<Home
					size={24}
					color={currentTab === "home" ? activeIconColor : inactiveIconColor}
				/>
				<Text
					style={{
						color: currentTab === "home" ? activeTextColor : inactiveTextColor,
						fontSize: 12,
						marginTop: 4,
						fontWeight: currentTab === "home" ? "600" : "400",
					}}
				>
					Home
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				className={`flex-1 items-center justify-center py-2 ${
					currentTab === "preferences" ? "rounded-xl" : ""
				}`}
				style={{
					backgroundColor:
						currentTab === "preferences" ? activeTabBackground : "transparent",
				}}
				onPress={navigateToPreferences}
				activeOpacity={0.7}
			>
				<Settings
					size={24}
					color={
						currentTab === "preferences" ? activeIconColor : inactiveIconColor
					}
				/>
				<Text
					style={{
						color:
							currentTab === "preferences"
								? activeTextColor
								: inactiveTextColor,
						fontSize: 12,
						marginTop: 4,
						fontWeight: currentTab === "preferences" ? "600" : "400",
					}}
				>
					Preferences
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				className={`flex-1 items-center justify-center py-2 ${
					currentTab === "notifications" ? "rounded-xl" : ""
				}`}
				style={{
					backgroundColor:
						currentTab === "notifications"
							? activeTabBackground
							: "transparent",
				}}
				onPress={navigateToNotifications}
				activeOpacity={0.7}
			>
				<Bell
					size={24}
					color={
						currentTab === "notifications" ? activeIconColor : inactiveIconColor
					}
				/>
				<Text
					style={{
						color:
							currentTab === "notifications"
								? activeTextColor
								: inactiveTextColor,
						fontSize: 12,
						marginTop: 4,
						fontWeight: currentTab === "notifications" ? "600" : "400",
					}}
				>
					Notifications
				</Text>
			</TouchableOpacity>
		</View>
	);
};

export default React.memo(NavigationBar);
