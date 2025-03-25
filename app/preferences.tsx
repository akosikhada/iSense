import React, {
	useState,
	useEffect,
	useContext,
	useMemo,
	useCallback,
} from "react";
import {
	View,
	Text,
	Switch,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
	StatusBar,
	useColorScheme,
	Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	Bell,
	Vibrate,
	Volume2,
	MapPin,
	Car,
	Moon,
	ChevronRight,
	Settings,
} from "lucide-react-native";

// Import components
import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";

// Create a theme context that can be used across the app
export const ThemeContext = React.createContext({
	isDarkMode: false,
	toggleDarkMode: () => {},
});

// Create a custom ThemeProvider to optimize rendering
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const deviceColorScheme = useColorScheme();
	const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === "dark");

	const toggleDarkMode = useCallback(() => {
		setIsDarkMode((prev) => !prev);
	}, []);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			isDarkMode,
			toggleDarkMode,
		}),
		[isDarkMode, toggleDarkMode]
	);

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
};

export default function PreferencesScreen() {
	const insets = useSafeAreaInsets();
	const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [vibrationEnabled, setVibrationEnabled] = useState(true);
	const [preferredVehicleType, setPreferredVehicleType] = useState("standard");

	// Define theme-based colors as memoized values to prevent recalculations
	const themeColors = useMemo(
		() => ({
			backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6",
			cardBackgroundColor: isDarkMode ? "#374151" : "#FFFFFF",
			textColor: isDarkMode ? "#FFFFFF" : "#1F2937",
			textSecondaryColor: isDarkMode ? "#D1D5DB" : "#6B7280",
			accentBackgroundColor: isDarkMode ? "#1E3A8A" : "#EFF6FF",
			accentIconColor: isDarkMode ? "#60A5FA" : "#3B82F6",
		}),
		[isDarkMode]
	);

	const PreferenceItem = React.memo(
		({
			icon,
			title,
			description,
			toggle,
			value,
			onValueChange,
		}: {
			icon: React.ReactNode;
			title: string;
			description: string;
			toggle?: boolean;
			value?: boolean;
			onValueChange?: (value: boolean) => void;
		}) => (
			<View
				className={`flex-row items-center justify-between p-4 rounded-lg mb-3 shadow-sm`}
				style={{ backgroundColor: themeColors.cardBackgroundColor }}
			>
				<View className="flex-row items-center flex-1 mr-4">
					<View
						className="p-2 rounded-full mr-3"
						style={{ backgroundColor: themeColors.accentBackgroundColor }}
					>
						{icon}
					</View>
					<View className="flex-1">
						<Text
							className="font-medium text-base"
							style={{ color: themeColors.textColor }}
						>
							{title}
						</Text>
						<Text
							className="text-sm mt-1"
							style={{ color: themeColors.textSecondaryColor }}
						>
							{description}
						</Text>
					</View>
				</View>
				{toggle ? (
					<Switch
						value={value}
						onValueChange={onValueChange}
						trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
						thumbColor={value ? "#3B82F6" : "#9CA3AF"}
					/>
				) : (
					<ChevronRight size={20} color={themeColors.textSecondaryColor} />
				)}
			</View>
		)
	);

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.backgroundColor }}
		>
			<Header
				title="Preferences"
				onNotificationsPress={() => {}}
				onSettingsPress={() => {}}
			/>

			<ScrollView className="flex-1 px-4 py-6">
				<Text
					className="text-lg font-bold mb-4 px-1"
					style={{ color: themeColors.textColor }}
				>
					App Settings
				</Text>

				<PreferenceItem
					icon={<Bell size={20} color={themeColors.accentIconColor} />}
					title="Notifications"
					description="Receive alerts about parking availability"
					toggle={true}
					value={notificationsEnabled}
					onValueChange={setNotificationsEnabled}
				/>

				<PreferenceItem
					icon={<Volume2 size={20} color={themeColors.accentIconColor} />}
					title="Sound Alerts"
					description="Play audio guidance during parking"
					toggle={true}
					value={soundEnabled}
					onValueChange={setSoundEnabled}
				/>

				<PreferenceItem
					icon={<Vibrate size={20} color={themeColors.accentIconColor} />}
					title="Vibration"
					description="Vibrate phone for alignment feedback"
					toggle={true}
					value={vibrationEnabled}
					onValueChange={setVibrationEnabled}
				/>

				<PreferenceItem
					icon={<Moon size={20} color={themeColors.accentIconColor} />}
					title="Dark Mode"
					description="Switch to dark theme for night use"
					toggle={true}
					value={isDarkMode}
					onValueChange={toggleDarkMode}
				/>

				<Text
					className="text-lg font-bold mt-6 mb-4 px-1"
					style={{ color: themeColors.textColor }}
				>
					Parking Preferences
				</Text>

				<TouchableOpacity
					className="p-4 rounded-lg mb-3 shadow-sm"
					style={{ backgroundColor: themeColors.cardBackgroundColor }}
					onPress={() => {}}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center">
							<View
								className="p-2 rounded-full mr-3"
								style={{ backgroundColor: themeColors.accentBackgroundColor }}
							>
								<Car size={20} color={themeColors.accentIconColor} />
							</View>
							<Text
								className="font-medium text-base"
								style={{ color: themeColors.textColor }}
							>
								Vehicle Type
							</Text>
						</View>
						<View className="flex-row items-center">
							<Text
								className="mr-2"
								style={{ color: themeColors.accentIconColor }}
							>
								{preferredVehicleType}
							</Text>
							<ChevronRight size={20} color={themeColors.textSecondaryColor} />
						</View>
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					className="p-4 rounded-lg mb-3 shadow-sm"
					style={{ backgroundColor: themeColors.cardBackgroundColor }}
					onPress={() => {}}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center">
							<View
								className="p-2 rounded-full mr-3"
								style={{ backgroundColor: themeColors.accentBackgroundColor }}
							>
								<MapPin size={20} color={themeColors.accentIconColor} />
							</View>
							<Text
								className="font-medium text-base"
								style={{ color: themeColors.textColor }}
							>
								Preferred Locations
							</Text>
						</View>
						<ChevronRight size={20} color={themeColors.textSecondaryColor} />
					</View>
				</TouchableOpacity>

				<TouchableOpacity
					className="p-4 rounded-lg mb-3 shadow-sm"
					style={{ backgroundColor: themeColors.cardBackgroundColor }}
					onPress={() => {}}
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center">
							<View
								className="p-2 rounded-full mr-3"
								style={{ backgroundColor: themeColors.accentBackgroundColor }}
							>
								<Settings size={20} color={themeColors.accentIconColor} />
							</View>
							<Text
								className="font-medium text-base"
								style={{ color: themeColors.textColor }}
							>
								Advanced Settings
							</Text>
						</View>
						<ChevronRight size={20} color={themeColors.textSecondaryColor} />
					</View>
				</TouchableOpacity>

				<View className="h-20" />
			</ScrollView>

			<NavigationBar activeTab="preferences" />
		</SafeAreaView>
	);
}
