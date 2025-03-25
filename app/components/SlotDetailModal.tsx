import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { MapPin, Navigation, Car, X, Clock, Info } from "lucide-react-native";

interface SlotDetailModalProps {
	isVisible: boolean;
	onClose: () => void;
	isDarkMode?: boolean;
	slotData?: {
		id: string;
		name: string;
		status: "available" | "occupied";
		floor: string;
		section: string;
		distance: string;
		lastUpdated: string;
	};
}

const SlotDetailModal = ({
	isVisible = true,
	onClose = () => {},
	isDarkMode = false,
	slotData = {
		id: "A-123",
		name: "Slot A-123",
		status: "available",
		floor: "Ground Floor",
		section: "Section A",
		distance: "50m",
		lastUpdated: "2 mins ago",
	},
}: SlotDetailModalProps) => {
	const [isNavigating, setIsNavigating] = useState(false);

	// Define theme colors
	const cardBackgroundColor = isDarkMode ? "#374151" : "#FFFFFF";
	const titleColor = isDarkMode ? "#60A5FA" : "#1E40AF";
	const textColor = isDarkMode ? "#FFFFFF" : "#1F2937";
	const textSecondaryColor = isDarkMode ? "#D1D5DB" : "#4B5563";
	const closeIconColor = isDarkMode ? "#60A5FA" : "#1E40AF";
	const iconColor = isDarkMode ? "#D1D5DB" : "#4B5563";

	// Status colors
	const availableBgColor = isDarkMode ? "#065F46" : "#D1FAE5";
	const availableTextColor = isDarkMode ? "#34D399" : "#047857";
	const occupiedBgColor = isDarkMode ? "#7F1D1D" : "#FEE2E2";
	const occupiedTextColor = isDarkMode ? "#F87171" : "#B91C1C";

	// Info box
	const infoBgColor = isDarkMode ? "#1E3A8A" : "#EFF6FF";
	const infoTextColor = isDarkMode ? "#93C5FD" : "#1E40AF";
	const infoIconColor = isDarkMode ? "#60A5FA" : "#1E40AF";

	// Button colors
	const navigateBgColor = isDarkMode ? "#1E3A8A" : "#DBEAFE";
	const navigateTextColor = isDarkMode ? "#60A5FA" : "#1E40AF";
	const parkBgColor = isDarkMode ? "#2563EB" : "#2563EB";
	const disabledBgColor = isDarkMode ? "#4B5563" : "#E5E7EB";
	const disabledTextColor = isDarkMode ? "#9CA3AF" : "#6B7280";

	const handleNavigate = () => {
		setIsNavigating(true);
		// In a real app, this would trigger navigation
		setTimeout(() => {
			setIsNavigating(false);
			onClose();
		}, 1500);
	};

	const handlePark = () => {
		// In a real app, this would navigate to the parking assistant
		onClose();
	};

	// If slotData is null or undefined, don't render the modal content
	if (!slotData) {
		return (
			<Modal
				animationType="slide"
				transparent={true}
				visible={isVisible}
				onRequestClose={onClose}
			>
				<View className="flex-1 justify-end bg-black/50">
					<View
						className="rounded-t-3xl p-6 w-full"
						style={{ backgroundColor: cardBackgroundColor }}
					>
						<View className="flex-row justify-between items-center mb-4">
							<Text
								className="text-2xl font-bold"
								style={{ color: titleColor }}
							>
								No slot selected
							</Text>
							<TouchableOpacity onPress={onClose} className="p-2">
								<X size={24} color={closeIconColor} />
							</TouchableOpacity>
						</View>
						<Text style={{ color: textSecondaryColor, marginBottom: 16 }}>
							Please select a parking slot to view details.
						</Text>
					</View>
				</View>
			</Modal>
		);
	}

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={isVisible}
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/50">
				<View
					className="rounded-t-3xl p-6 w-full"
					style={{ backgroundColor: cardBackgroundColor }}
				>
					{/* Header with close button */}
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-2xl font-bold" style={{ color: titleColor }}>
							{slotData.name}
						</Text>
						<TouchableOpacity onPress={onClose} className="p-2">
							<X size={24} color={closeIconColor} />
						</TouchableOpacity>
					</View>

					{/* Status indicator */}
					<View
						className="flex-row items-center p-3 rounded-lg mb-4"
						style={{
							backgroundColor:
								slotData.status === "available"
									? availableBgColor
									: occupiedBgColor,
						}}
					>
						<View
							className="w-4 h-4 rounded-full mr-2"
							style={{
								backgroundColor:
									slotData.status === "available"
										? availableTextColor
										: occupiedTextColor,
							}}
						/>
						<Text
							className="font-medium"
							style={{
								color:
									slotData.status === "available"
										? availableTextColor
										: occupiedTextColor,
							}}
						>
							{slotData.status === "available" ? "Available" : "Occupied"}
						</Text>
					</View>

					{/* Slot details */}
					<View className="mb-6">
						<View className="flex-row items-center mb-3">
							<MapPin size={20} color={iconColor} className="mr-2" />
							<Text style={{ color: textColor }}>
								{slotData.floor}, {slotData.section}
							</Text>
						</View>
						<View className="flex-row items-center mb-3">
							<Navigation size={20} color={iconColor} className="mr-2" />
							<Text style={{ color: textColor }}>
								Distance: {slotData.distance}
							</Text>
						</View>
						<View className="flex-row items-center">
							<Clock size={20} color={iconColor} className="mr-2" />
							<Text style={{ color: textColor }}>
								Last updated: {slotData.lastUpdated}
							</Text>
						</View>
					</View>

					{/* Additional information */}
					<View
						className="p-4 rounded-lg mb-6"
						style={{ backgroundColor: infoBgColor }}
					>
						<View className="flex-row items-start">
							<Info size={20} color={infoIconColor} className="mr-2 mt-0.5" />
							<Text style={{ color: infoTextColor, flex: 1 }}>
								This parking slot is equipped with alignment sensors to help
								guide your parking.
							</Text>
						</View>
					</View>

					{/* Action buttons */}
					<View className="flex-row justify-between">
						<TouchableOpacity
							onPress={handleNavigate}
							disabled={isNavigating}
							className="flex-1 flex-row justify-center items-center py-3 rounded-lg mr-2"
							style={{
								backgroundColor: isNavigating
									? disabledBgColor
									: navigateBgColor,
							}}
						>
							<Navigation
								size={20}
								color={isNavigating ? disabledTextColor : navigateTextColor}
								className="mr-2"
							/>
							<Text
								className="font-medium"
								style={{
									color: isNavigating ? disabledTextColor : navigateTextColor,
								}}
							>
								{isNavigating ? "Navigating..." : "Navigate"}
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={handlePark}
							disabled={slotData.status !== "available"}
							className="flex-1 flex-row justify-center items-center py-3 rounded-lg ml-2"
							style={{
								backgroundColor:
									slotData.status !== "available"
										? disabledBgColor
										: parkBgColor,
							}}
						>
							<Car
								size={20}
								color={
									slotData.status !== "available"
										? disabledTextColor
										: "#FFFFFF"
								}
								className="mr-2"
							/>
							<Text
								className="font-medium"
								style={{
									color:
										slotData.status !== "available"
											? disabledTextColor
											: "#FFFFFF",
								}}
							>
								Park Here
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default SlotDetailModal;
