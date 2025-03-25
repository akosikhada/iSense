import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import {
	ArrowUp,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	Check,
	AlertTriangle,
} from "lucide-react-native";

type AlignmentStatus =
	| "aligned"
	| "misaligned-left"
	| "misaligned-right"
	| "misaligned-forward"
	| "misaligned-backward"
	| "not-detected";

interface AlignmentIndicatorProps {
	status?: AlignmentStatus;
	showDirectionalGuidance?: boolean;
	distanceFromIdeal?: number; // in centimeters
	onAlignmentChange?: (status: AlignmentStatus) => void;
}

const AlignmentIndicator = ({
	status = "not-detected",
	showDirectionalGuidance = true,
	distanceFromIdeal = 0,
	onAlignmentChange = () => {},
}: AlignmentIndicatorProps) => {
	const [pulseAnim] = useState(new Animated.Value(1));

	// Simulate pulse animation for misaligned states
	useEffect(() => {
		if (status !== "aligned" && status !== "not-detected") {
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.05,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true,
					}),
				])
			).start();
		} else {
			pulseAnim.setValue(1);
		}

		// Notify parent component of alignment changes
		onAlignmentChange(status);
	}, [status, pulseAnim, onAlignmentChange]);

	const getStatusColor = () => {
		switch (status) {
			case "aligned":
				return "bg-green-500";
			case "not-detected":
				return "bg-gray-400";
			default:
				return "bg-red-500";
		}
	};

	const getDirectionalIcon = () => {
		switch (status) {
			case "misaligned-left":
				return <ArrowLeft size={40} color="white" />;
			case "misaligned-right":
				return <ArrowRight size={40} color="white" />;
			case "misaligned-forward":
				return <ArrowUp size={40} color="white" />;
			case "misaligned-backward":
				return <ArrowDown size={40} color="white" />;
			case "aligned":
				return <Check size={40} color="white" />;
			default:
				return <AlertTriangle size={40} color="white" />;
		}
	};

	const getStatusMessage = () => {
		switch (status) {
			case "aligned":
				return "Vehicle Properly Aligned";
			case "misaligned-left":
				return "Move Right";
			case "misaligned-right":
				return "Move Left";
			case "misaligned-forward":
				return "Move Backward";
			case "misaligned-backward":
				return "Move Forward";
			case "not-detected":
				return "Vehicle Not Detected";
			default:
				return "Checking Alignment...";
		}
	};

	return (
		<View className="w-full h-full bg-gray-100 p-4 rounded-lg flex items-center justify-center">
			<View className="items-center justify-center">
				<Text className="text-lg font-bold mb-4 text-gray-800">
					Parking Alignment
				</Text>

				<View className="w-40 h-40 flex items-center justify-center">
					<Animated.View
						className={`w-40 h-40 rounded-full items-center justify-center ${getStatusColor()}`}
						style={{
							transform: [
								{
									scale:
										status !== "aligned" && status !== "not-detected"
											? pulseAnim
											: 1,
								},
							],
						}}
					>
						{getDirectionalIcon()}
					</Animated.View>
				</View>

				<Text className="text-xl font-bold mt-4 text-center">
					{getStatusMessage()}
				</Text>

				{status !== "aligned" &&
					status !== "not-detected" &&
					showDirectionalGuidance && (
						<View className="mt-4 p-3 bg-gray-200 rounded-lg">
							<Text className="text-center text-gray-800">
								{distanceFromIdeal > 0
									? `Adjust position by approximately ${distanceFromIdeal} cm`
									: "Follow the directional guidance to align properly"}
							</Text>
						</View>
					)}

				{status === "aligned" && (
					<View className="mt-4 p-3 bg-green-100 rounded-lg">
						<Text className="text-center text-green-800 font-semibold">
							Perfect! Your vehicle is properly aligned.
						</Text>
					</View>
				)}

				{status === "not-detected" && (
					<View className="mt-4 p-3 bg-gray-200 rounded-lg">
						<Text className="text-center text-gray-800">
							Please pull into the parking slot to begin alignment detection.
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

export default AlignmentIndicator;
