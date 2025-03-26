import React, { useContext } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Platform,
} from "react-native";
import { Bell, Settings, Car } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemeContext } from "../ThemeContext";

interface HeaderProps {
	title?: string;
	onNotificationsPress?: () => void;
	onSettingsPress?: () => void;
	notificationCount?: number;
}

const Header = ({
	title = "Parking Assistant",
	onNotificationsPress = () => {},
	onSettingsPress = () => {},
	notificationCount = 0,
}: HeaderProps) => {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isDarkMode } = useContext(ThemeContext);

	// Define theme colors
	const backgroundColor = isDarkMode ? "#1F2937" : "#FFFFFF";
	const borderColor = isDarkMode ? "#374151" : "#E5E7EB";
	const titleColor = isDarkMode ? "#FFFFFF" : "#1E3A8A";
	const subtitleColor = isDarkMode ? "#9CA3AF" : "#6B7280";
	const iconBackgroundColor = isDarkMode ? "#374151" : "#EFF6FF";
	const iconColor = isDarkMode ? "#60A5FA" : "#3B82F6";
	const logoBackgroundColor = isDarkMode ? "#1E40AF" : "#DBEAFE";
	const badgeColor = "#EF4444";

	const handleNotificationsPress = () => {
		if (onNotificationsPress) {
			onNotificationsPress();
		} else {
			// Use setTimeout to ensure navigation happens after component is mounted
			setTimeout(() => {
				router.push("/notifications");
			}, 0);
		}
	};

	const handleSettingsPress = () => {
		if (onSettingsPress) {
			onSettingsPress();
		} else {
			// Use setTimeout to ensure navigation happens after component is mounted
			setTimeout(() => {
				router.push("/preferences");
			}, 0);
		}
	};

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: insets.top,
					backgroundColor: backgroundColor,
					borderBottomColor: borderColor,
					borderBottomWidth: 1,
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.05,
					shadowRadius: 8,
					elevation: 3,
				},
			]}
		>
			<View style={styles.headerContent}>
				<View style={styles.titleContainer}>
					<View
						style={[
							styles.logoContainer,
							{ backgroundColor: logoBackgroundColor },
						]}
					>
						<Car size={18} color={iconColor} />
					</View>
					<View style={styles.textContainer}>
						<Text style={[styles.title, { color: titleColor }]}>{title}</Text>
						<Text style={[styles.subtitle, { color: subtitleColor }]}>
							Find your perfect spot
						</Text>
					</View>
				</View>

				<View style={styles.iconsContainer}>
					<TouchableOpacity
						onPress={handleNotificationsPress}
						style={[
							styles.iconButton,
							{ backgroundColor: iconBackgroundColor },
						]}
					>
						<Bell size={20} color={iconColor} />
						{notificationCount > 0 && (
							<View style={styles.badge}>
								<Text style={styles.badgeText}>
									{notificationCount > 9 ? "9+" : notificationCount}
								</Text>
							</View>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleSettingsPress}
						style={[
							styles.iconButton,
							{ backgroundColor: iconBackgroundColor },
						]}
					>
						<Settings size={20} color={iconColor} />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: Platform.OS === "ios" ? 110 : 85,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		height: 60,
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	logoContainer: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	textContainer: {
		flexDirection: "column",
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: 0.25,
	},
	subtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	iconsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconButton: {
		padding: 8,
		borderRadius: 10,
		position: "relative",
	},
	badge: {
		position: "absolute",
		top: -4,
		right: -4,
		backgroundColor: "#EF4444",
		borderRadius: 10,
		minWidth: 16,
		height: 16,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 4,
		borderWidth: 1.5,
		borderColor: "#FFFFFF",
	},
	badgeText: {
		color: "#FFFFFF",
		fontSize: 10,
		fontWeight: "700",
	},
});

export default Header;
