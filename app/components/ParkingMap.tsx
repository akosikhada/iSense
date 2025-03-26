import React, { useState, useEffect, useContext } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from "react-native";
import {
	RefreshCw,
	Filter,
	ZoomIn,
	ZoomOut,
	Map as MapIcon,
} from "lucide-react-native";
import ParkingSlot from "./ParkingSlot";
import SlotDetailModal from "./SlotDetailModal";
import { ThemeContext } from "../ThemeContext";

interface ParkingMapProps {
	onSlotSelect?: (slotId: string) => void;
	floors?: string[];
	sections?: string[];
	isLoading?: boolean;
	onRefresh?: () => void;
	filterOptions?: {
		vehicleType?: "compact" | "standard" | "large" | "all";
		maxDistance?: number;
	};
}

interface ParkingSlotData {
	id: string;
	slotNumber: string;
	isAvailable: boolean;
	vehicleType: "compact" | "standard" | "large";
	distanceToEntrance: number;
	floor: string;
	section: string;
	lastUpdated: string;
}

const ParkingMap = ({
	onSlotSelect = () => {},
	floors = ["Ground Floor", "Level 1", "Level 2"],
	sections = ["Section A", "Section B", "Section C"],
	isLoading = false,
	onRefresh = () => {},
	filterOptions = { vehicleType: "all", maxDistance: 100 },
}: ParkingMapProps) => {
	const { isDarkMode } = useContext(ThemeContext);
	const [selectedFloor, setSelectedFloor] = useState(floors[0]);
	const [selectedSection, setSelectedSection] = useState(sections[0]);
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [modalVisible, setModalVisible] = useState(false);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [refreshing, setRefreshing] = useState(false);
	const [slotData, setSlotData] = useState<ParkingSlotData[]>([]);
	const [filteredSlotData, setFilteredSlotData] = useState<ParkingSlotData[]>(
		[]
	);
	const [activeFilters, setActiveFilters] = useState(filterOptions);

	// Define theme colors
	const backgroundColor = isDarkMode ? "#1F2937" : "#F3F4F6";
	const cardBackgroundColor = isDarkMode ? "#374151" : "#FFFFFF";
	const borderColor = isDarkMode ? "#4B5563" : "#E5E7EB";
	const textColor = isDarkMode ? "#FFFFFF" : "#1F2937";
	const textSecondaryColor = isDarkMode ? "#D1D5DB" : "#6B7280";
	const floorBgActive = isDarkMode ? "#2563EB" : "#3B82F6";
	const floorBgInactive = isDarkMode ? "#4B5563" : "#E5E7EB";
	const sectionBgActive = isDarkMode ? "#1E3A8A" : "#DBEAFE";
	const sectionBorderActive = isDarkMode ? "#60A5FA" : "#3B82F6";
	const sectionBgInactive = isDarkMode ? "#374151" : "#F3F4F6";
	const filterBgColor = isDarkMode ? "#1E3A8A" : "#EFF6FF";
	const filterTextColor = isDarkMode ? "#60A5FA" : "#1E40AF";
	const controlsBgColor = isDarkMode ? "#374151" : "#FFFFFF";
	const controlsIconColor = isDarkMode ? "#D1D5DB" : "#4B5563";
	const availableColor = isDarkMode ? "#34D399" : "#10B981";
	const occupiedColor = isDarkMode ? "#F87171" : "#EF4444";

	// Generate mock parking slot data
	useEffect(() => {
		generateMockData();
	}, [selectedFloor, selectedSection]);

	// Apply filters to slot data
	useEffect(() => {
		applyFilters();
	}, [slotData, activeFilters]);

	const applyFilters = () => {
		if (!slotData.length) return;

		let filtered = [...slotData];

		// Filter by vehicle type if specified
		if (activeFilters.vehicleType && activeFilters.vehicleType !== "all") {
			filtered = filtered.filter(
				(slot) => slot.vehicleType === activeFilters.vehicleType
			);
		}

		// Filter by maximum distance if specified
		if (activeFilters.maxDistance) {
			filtered = filtered.filter(
				(slot) => slot.distanceToEntrance <= activeFilters.maxDistance
			);
		}

		// Only show available slots if we're filtering
		if (
			activeFilters.vehicleType !== "all" ||
			activeFilters.maxDistance < 100
		) {
			filtered = filtered.filter((slot) => slot.isAvailable);
		}

		setFilteredSlotData(filtered);
	};

	const generateMockData = () => {
		const mockData: ParkingSlotData[] = [];
		const sectionLetter = selectedSection.slice(-1);
		const floorNumber =
			selectedFloor === "Ground Floor" ? "G" : selectedFloor.slice(-1);

		// Generate 20 parking slots with varying availability
		for (let i = 1; i <= 20; i++) {
			const isAvailable = Math.random() > 0.4; // 60% chance of being available
			const vehicleTypes: ("compact" | "standard" | "large")[] = [
				"compact",
				"standard",
				"large",
			];
			const vehicleType =
				vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

			mockData.push({
				id: `${floorNumber}${sectionLetter}${i}`,
				slotNumber: `${sectionLetter}${i}`,
				isAvailable,
				vehicleType,
				distanceToEntrance: Math.floor(Math.random() * 100) + 10,
				floor: selectedFloor,
				section: selectedSection,
				lastUpdated: `${Math.floor(Math.random() * 10) + 1} mins ago`,
			});
		}

		setSlotData(mockData);
		setFilteredSlotData(mockData);
	};

	const handleRefresh = () => {
		setRefreshing(true);
		onRefresh();
		generateMockData();
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleSlotSelect = (id: string) => {
		setSelectedSlot(id);
		setModalVisible(true);
		onSlotSelect(id);
	};

	const handleCloseModal = () => {
		setModalVisible(false);
	};

	const getSelectedSlotData = () => {
		if (!selectedSlot) return null;

		const slot = slotData.find((slot) => slot.id === selectedSlot);
		if (!slot) return null;

		return {
			id: slot.id,
			name: `Slot ${slot.slotNumber}`,
			status: slot.isAvailable ? "available" : "occupied",
			floor: slot.floor,
			section: slot.section,
			distance: `${slot.distanceToEntrance}m`,
			lastUpdated: slot.lastUpdated,
		};
	};

	const increaseZoom = () => {
		if (zoomLevel < 1.5) setZoomLevel(zoomLevel + 0.1);
	};

	const decreaseZoom = () => {
		if (zoomLevel > 0.8) setZoomLevel(zoomLevel - 0.1);
	};

	const toggleVehicleTypeFilter = () => {
		const types = ["all", "compact", "standard", "large"];
		const currentIndex = types.indexOf(activeFilters.vehicleType || "all");
		const nextType = types[(currentIndex + 1) % types.length] as
			| "compact"
			| "standard"
			| "large"
			| "all";
		setActiveFilters({ ...activeFilters, vehicleType: nextType });
	};

	const toggleDistanceFilter = () => {
		const distances = [100, 50, 30, 20];
		const currentIndex = distances.indexOf(activeFilters.maxDistance || 100);
		const nextDistance = distances[(currentIndex + 1) % distances.length];
		setActiveFilters({ ...activeFilters, maxDistance: nextDistance });
	};

	return (
		<View className="flex-1" style={{ backgroundColor }}>
			{/* Floor Selector - Redesigned */}
			<View
				className="px-4 py-3 border-b"
				style={{ backgroundColor: cardBackgroundColor, borderColor }}
			>
				<Text
					className="text-sm font-medium mb-2"
					style={{ color: textSecondaryColor }}
				>
					Select Floor
				</Text>
				<View className="flex-row">
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{floors.map((floor) => (
							<TouchableOpacity
								key={floor}
								onPress={() => setSelectedFloor(floor)}
								className="px-5 py-3 mr-3 rounded-xl"
								style={{
									backgroundColor:
										selectedFloor === floor
											? isDarkMode
												? "#1E40AF"
												: "#3B82F6"
											: isDarkMode
											? "#374151"
											: "#F3F4F6",
									shadowOffset: {
										width: 0,
										height: selectedFloor === floor ? 2 : 0,
									},
									shadowOpacity: selectedFloor === floor ? 0.15 : 0,
									shadowRadius: 3,
									elevation: selectedFloor === floor ? 3 : 0,
									borderWidth: 1,
									borderColor:
										selectedFloor === floor
											? isDarkMode
												? "#60A5FA"
												: "#3B82F6"
											: isDarkMode
											? "#4B5563"
											: "#E5E7EB",
								}}
							>
								<View className="flex-row items-center">
									<View
										className="w-6 h-6 rounded-full items-center justify-center mr-2"
										style={{
											backgroundColor:
												selectedFloor === floor
													? isDarkMode
														? "#60A5FA"
														: "rgba(255, 255, 255, 0.8)"
													: isDarkMode
													? "#4B5563"
													: "rgba(59, 130, 246, 0.1)",
										}}
									>
										<Text
											style={{
												color:
													selectedFloor === floor
														? isDarkMode
															? "#1E3A8A"
															: "#3B82F6"
														: isDarkMode
														? "#9CA3AF"
														: "#6B7280",
												fontSize: 12,
												fontWeight: "bold",
											}}
										>
											{floor === "Ground Floor" ? "G" : floor.slice(-1)}
										</Text>
									</View>
									<Text
										style={{
											color:
												selectedFloor === floor
													? isDarkMode
														? "#FFFFFF"
														: "#FFFFFF"
													: isDarkMode
													? "#D1D5DB"
													: "#6B7280",
											fontWeight: selectedFloor === floor ? "600" : "500",
										}}
									>
										{floor}
									</Text>
								</View>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</View>

			{/* Section Selector - Redesigned */}
			<View
				className="px-4 py-3 border-b"
				style={{ backgroundColor: cardBackgroundColor, borderColor }}
			>
				<View className="flex-row justify-between items-center mb-2">
					<Text
						className="text-sm font-medium"
						style={{ color: textSecondaryColor }}
					>
						Select Section
					</Text>
					<TouchableOpacity
						onPress={handleRefresh}
						className="p-2 rounded-full flex-row items-center"
						style={{ backgroundColor: isDarkMode ? "#374151" : "#EFF6FF" }}
						disabled={refreshing}
					>
						<RefreshCw
							size={16}
							color={isDarkMode ? "#60A5FA" : "#3B82F6"}
							style={{ opacity: refreshing ? 0.5 : 1, marginRight: 4 }}
						/>
						<Text
							style={{
								color: isDarkMode ? "#60A5FA" : "#3B82F6",
								fontSize: 12,
							}}
						>
							Refresh
						</Text>
					</TouchableOpacity>
				</View>
				<View className="flex-row">
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{sections.map((section) => (
							<TouchableOpacity
								key={section}
								onPress={() => setSelectedSection(section)}
								className="mr-3 rounded-lg overflow-hidden"
								style={{
									borderWidth: 1,
									borderColor:
										selectedSection === section
											? isDarkMode
												? "#60A5FA"
												: "#3B82F6"
											: isDarkMode
											? "#4B5563"
											: "#E5E7EB",
								}}
							>
								<View
									className="px-4 py-2"
									style={{
										backgroundColor:
											selectedSection === section
												? isDarkMode
													? "rgba(30, 58, 138, 0.6)"
													: "rgba(219, 234, 254, 0.8)"
												: isDarkMode
												? "#1F2937"
												: "#FFFFFF",
									}}
								>
									<Text
										style={{
											color:
												selectedSection === section
													? isDarkMode
														? "#60A5FA"
														: "#1E40AF"
													: isDarkMode
													? "#9CA3AF"
													: "#6B7280",
											fontWeight:
												selectedSection === section ? "600" : "normal",
										}}
									>
										{section}
									</Text>
								</View>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
			</View>

			{/* Filter Controls - Redesigned */}
			<View
				className="flex-row justify-between items-center px-4 py-3 border-b"
				style={{ backgroundColor: cardBackgroundColor, borderColor }}
			>
				<Text
					className="text-sm font-medium"
					style={{ color: textSecondaryColor }}
				>
					Filters
				</Text>
				<View className="flex-row">
					<TouchableOpacity
						onPress={toggleVehicleTypeFilter}
						className="flex-row items-center px-3 py-2 mr-2 rounded-lg"
						style={{
							backgroundColor: isDarkMode ? "#1E3A8A" : "#EFF6FF",
							borderWidth: 1,
							borderColor: isDarkMode ? "#60A5FA" : "#DBEAFE",
						}}
					>
						<Filter size={14} color={isDarkMode ? "#60A5FA" : "#1E40AF"} />
						<Text
							style={{
								marginLeft: 4,
								color: isDarkMode ? "#60A5FA" : "#1E40AF",
								fontSize: 12,
								fontWeight: "500",
							}}
						>
							{activeFilters.vehicleType === "all"
								? "All Types"
								: activeFilters.vehicleType === "compact"
								? "Compact"
								: activeFilters.vehicleType === "standard"
								? "Standard"
								: "Large"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={toggleDistanceFilter}
						className="flex-row items-center px-3 py-2 rounded-lg"
						style={{
							backgroundColor: isDarkMode ? "#1E3A8A" : "#EFF6FF",
							borderWidth: 1,
							borderColor: isDarkMode ? "#60A5FA" : "#DBEAFE",
						}}
					>
						<MapIcon size={14} color={isDarkMode ? "#60A5FA" : "#1E40AF"} />
						<Text
							style={{
								marginLeft: 4,
								color: isDarkMode ? "#60A5FA" : "#1E40AF",
								fontSize: 12,
								fontWeight: "500",
							}}
						>
							{activeFilters.maxDistance === 100
								? "Any Distance"
								: `≤ ${activeFilters.maxDistance}m`}
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Map Controls - Redesigned */}
			<View
				className="absolute bottom-4 right-4 z-10 rounded-lg shadow-md overflow-hidden"
				style={{
					backgroundColor: controlsBgColor,
					borderWidth: 1,
					borderColor: isDarkMode ? "#4B5563" : "#E5E7EB",
				}}
			>
				<TouchableOpacity
					onPress={increaseZoom}
					className="p-2 border-b"
					style={{ borderColor }}
				>
					<ZoomIn size={18} color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
				</TouchableOpacity>
				<TouchableOpacity onPress={decreaseZoom} className="p-2">
					<ZoomOut size={18} color={isDarkMode ? "#60A5FA" : "#3B82F6"} />
				</TouchableOpacity>
			</View>

			{/* Parking Map - Enhanced */}
			<ScrollView className="flex-1 p-4">
				<View
					className="rounded-lg p-4 shadow-sm"
					style={{
						backgroundColor: cardBackgroundColor,
						borderWidth: 1,
						borderColor: isDarkMode ? "#374151" : "#F3F4F6",
					}}
				>
					<View className="flex-row justify-between items-center mb-5">
						<View>
							<Text className="text-lg font-bold" style={{ color: textColor }}>
								{selectedFloor}
							</Text>
							<Text
								className="text-sm"
								style={{ color: isDarkMode ? "#9CA3AF" : "#6B7280" }}
							>
								{selectedSection}
							</Text>
						</View>
						<View
							className="flex-row items-center px-3 py-1.5 rounded-lg"
							style={{ backgroundColor: isDarkMode ? "#1E3A8A" : "#EFF6FF" }}
						>
							<View className="flex-row items-center mr-3">
								<View
									className="w-3 h-3 rounded-full mr-2"
									style={{ backgroundColor: availableColor }}
								/>
								<Text
									className="text-xs font-medium"
									style={{ color: isDarkMode ? "#93C5FD" : "#1E40AF" }}
								>
									Available
								</Text>
							</View>
							<View className="flex-row items-center">
								<View
									className="w-3 h-3 rounded-full mr-2"
									style={{ backgroundColor: occupiedColor }}
								/>
								<Text
									className="text-xs font-medium"
									style={{ color: isDarkMode ? "#93C5FD" : "#1E40AF" }}
								>
									Occupied
								</Text>
							</View>
						</View>
					</View>

					{/* Loading state */}
					{isLoading && (
						<View className="items-center justify-center py-10">
							<Text style={{ color: textSecondaryColor }}>
								Loading parking data...
							</Text>
						</View>
					)}

					{/* Parking slots grid - with subtle background pattern */}
					<View
						className="rounded-lg overflow-hidden"
						style={{ backgroundColor: isDarkMode ? "#111827" : "#F9FAFB" }}
					>
						<View className="p-2">
							<View
								style={{
									transform: [{ scale: zoomLevel }],
									flexDirection: "row",
									flexWrap: "wrap",
									justifyContent: "space-evenly",
									alignItems: "center",
									padding: 5,
								}}
							>
								{filteredSlotData.map((slot) => (
									<ParkingSlot
										key={slot.id}
										id={slot.id}
										slotNumber={slot.slotNumber}
										isAvailable={slot.isAvailable}
										vehicleType={slot.vehicleType}
										distanceToEntrance={slot.distanceToEntrance}
										onSelect={handleSlotSelect}
										isSelected={selectedSlot === slot.id}
										isDarkMode={isDarkMode}
									/>
								))}
							</View>
						</View>
					</View>
				</View>
			</ScrollView>

			{/* Slot Detail Modal */}
			<SlotDetailModal
				isVisible={modalVisible}
				onClose={handleCloseModal}
				slotData={getSelectedSlotData()}
				isDarkMode={isDarkMode}
			/>
		</View>
	);
};

export default ParkingMap;
