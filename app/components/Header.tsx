import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Bell, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemeContext } from "../preferences";

interface HeaderProps {
	title?: string;
	onNotificationsPress?: () => void;
	onSettingsPress?: () => void;
}

const Header = ({
	title = "Parking Assistant",
	onNotificationsPress = () => {},
	onSettingsPress = () => {},
}: HeaderProps) => {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { isDarkMode } = useContext(ThemeContext);

	// Define theme colors
	const backgroundColor = isDarkMode ? "#1F2937" : "#FFFFFF";
	const borderColor = isDarkMode ? "#374151" : "#E5E7EB";
	const titleColor = isDarkMode ? "#FFFFFF" : "#1E3A8A";
	const iconBackgroundColor = isDarkMode ? "#374151" : "#EFF6FF";
	const iconColor = isDarkMode ? "#60A5FA" : "#3B82F6";

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
				},
			]}
		>
			<View className="flex-row items-center justify-between px-4 py-3">
				<Text style={{ fontSize: 20, fontWeight: "bold", color: titleColor }}>
					{title}
				</Text>

				<View className="flex-row space-x-4">
					<TouchableOpacity
						onPress={handleNotificationsPress}
						style={{
							padding: 8,
							borderRadius: 9999,
							backgroundColor: iconBackgroundColor,
						}}
					>
						<Bell size={20} color={iconColor} />
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleSettingsPress}
						style={{
							padding: 8,
							borderRadius: 9999,
							backgroundColor: iconBackgroundColor,
						}}
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
		height: 70,
	},
});

export default Header;
