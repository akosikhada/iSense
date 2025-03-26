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
	Alert,
	ToastAndroid,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import components
import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";
import { ThemeContext } from "./ThemeContext";
import SoundService from "./components/SoundService";
import VibrationService from "./components/VibrationService";
import NotificationService from "./components/NotificationService";

export default function PreferencesScreen() {
	const insets = useSafeAreaInsets();
	const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
	const router = useRouter();
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [vibrationEnabled, setVibrationEnabled] = useState(true);
	const [preferredVehicleType, setPreferredVehicleType] = useState("standard");
	const [isLoading, setIsLoading] = useState(true);

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

	// Load saved preferences when component mounts
	useEffect(() => {
		const loadPreferences = async () => {
			try {
				const storedNotifications = await AsyncStorage.getItem(
					"notificationsEnabled"
				);
				const storedSound = await AsyncStorage.getItem("soundEnabled");
				const storedVibration = await AsyncStorage.getItem("vibrationEnabled");
				const storedVehicleType = await AsyncStorage.getItem(
					"preferredVehicleType"
				);

				if (storedNotifications !== null) {
					setNotificationsEnabled(storedNotifications === "true");
				}
				if (storedSound !== null) {
					setSoundEnabled(storedSound === "true");
				}
				if (storedVibration !== null) {
					setVibrationEnabled(storedVibration === "true");
				}
				if (storedVehicleType !== null) {
					setPreferredVehicleType(storedVehicleType);
				}
			} catch (error) {
				console.error("Failed to load preferences:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadPreferences();
	}, []);

	// Handle notifications toggle
	const handleNotificationsToggle = useCallback(async (value: boolean) => {
		setNotificationsEnabled(value);
		try {
			await NotificationService.setNotificationsEnabled(value);
			showToast(`Notifications ${value ? "enabled" : "disabled"}`);

			// If notifications are turned off, disable sound and vibration too
			if (!value) {
				setSoundEnabled(false);
				setVibrationEnabled(false);
				await SoundService.setAudioEnabled(false);
				await VibrationService.setVibrationEnabled(false);
			}
		} catch (error) {
			console.error("Failed to save notification preference:", error);
		}
	}, []);

	// Handle sound toggle
	const handleSoundToggle = useCallback(
		async (value: boolean) => {
			setSoundEnabled(value);
			try {
				await SoundService.setAudioEnabled(value);
				showToast(`Sound alerts ${value ? "enabled" : "disabled"}`);

				// Play test sound when enabled
				if (value) {
					await SoundService.playSound("click");
				}

				// If sound is turned on, make sure notifications are also on
				if (value && !notificationsEnabled) {
					setNotificationsEnabled(true);
					await NotificationService.setNotificationsEnabled(true);
				}
			} catch (error) {
				console.error("Failed to save sound preference:", error);
			}
		},
		[notificationsEnabled]
	);

	// Handle vibration toggle
	const handleVibrationToggle = useCallback(
		async (value: boolean) => {
			setVibrationEnabled(value);
			try {
				await VibrationService.setVibrationEnabled(value);
				showToast(`Vibration ${value ? "enabled" : "disabled"}`);

				// Test vibration when enabled
				if (value) {
					await VibrationService.triggerVibration("click");
				}

				// If vibration is turned on, make sure notifications are also on
				if (value && !notificationsEnabled) {
					setNotificationsEnabled(true);
					await NotificationService.setNotificationsEnabled(true);
				}
			} catch (error) {
				console.error("Failed to save vibration preference:", error);
			}
		},
		[notificationsEnabled]
	);

	// Helper function to show feedback
	const showToast = (message: string) => {
		if (Platform.OS === "android") {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		} else {
			// For iOS, use Alert instead of Toast
			// This is simplified - in a real app you might want something less intrusive
			Alert.alert("Settings Updated", message);
		}
	};

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

	// Handle navigation back to home
	const handleBackToHome = useCallback(() => {
		router.push("/");
	}, [router]);

	// Handle navigation to notifications
	const handleGoToNotifications = useCallback(() => {
		router.push("/notifications");
	}, [router]);

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.backgroundColor }}
		>
			<Header
				title="Preferences"
				onNotificationsPress={handleGoToNotifications}
				onSettingsPress={handleBackToHome}
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
					onValueChange={handleNotificationsToggle}
				/>

				<PreferenceItem
					icon={<Volume2 size={20} color={themeColors.accentIconColor} />}
					title="Sound Alerts"
					description="Play audio guidance during parking"
					toggle={true}
					value={soundEnabled}
					onValueChange={handleSoundToggle}
				/>

				<PreferenceItem
					icon={<Vibrate size={20} color={themeColors.accentIconColor} />}
					title="Vibration"
					description="Vibrate phone for alignment feedback"
					toggle={true}
					value={vibrationEnabled}
					onValueChange={handleVibrationToggle}
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

			{/* Navigation Bar */}
			<NavigationBar activeTab="settings" />
		</SafeAreaView>
	);
}
