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
import { ThemeContext } from "../preferences";

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
			{/* Floor and Section Selector */}
			<View
				className="flex-row justify-between items-center px-4 py-2 border-b"
				style={{ backgroundColor: cardBackgroundColor, borderColor }}
			>
				<View className="flex-row">
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{floors.map((floor) => (
							<TouchableOpacity
								key={floor}
								onPress={() => setSelectedFloor(floor)}
								className="px-4 py-2 mr-2 rounded-full"
								style={{
									backgroundColor:
										selectedFloor === floor ? floorBgActive : floorBgInactive,
								}}
							>
								<Text
									style={{
										color:
											selectedFloor === floor ? "#FFFFFF" : textSecondaryColor,
									}}
								>
									{floor}
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>
				<TouchableOpacity
					onPress={handleRefresh}
					className="p-2 rounded-full"
					style={{ backgroundColor: floorBgInactive }}
					disabled={refreshing}
				>
					<RefreshCw
						size={20}
						color={controlsIconColor}
						style={{ opacity: refreshing ? 0.5 : 1 }}
					/>
				</TouchableOpacity>
			</View>

			{/* Section Selector */}
			<View
				className="flex-row px-4 py-2 border-b"
				style={{ backgroundColor: cardBackgroundColor, borderColor }}
			>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{sections.map((section) => (
						<TouchableOpacity
							key={section}
							onPress={() => setSelectedSection(section)}
							className="px-4 py-1 mr-2 rounded-full"
							style={{
								backgroundColor:
									selectedSection === section
										? sectionBgActive
										: sectionBgInactive,
								borderWidth: selectedSection === section ? 1 : 0,
								borderColor: sectionBorderActive,
							}}
						>
							<Text
								style={{
									color:
										selectedSection === section
											? filterTextColor
											: textSecondaryColor,
								}}
							>
								{section}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</View>

			{/* Filter Controls */}
			<View
				className="flex-row justify-between items-center px-4 py-2 border-b"
				style={{ backgroundColor: cardBackgroundColor, borderColor }}
			>
				<TouchableOpacity
					onPress={toggleVehicleTypeFilter}
					className="flex-row items-center px-3 py-1 rounded-full"
					style={{ backgroundColor: filterBgColor }}
				>
					<Filter size={16} color={filterTextColor} />
					<Text style={{ marginLeft: 4, color: filterTextColor, fontSize: 12 }}>
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
					className="flex-row items-center px-3 py-1 rounded-full"
					style={{ backgroundColor: filterBgColor }}
				>
					<MapIcon size={16} color={filterTextColor} />
					<Text style={{ marginLeft: 4, color: filterTextColor, fontSize: 12 }}>
						{activeFilters.maxDistance === 100
							? "Any Distance"
							: `≤ ${activeFilters.maxDistance}m`}
					</Text>
				</TouchableOpacity>
			</View>

			{/* Map Controls */}
			<View
				className="absolute top-20 right-4 z-10 rounded-lg shadow-md"
				style={{ backgroundColor: controlsBgColor }}
			>
				<TouchableOpacity
					onPress={increaseZoom}
					className="p-2 border-b"
					style={{ borderColor }}
				>
					<ZoomIn size={20} color={controlsIconColor} />
				</TouchableOpacity>
				<TouchableOpacity onPress={decreaseZoom} className="p-2">
					<ZoomOut size={20} color={controlsIconColor} />
				</TouchableOpacity>
			</View>

			{/* Parking Map */}
			<ScrollView className="flex-1 p-4">
				<View
					className="rounded-lg p-4 shadow-sm"
					style={{ backgroundColor: cardBackgroundColor }}
				>
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-lg font-bold" style={{ color: textColor }}>
							{selectedFloor} - {selectedSection}
						</Text>
						<View className="flex-row items-center">
							<View
								className="w-3 h-3 rounded-full mr-1"
								style={{ backgroundColor: availableColor }}
							/>
							<Text
								className="text-xs mr-3"
								style={{ color: textSecondaryColor }}
							>
								Available
							</Text>
							<View
								className="w-3 h-3 rounded-full mr-1"
								style={{ backgroundColor: occupiedColor }}
							/>
							<Text className="text-xs" style={{ color: textSecondaryColor }}>
								Occupied
							</Text>
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

					{/* Parking slots grid */}
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
