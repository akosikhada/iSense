import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Car } from "lucide-react-native";

interface ParkingSlotProps {
	id: string;
	isAvailable: boolean;
	slotNumber: string;
	onSelect: (id: string) => void;
	isSelected?: boolean;
	vehicleType?: "compact" | "standard" | "large";
	distanceToEntrance?: number; // in meters
	isDarkMode?: boolean;
}

const ParkingSlot = ({
	id = "1",
	isAvailable = true,
	slotNumber = "A1",
	onSelect = () => {},
	isSelected = false,
	vehicleType = "standard",
	distanceToEntrance = 50,
	isDarkMode = false,
}: ParkingSlotProps) => {
	const handlePress = () => {
		onSelect(id);
	};

	// Determine background color based on availability and dark mode
	const availableColor = isDarkMode ? "#065F46" : "#4ADE80"; // green for available
	const occupiedColor = isDarkMode ? "#7F1D1D" : "#EF4444"; // red for occupied
	const selectedBorderColor = isDarkMode ? "#60A5FA" : "#3B82F6"; // blue when selected
	const defaultBorderColor = isDarkMode ? "#9CA3AF" : "#6B7280"; // gray otherwise
	const textColor = "#FFFFFF"; // white text for both modes
	const shadowColor = isDarkMode ? "#60A5FA" : "#3B82F6";

	const backgroundColor = isAvailable ? availableColor : occupiedColor;
	const borderColor = isSelected ? selectedBorderColor : defaultBorderColor;

	// Use fixed dimensions for all parking slots
	const width = 75;
	const height = 120;

	return (
		<TouchableOpacity
			onPress={handlePress}
			style={[
				styles.container,
				{
					backgroundColor,
					borderColor,
					width,
					height,
				},
				isSelected && [styles.selected, { shadowColor: shadowColor }],
			]}
			activeOpacity={0.7}
		>
			<Text style={styles.slotNumber}>{slotNumber}</Text>

			{!isAvailable && (
				<View style={styles.carIconContainer}>
					<Car size={24} color={textColor} />
				</View>
			)}

			{isAvailable && (
				<View style={styles.infoContainer}>
					<Text style={styles.infoText}>{distanceToEntrance}m</Text>
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderRadius: 8,
		margin: 5,
		position: "relative",
	},
	selected: {
		borderWidth: 3,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 5,
	},
	slotNumber: {
		fontWeight: "bold",
		color: "#ffffff",
		fontSize: 16,
		position: "absolute",
		top: 8,
		left: 8,
	},
	carIconContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	infoContainer: {
		position: "absolute",
		bottom: 8,
		right: 8,
		backgroundColor: "rgba(0,0,0,0.3)",
		borderRadius: 4,
		padding: 2,
	},
	infoText: {
		color: "#ffffff",
		fontSize: 10,
	},
});

export default ParkingSlot;
