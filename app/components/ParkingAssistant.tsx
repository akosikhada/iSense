import React, { useState, useEffect, useContext, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Switch,
	Vibration,
	StyleSheet,
} from "react-native";
import {
	Volume2,
	VolumeX,
	Vibrate,
	AlertTriangle,
	Car,
	CheckCircle2,
	X,
} from "lucide-react-native";
import AlignmentIndicator from "./AlignmentIndicator";
import { ThemeContext } from "../ThemeContext";
import SoundService from "../services/SoundService";

type AlignmentStatus =
	| "aligned"
	| "misaligned-left"
	| "misaligned-right"
	| "misaligned-forward"
	| "misaligned-backward"
	| "not-detected";

interface ParkingAssistantProps {
	slotId?: string;
	isActive?: boolean;
	initialStatus?: AlignmentStatus;
	onComplete?: () => void;
	onCancel?: () => void;
}

const ParkingAssistant = ({
	slotId = "A-12",
	isActive = true,
	initialStatus = "not-detected",
	onComplete = () => {},
	onCancel = () => {},
}: ParkingAssistantProps) => {
	const { isDarkMode } = useContext(ThemeContext);
	const [alignmentStatus, setAlignmentStatus] =
		useState<AlignmentStatus>(initialStatus);
	const [audioEnabled, setAudioEnabled] = useState(true);
	const [vibrationEnabled, setVibrationEnabled] = useState(true);
	const [distanceFromIdeal, setDistanceFromIdeal] = useState(0);
	const previousStatusRef = useRef<AlignmentStatus>(initialStatus);

	// Define theme colors
	const cardBgColor = isDarkMode ? "#374151" : "#FFFFFF";
	const textColor = isDarkMode ? "#F3F4F6" : "#1F2937";
	const textSecondaryColor = isDarkMode ? "#D1D5DB" : "#6B7280";
	const bgColor = isDarkMode ? "#1F2937" : "#F9FAFB";
	const borderColor = isDarkMode ? "#4B5563" : "#E5E7EB";
	const accentColor = isDarkMode ? "#60A5FA" : "#3B82F6";
	const slotBgColor = isDarkMode ? "#1E3A8A" : "#DBEAFE";
	const slotTextColor = isDarkMode ? "#93C5FD" : "#1E40AF";
	const settingsBgColor = isDarkMode ? "#1F2937" : "#F3F4F6";
	const iconColor = isDarkMode ? "#9CA3AF" : "#6B7280";
	const successColor = isDarkMode ? "#059669" : "#10B981";
	const cancelBgColor = isDarkMode ? "#1F2937" : "#F3F4F6";
	const cancelTextColor = isDarkMode ? "#D1D5DB" : "#4B5563";

	// Handle alignment status changes with sound and vibration feedback
	useEffect(() => {
		if (!isActive) return;

		// Only play sound if audio is enabled
		if (audioEnabled) {
			SoundService.playAlignmentSound(
				alignmentStatus,
				previousStatusRef.current
			);
		}

		// Trigger vibration for misalignment if enabled
		if (
			vibrationEnabled &&
			alignmentStatus !== "aligned" &&
			alignmentStatus !== "not-detected" &&
			alignmentStatus !== previousStatusRef.current
		) {
			Vibration.vibrate(200);
		}

		// Update previous status ref
		previousStatusRef.current = alignmentStatus;
	}, [alignmentStatus, audioEnabled, vibrationEnabled, isActive]);

	// Simulate receiving sensor data from Arduino
	useEffect(() => {
		if (!isActive) return;

		// This would be replaced with actual Arduino sensor data
		const simulationStates: AlignmentStatus[] = [
			"not-detected",
			"misaligned-forward",
			"misaligned-left",
			"misaligned-right",
			"aligned",
		];

		let currentIndex = simulationStates.indexOf(initialStatus);

		const interval = setInterval(() => {
			// Simulate random alignment changes for demo purposes
			if (Math.random() > 0.7) {
				currentIndex = (currentIndex + 1) % simulationStates.length;
				const newStatus = simulationStates[currentIndex];
				setAlignmentStatus(newStatus);

				// Simulate distance from ideal position
				if (newStatus !== "aligned" && newStatus !== "not-detected") {
					setDistanceFromIdeal(Math.floor(Math.random() * 30) + 5); // 5-35cm
				} else {
					setDistanceFromIdeal(0);
				}
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [isActive, initialStatus]);

	const handleAlignmentChange = (status: AlignmentStatus) => {
		// This would handle real-time updates from sensors
		console.log(`Alignment changed to: ${status}`);
	};

	const toggleAudio = () => {
		setAudioEnabled(!audioEnabled);
		// Play a test sound when re-enabling audio
		if (!audioEnabled) {
			SoundService.playSound("aligned", 0.5);
		}
	};

	const toggleVibration = () => setVibrationEnabled(!vibrationEnabled);

	return (
		<View style={[styles.container, { backgroundColor: cardBgColor }]}>
			{/* Enhanced Header */}
			<View style={styles.headerContainer}>
				<View style={styles.headerTitleContainer}>
					<View
						style={[styles.iconContainer, { backgroundColor: slotBgColor }]}
					>
						<Car size={18} color={accentColor} />
					</View>
					<View>
						<Text style={[styles.headerTitle, { color: textColor }]}>
							Parking Assistant
						</Text>
						<Text
							style={[styles.headerSubtitle, { color: textSecondaryColor }]}
						>
							Real-time guidance
						</Text>
					</View>
				</View>
				<View style={[styles.slotBadge, { backgroundColor: slotBgColor }]}>
					<Text style={[styles.slotText, { color: slotTextColor }]}>
						Slot {slotId}
					</Text>
				</View>
			</View>

			{isActive ? (
				<>
					<View style={styles.infoContainer}>
						<View
							style={[
								styles.statusCard,
								{ backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB" },
							]}
						>
							<Text style={[styles.statusTitle, { color: textColor }]}>
								Alignment Status
							</Text>
							<View style={styles.statusIndicator}>
								<View
									style={[
										styles.statusDot,
										{
											backgroundColor:
												alignmentStatus === "aligned"
													? isDarkMode
														? "#10B981"
														: "#34D399"
													: alignmentStatus === "not-detected"
													? isDarkMode
														? "#6B7280"
														: "#9CA3AF"
													: isDarkMode
													? "#F87171"
													: "#EF4444",
										},
									]}
								/>
								<Text style={[styles.statusText, { color: textColor }]}>
									{alignmentStatus === "aligned"
										? "Perfectly Aligned"
										: alignmentStatus === "not-detected"
										? "Vehicle Not Detected"
										: "Alignment Needed"}
								</Text>
							</View>
						</View>

						<View style={styles.alignmentContainer}>
							<AlignmentIndicator
								status={alignmentStatus}
								showDirectionalGuidance={true}
								distanceFromIdeal={distanceFromIdeal}
								onAlignmentChange={handleAlignmentChange}
							/>
						</View>
					</View>

					{/* Notification Settings Panel */}
					<View
						style={[
							styles.settingsContainer,
							{ backgroundColor: settingsBgColor },
						]}
					>
						<Text style={[styles.settingsTitle, { color: textColor }]}>
							Notifications
						</Text>
						<View style={styles.settingsRow}>
							<TouchableOpacity
								style={styles.settingItem}
								onPress={toggleAudio}
								activeOpacity={0.7}
							>
								{audioEnabled ? (
									<Volume2 size={18} color={accentColor} />
								) : (
									<VolumeX size={18} color={iconColor} />
								)}
								<Text
									style={[
										styles.settingLabel,
										{
											color: audioEnabled ? accentColor : textSecondaryColor,
										},
									]}
								>
									Audio
								</Text>
							</TouchableOpacity>
							<Switch
								value={audioEnabled}
								onValueChange={toggleAudio}
								trackColor={{ false: "#E5E7EB", true: accentColor }}
								thumbColor="#FFFFFF"
							/>
						</View>
						<View style={styles.settingsRow}>
							<TouchableOpacity
								style={styles.settingItem}
								onPress={toggleVibration}
								activeOpacity={0.7}
							>
								<Vibrate
									size={18}
									color={vibrationEnabled ? accentColor : iconColor}
								/>
								<Text
									style={[
										styles.settingLabel,
										{
											color: vibrationEnabled
												? accentColor
												: textSecondaryColor,
										},
									]}
								>
									Vibration
								</Text>
							</TouchableOpacity>
							<Switch
								value={vibrationEnabled}
								onValueChange={toggleVibration}
								trackColor={{ false: "#E5E7EB", true: accentColor }}
								thumbColor="#FFFFFF"
							/>
						</View>
					</View>

					{/* Control Buttons */}
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.cancelButton, { backgroundColor: cancelBgColor }]}
							onPress={onCancel}
						>
							<X size={16} color={cancelTextColor} style={styles.buttonIcon} />
							<Text
								style={[styles.cancelButtonText, { color: cancelTextColor }]}
							>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								styles.confirmButton,
								{
									backgroundColor:
										alignmentStatus === "aligned" ? successColor : accentColor,
								},
							]}
							onPress={onComplete}
						>
							<CheckCircle2
								size={16}
								color="#FFFFFF"
								style={styles.buttonIcon}
							/>
							<Text style={styles.confirmButtonText}>
								{alignmentStatus === "aligned" ? "Complete" : "Accept"}
							</Text>
						</TouchableOpacity>
					</View>
				</>
			) : (
				<View style={styles.inactiveContainer}>
					<View
						style={[
							styles.emptyStateIcon,
							{ backgroundColor: isDarkMode ? "#1E3A8A" : "#EFF6FF" },
						]}
					>
						<AlertTriangle
							size={36}
							color={isDarkMode ? "#60A5FA" : "#3B82F6"}
						/>
					</View>
					<Text style={[styles.inactiveTitle, { color: textColor }]}>
						Parking Assistant Inactive
					</Text>
					<Text style={[styles.inactiveText, { color: textSecondaryColor }]}>
						Select a parking slot to begin the real-time parking guidance and
						assistance.
					</Text>
					<TouchableOpacity
						style={[styles.selectButton, { backgroundColor: accentColor }]}
						onPress={() => {}}
					>
						<Car size={16} color="#FFFFFF" style={styles.buttonIcon} />
						<Text style={styles.selectButtonText}>Select Parking Slot</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 4,
		overflow: "hidden",
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(0,0,0,0.05)",
	},
	headerTitleContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconContainer: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	headerTitle: {
		fontSize: 16,
		fontWeight: "700",
	},
	headerSubtitle: {
		fontSize: 12,
		marginTop: 2,
	},
	slotBadge: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 10,
	},
	slotText: {
		fontWeight: "600",
		fontSize: 14,
	},
	infoContainer: {
		padding: 12,
	},
	statusCard: {
		borderRadius: 12,
		padding: 10,
		marginBottom: 10,
	},
	statusTitle: {
		fontSize: 13,
		fontWeight: "500",
		marginBottom: 6,
	},
	statusIndicator: {
		flexDirection: "row",
		alignItems: "center",
	},
	statusDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginRight: 8,
	},
	statusText: {
		fontSize: 14,
		fontWeight: "600",
	},
	alignmentContainer: {
		height: 300,
		marginBottom: 8,
	},
	controlsContainer: {
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingVertical: 20,
	},
	settingsContainer: {
		borderRadius: 12,
		padding: 12,
		marginHorizontal: 16,
		marginBottom: 14,
	},
	settingsTitle: {
		fontWeight: "600",
		fontSize: 15,
		marginBottom: 10,
	},
	settingsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	settingItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	settingLabel: {
		marginLeft: 8,
		fontSize: 13,
		fontWeight: "500",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		marginBottom: 16,
	},
	cancelButton: {
		flex: 1,
		marginRight: 8,
		paddingVertical: 12,
		borderRadius: 12,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	cancelButtonText: {
		fontWeight: "600",
		fontSize: 14,
	},
	confirmButton: {
		flex: 1,
		marginLeft: 8,
		paddingVertical: 12,
		borderRadius: 12,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	confirmButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 14,
	},
	buttonIcon: {
		marginRight: 6,
	},
	inactiveContainer: {
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	emptyStateIcon: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	inactiveTitle: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 12,
		textAlign: "center",
	},
	inactiveText: {
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
		paddingHorizontal: 16,
	},
	selectButton: {
		paddingHorizontal: 20,
		paddingVertical: 14,
		borderRadius: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	selectButtonText: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 15,
	},
});

export default ParkingAssistant;
