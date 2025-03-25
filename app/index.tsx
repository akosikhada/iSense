import React, { useState, useContext, useMemo, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Car, Info } from "lucide-react-native";

// Import components
import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";
import ParkingMap from "./components/ParkingMap";
import ParkingAssistant from "./components/ParkingAssistant";
import { ThemeContext } from "./preferences";

function HomeScreen() {
	const insets = useSafeAreaInsets();
	const { isDarkMode } = useContext(ThemeContext);
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [showParkingAssistant, setShowParkingAssistant] = useState(false);
	const [alignmentStatus, setAlignmentStatus] =
		useState<string>("not-detected");
	const [filterOptions] = useState({
		vehicleType: "all" as "compact" | "standard" | "large" | "all",
		maxDistance: 100,
	});

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
				onNotificationsPress={() => console.log("Notifications pressed")}
				onSettingsPress={() => console.log("Settings pressed")}
			/>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 50 }}
				showsVerticalScrollIndicator={true}
			>
				<View className="p-4">
					{/* Welcome message */}
					<View
						className="p-4 rounded-lg mb-4"
						style={{ backgroundColor: themeColors.welcomeBgColor }}
					>
						<View className="flex-row items-start">
							<Info
								size={20}
								color={themeColors.infoIconColor}
								className="mr-2 mt-0.5"
							/>
							<Text style={{ color: themeColors.welcomeTextColor, flex: 1 }}>
								Welcome to the Intelligent Parking Assistant. Find available
								parking slots and get real-time alignment guidance.
							</Text>
						</View>
					</View>

					{/* Parking availability summary */}
					<View
						className="p-4 rounded-lg shadow-sm mb-4"
						style={{ backgroundColor: themeColors.cardBackgroundColor }}
					>
						<Text
							className="text-lg font-bold mb-2"
							style={{ color: themeColors.textColor }}
						>
							Parking Availability
						</Text>
						<View className="flex-row justify-between">
							<View className="items-center">
								<View
									className="w-10 h-10 rounded-full items-center justify-center mb-1"
									style={{ backgroundColor: themeColors.statBgGreen }}
								>
									<Text
										className="font-bold"
										style={{ color: themeColors.statTextGreen }}
									>
										12
									</Text>
								</View>
								<Text
									className="text-sm"
									style={{ color: themeColors.textSecondaryColor }}
								>
									Available
								</Text>
							</View>
							<View className="items-center">
								<View
									className="w-10 h-10 rounded-full items-center justify-center mb-1"
									style={{ backgroundColor: themeColors.statBgRed }}
								>
									<Text
										className="font-bold"
										style={{ color: themeColors.statTextRed }}
									>
										8
									</Text>
								</View>
								<Text
									className="text-sm"
									style={{ color: themeColors.textSecondaryColor }}
								>
									Occupied
								</Text>
							</View>
							<View className="items-center">
								<View
									className="w-10 h-10 rounded-full items-center justify-center mb-1"
									style={{ backgroundColor: themeColors.statBgBlue }}
								>
									<Car size={18} color={themeColors.statIconBlue} />
								</View>
								<Text
									className="text-sm"
									style={{ color: themeColors.textSecondaryColor }}
								>
									Your Car
								</Text>
							</View>
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
