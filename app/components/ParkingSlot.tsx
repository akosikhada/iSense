import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Car, Check } from "lucide-react-native";

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
	const availableColor = isDarkMode ? "#065F46" : "#10B981"; // green for available
	const occupiedColor = isDarkMode ? "#991B1B" : "#EF4444"; // red for occupied
	const selectedBorderColor = isDarkMode ? "#60A5FA" : "#3B82F6"; // blue when selected
	const defaultBorderColor = isDarkMode ? "#4B5563" : "#E5E7EB"; // gray otherwise
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
			<View style={styles.slotNumberContainer}>
				<Text style={styles.slotNumber}>{slotNumber}</Text>
			</View>

			{!isAvailable && (
				<View style={styles.carIconContainer}>
					<Car size={24} color={textColor} />
				</View>
			)}

			{isAvailable && (
				<>
					<View style={styles.checkIconContainer}>
						<Check size={24} color={textColor} strokeWidth={3} />
					</View>
					<View style={styles.infoContainer}>
						<Text style={styles.infoText}>{distanceToEntrance}m</Text>
					</View>
				</>
			)}

			<View style={styles.typeContainer}>
				<Text style={styles.typeText}>
					{vehicleType.charAt(0).toUpperCase()}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 2,
		borderRadius: 12,
		margin: 5,
		position: "relative",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 3,
	},
	selected: {
		borderWidth: 3,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 5,
		elevation: 6,
	},
	slotNumberContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		paddingTop: 5,
		paddingLeft: 6,
		paddingRight: 10,
		paddingBottom: 6,
		borderBottomRightRadius: 12,
		backgroundColor: "rgba(0,0,0,0.2)",
	},
	slotNumber: {
		fontWeight: "bold",
		color: "#ffffff",
		fontSize: 14,
	},
	carIconContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	checkIconContainer: {
		alignItems: "center",
		justifyContent: "center",
		opacity: 0.8,
	},
	infoContainer: {
		position: "absolute",
		bottom: 8,
		right: 8,
		backgroundColor: "rgba(0,0,0,0.3)",
		borderRadius: 6,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	infoText: {
		color: "#ffffff",
		fontSize: 10,
		fontWeight: "600",
	},
	typeContainer: {
		position: "absolute",
		bottom: 8,
		left: 8,
		width: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: "rgba(0,0,0,0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	typeText: {
		color: "#ffffff",
		fontSize: 10,
		fontWeight: "bold",
	},
});

export default ParkingSlot;
