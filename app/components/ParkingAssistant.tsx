import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Switch, Vibration } from "react-native";
import { Volume2, VolumeX, Vibrate, AlertTriangle } from "lucide-react-native";
import AlignmentIndicator from "./AlignmentIndicator";

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
	const [alignmentStatus, setAlignmentStatus] =
		useState<AlignmentStatus>(initialStatus);
	const [audioEnabled, setAudioEnabled] = useState(true);
	const [vibrationEnabled, setVibrationEnabled] = useState(true);
	const [distanceFromIdeal, setDistanceFromIdeal] = useState(0);

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

				// Trigger vibration for misalignment if enabled
				if (
					vibrationEnabled &&
					newStatus !== "aligned" &&
					newStatus !== "not-detected"
				) {
					Vibration.vibrate(200);
				}
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [isActive, initialStatus, vibrationEnabled]);

	const handleAlignmentChange = (status: AlignmentStatus) => {
		// This would handle real-time updates from sensors
		console.log(`Alignment changed to: ${status}`);
	};

	const toggleAudio = () => setAudioEnabled(!audioEnabled);
	const toggleVibration = () => setVibrationEnabled(!vibrationEnabled);

	return (
		<View className="w-full bg-white rounded-lg shadow-md p-4">
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-xl font-bold text-gray-800">
					Parking Assistant
				</Text>
				<View className="bg-blue-100 px-3 py-1 rounded-full">
					<Text className="text-blue-800 font-medium">Slot {slotId}</Text>
				</View>
			</View>

			{isActive ? (
				<>
					<View className="h-64 mb-4 flex items-center justify-center">
						<AlignmentIndicator
							status={alignmentStatus}
							showDirectionalGuidance={true}
							distanceFromIdeal={distanceFromIdeal}
							onAlignmentChange={handleAlignmentChange}
						/>
					</View>

					<View className="bg-gray-100 p-3 rounded-lg mb-4">
						<Text className="text-gray-700 font-medium mb-2">
							Assistance Settings
						</Text>
						<View className="flex-row justify-between items-center mb-2">
							<View className="flex-row items-center">
								{audioEnabled ? (
									<Volume2 size={20} color="#4B5563" />
								) : (
									<VolumeX size={20} color="#4B5563" />
								)}
								<Text className="ml-2 text-gray-700">Audio Guidance</Text>
							</View>
							<Switch
								value={audioEnabled}
								onValueChange={toggleAudio}
								trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
								thumbColor={audioEnabled ? "#3B82F6" : "#9CA3AF"}
							/>
						</View>

						<View className="flex-row justify-between items-center">
							<View className="flex-row items-center">
								<Vibrate size={20} color="#4B5563" />
								<Text className="ml-2 text-gray-700">Vibration Alerts</Text>
							</View>
							<Switch
								value={vibrationEnabled}
								onValueChange={toggleVibration}
								trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
								thumbColor={vibrationEnabled ? "#3B82F6" : "#9CA3AF"}
							/>
						</View>
					</View>

					<View className="flex-row justify-between">
						<TouchableOpacity
							className="bg-gray-200 px-4 py-3 rounded-lg flex-1 mr-2 items-center"
							onPress={onCancel}
						>
							<Text className="text-gray-800 font-medium">Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className="bg-green-500 px-4 py-3 rounded-lg flex-1 ml-2 items-center"
							onPress={onComplete}
							disabled={alignmentStatus !== "aligned"}
							style={{ opacity: alignmentStatus === "aligned" ? 1 : 0.6 }}
						>
							<Text className="text-white font-medium">Confirm Parking</Text>
						</TouchableOpacity>
					</View>
				</>
			) : (
				<View className="items-center justify-center p-8">
					<AlertTriangle size={48} color="#9CA3AF" />
					<Text className="text-gray-500 text-center mt-4">
						Parking assistant is not active. Select a parking slot to begin the
						parking process.
					</Text>
					<TouchableOpacity
						className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
						onPress={() => {}}
					>
						<Text className="text-white font-medium">Select Parking Slot</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

export default ParkingAssistant;
