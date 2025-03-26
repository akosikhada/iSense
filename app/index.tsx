import React, {
	useState,
	useContext,
	useMemo,
	useCallback,
	useEffect,
} from "react";
import {
	View,
	Text,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Car, Info } from "lucide-react-native";
import { useRouter } from "expo-router";

// Import components
import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";
import ParkingMap from "./components/ParkingMap";
import ParkingAssistant from "./components/ParkingAssistant";
import { ThemeContext } from "./ThemeContext";
import NotificationService from "./components/NotificationService";
import SoundService from "./components/SoundService";
import VibrationService from "./components/VibrationService";

function HomeScreen() {
	const insets = useSafeAreaInsets();
	const { isDarkMode } = useContext(ThemeContext);
	const router = useRouter();
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [showParkingAssistant, setShowParkingAssistant] = useState(false);
	const [alignmentStatus, setAlignmentStatus] =
		useState<string>("not-detected");
	const [filterOptions] = useState({
		vehicleType: "all" as "compact" | "standard" | "large" | "all",
		maxDistance: 100,
	});
	const [notificationCount, setNotificationCount] = useState(0);

	// Initialize services and load notification count
	useEffect(() => {
		const initServices = async () => {
			try {
				// Initialize all services
				await NotificationService.initNotifications();
				await SoundService.initAudio();
				await VibrationService.initVibration();

				// Load notification count
				const unreadCount = await NotificationService.getUnreadCount();
				setNotificationCount(unreadCount);
			} catch (error) {
				console.error("Failed to initialize services:", error);
			}
		};

		initServices();

		// Update notification count periodically
		const interval = setInterval(async () => {
			const count = await NotificationService.getUnreadCount();
			setNotificationCount(count);
		}, 10000); // Check every 10 seconds

		return () => {
			clearInterval(interval);
		};
	}, []);

	// Define theme colors as memoized values
	const themeColors = useMemo(
		() => ({
			backgroundColor: isDarkMode ? "#1F2937" : "#F3F4F6",
			cardBackgroundColor: isDarkMode ? "#374151" : "#FFFFFF",
			welcomeBgColor: isDarkMode ? "#1E3A8A" : "#EFF6FF",
			textColor: isDarkMode ? "#FFFFFF" : "#1F2937",
			textSecondaryColor: isDarkMode ? "#D1D5DB" : "#6B7280",
			welcomeTextColor: isDarkMode ? "#93C5FD" : "#1E40AF",
			infoIconColor: isDarkMode ? "#60A5FA" : "#1E40AF",
			statBgGreen: isDarkMode ? "#065F46" : "#D1FAE5",
			statTextGreen: isDarkMode ? "#34D399" : "#047857",
			statBgRed: isDarkMode ? "#7F1D1D" : "#FEE2E2",
			statTextRed: isDarkMode ? "#F87171" : "#B91C1C",
			statBgBlue: isDarkMode ? "#1E3A8A" : "#DBEAFE",
			statIconBlue: isDarkMode ? "#60A5FA" : "#1E40AF",
			buttonBgColor: isDarkMode ? "#2563EB" : "#3B82F6",
		}),
		[isDarkMode]
	);

	// Memoize handlers to prevent rerenders
	const handleSlotSelect = useCallback((slotId: string) => {
		setSelectedSlot(slotId);
	}, []);

	const handleStartParking = useCallback(() => {
		setShowParkingAssistant(true);
	}, []);

	const handleParkingComplete = useCallback(() => {
		setShowParkingAssistant(false);
		// In a real app, this would update the slot status to occupied
	}, []);

	const handleParkingCancel = useCallback(() => {
		setShowParkingAssistant(false);
	}, []);

	// Handle notification button press
	const handleNotificationsPress = useCallback(() => {
		router.push("/notifications");
	}, [router]);

	// Handle settings button press
	const handleSettingsPress = useCallback(() => {
		router.push("/preferences");
	}, [router]);

	// Memoize the ParkingMap component to prevent unnecessary rerenders
	const memoizedParkingMap = useMemo(
		() => (
			<ParkingMap
				onSlotSelect={handleSlotSelect}
				floors={["Ground Floor", "Level 1", "Level 2"]}
				sections={["Section A", "Section B", "Section C"]}
				isLoading={false}
				onRefresh={() => console.log("Refreshing parking data")}
				filterOptions={filterOptions}
			/>
		),
		[handleSlotSelect, filterOptions]
	);

	// Memoize the ParkingAssistant component
	const memoizedParkingAssistant = useMemo(
		() =>
			showParkingAssistant ? (
				<View className="mb-4">
					<ParkingAssistant
						slotId={selectedSlot || undefined}
						isActive={true}
						initialStatus="not-detected"
						onComplete={handleParkingComplete}
						onCancel={handleParkingCancel}
					/>
				</View>
			) : (
				selectedSlot && (
					<View className="mb-4">
						<TouchableOpacity
							className="p-4 rounded-lg flex-row justify-center items-center"
							style={{ backgroundColor: themeColors.buttonBgColor }}
							onPress={handleStartParking}
						>
							<Car size={20} color="#ffffff" className="mr-2" />
							<Text className="text-white font-bold">
								Start Parking in Slot {selectedSlot}
							</Text>
						</TouchableOpacity>
					</View>
				)
			),
		[
			showParkingAssistant,
			selectedSlot,
			handleParkingComplete,
			handleParkingCancel,
			handleStartParking,
			themeColors.buttonBgColor,
		]
	);

	return (
		<SafeAreaView
			className="flex-1"
			style={{ backgroundColor: themeColors.backgroundColor }}
		>
			<Header
				title="Parking Assistant"
				onNotificationsPress={handleNotificationsPress}
				onSettingsPress={handleSettingsPress}
				notificationCount={notificationCount}
			/>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 50 }}
				showsVerticalScrollIndicator={true}
			>
				<View className="p-4">
					{/* Parking availability summary */}
					<View
						className="p-5 rounded-lg shadow-sm mb-4"
						style={{ backgroundColor: themeColors.cardBackgroundColor }}
					>
						<Text
							className="text-lg font-bold mb-3"
							style={{ color: themeColors.textColor }}
						>
							Parking Availability
						</Text>
						<View className="flex-row justify-between">
							<View
								className="flex-1 px-3 py-3 mr-2 rounded-lg flex-row items-center"
								style={{ backgroundColor: isDarkMode ? "#064E3B" : "#ECFDF5" }}
							>
								<View
									className="w-10 h-10 rounded-full items-center justify-center mr-3"
									style={{ backgroundColor: themeColors.statBgGreen }}
								>
									<Text
										className="font-bold text-base"
										style={{ color: themeColors.statTextGreen }}
									>
										12
									</Text>
								</View>
								<View>
									<Text
										className="text-sm font-semibold mb-0.5"
										style={{ color: themeColors.statTextGreen }}
									>
										Available
									</Text>
									<Text
										className="text-xs"
										style={{ color: isDarkMode ? "#6EE7B7" : "#047857" }}
									>
										Ready to park
									</Text>
								</View>
							</View>
							<View
								className="flex-1 px-3 py-3 rounded-lg flex-row items-center"
								style={{ backgroundColor: isDarkMode ? "#7F1D1D" : "#FEF2F2" }}
							>
								<View
									className="w-10 h-10 rounded-full items-center justify-center mr-3"
									style={{ backgroundColor: themeColors.statBgRed }}
								>
									<Text
										className="font-bold text-base"
										style={{ color: themeColors.statTextRed }}
									>
										8
									</Text>
								</View>
								<View>
									<Text
										className="text-sm font-semibold mb-0.5"
										style={{ color: themeColors.statTextRed }}
									>
										Occupied
									</Text>
									<Text
										className="text-xs"
										style={{ color: isDarkMode ? "#FCA5A5" : "#B91C1C" }}
									>
										In use now
									</Text>
								</View>
							</View>
						</View>

						<View
							className="flex-row items-center mt-3 pt-3 border-t"
							style={{ borderColor: isDarkMode ? "#374151" : "#E5E7EB" }}
						>
							<View
								className="w-8 h-8 rounded-full items-center justify-center mr-2"
								style={{ backgroundColor: themeColors.statBgBlue }}
							>
								<Car size={16} color={themeColors.statIconBlue} />
							</View>
							<Text
								className="text-sm"
								style={{ color: themeColors.textSecondaryColor }}
							>
								Your vehicle is currently not parked
							</Text>
						</View>
					</View>

					{/* Parking Map */}
					<View className="mb-4">{memoizedParkingMap}</View>

					{/* Parking Assistant */}
					{memoizedParkingAssistant}
				</View>
			</ScrollView>

			{/* Navigation Bar */}
			<NavigationBar activeTab="home" />
		</SafeAreaView>
	);
}

export default React.memo(HomeScreen);
