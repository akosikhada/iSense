import React, { useState, useEffect, useContext, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Dimensions,
	useColorScheme,
	Platform,
} from "react-native";
import {
	ArrowUp,
	ArrowDown,
	ArrowLeft,
	ArrowRight,
	Check,
	AlertTriangle,
	CarFront,
	Target,
} from "lucide-react-native";
import { ThemeContext } from "../ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import SoundService from "./SoundService";
import VibrationService from "./VibrationService";

type AlignmentStatus =
	| "aligned"
	| "misaligned-left"
	| "misaligned-right"
	| "misaligned-forward"
	| "misaligned-backward"
	| "not-detected";

export type { AlignmentStatus };

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
	const { isDarkMode } = useContext(ThemeContext);
	const [pulseAnim] = useState(new Animated.Value(1));
	const [rotateAnim] = useState(new Animated.Value(0));
	const [fadeAnim] = useState(new Animated.Value(0));
	const [glowAnim] = useState(new Animated.Value(0));
	const [arrowAnim] = useState(new Animated.Value(1));
	const lastStatusRef = useRef<AlignmentStatus>("not-detected");
	const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
	const arrowAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

	// Get screen dimensions for responsive sizing
	const screenWidth = Dimensions.get("window").width;
	const mainCircleSize = Math.min(110, screenWidth * 0.3);
	const innerCircleSize = mainCircleSize * 0.7;

	// Background colors based on theme
	const bgColor = isDarkMode ? "#1F2937" : "#F9FAFB";
	const cardBgColor = isDarkMode ? "#374151" : "#FFFFFF";
	const textColor = isDarkMode ? "#F3F4F6" : "#1F2937";
	const textSecondaryColor = isDarkMode ? "#D1D5DB" : "#6B7280";

	// Function to start continuous subtle pulse animation
	const startContinuousPulse = () => {
		// Clear any existing animation
		if (pulseAnimationRef.current) {
			pulseAnimationRef.current.stop();
		}

		// Create and store the animation
		pulseAnimationRef.current = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1.03,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		);

		// Start the animation
		pulseAnimationRef.current.start();
	};

	// Start arrow pulse animation
	const startArrowPulse = (direction: string) => {
		// Clear any existing animation
		if (arrowAnimationRef.current) {
			arrowAnimationRef.current.stop();
		}

		// Create arrow pulse animation based on direction
		if (direction === "left" || direction === "right") {
			// Horizontal pulse
			arrowAnimationRef.current = Animated.loop(
				Animated.sequence([
					Animated.timing(arrowAnim, {
						toValue: 1.3,
						duration: 600,
						useNativeDriver: true,
					}),
					Animated.timing(arrowAnim, {
						toValue: 1,
						duration: 600,
						useNativeDriver: true,
					}),
				])
			);
		} else {
			// Vertical pulse
			arrowAnimationRef.current = Animated.loop(
				Animated.sequence([
					Animated.timing(arrowAnim, {
						toValue: 1.3,
						duration: 600,
						useNativeDriver: true,
					}),
					Animated.timing(arrowAnim, {
						toValue: 1,
						duration: 600,
						useNativeDriver: true,
					}),
				])
			);
		}

		// Start the animation
		arrowAnimationRef.current.start();
	};

	// Animate effects for different states
	useEffect(() => {
		// Fade in effect
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 500,
			useNativeDriver: true,
		}).start();

		// Glow animation
		Animated.loop(
			Animated.sequence([
				Animated.timing(glowAnim, {
					toValue: 1,
					duration: 1500,
					useNativeDriver: false,
				}),
				Animated.timing(glowAnim, {
					toValue: 0.5,
					duration: 1500,
					useNativeDriver: false,
				}),
			])
		).start();

		// Status effect management
		if (status === "aligned") {
			Animated.spring(pulseAnim, {
				toValue: 1.05,
				friction: 4,
				tension: 40,
				useNativeDriver: true,
			}).start(() => {
				// After spring animation, start continuous subtle pulse
				startContinuousPulse();
			});

			// Reset arrow animation
			if (arrowAnimationRef.current) {
				arrowAnimationRef.current.stop();
			}
			arrowAnim.setValue(1);

			// Reset rotation
			Animated.timing(rotateAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else if (status.startsWith("misaligned")) {
			// Clear any existing animation
			if (pulseAnimationRef.current) {
				pulseAnimationRef.current.stop();
			}

			// Different animation based on direction
			if (status === "misaligned-left") {
				startArrowPulse("left");
			} else if (status === "misaligned-right") {
				startArrowPulse("right");
			} else if (status === "misaligned-forward") {
				startArrowPulse("forward");
			} else if (status === "misaligned-backward") {
				startArrowPulse("backward");
			}

			// Create position shift animation
			Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 1.1,
						duration: 800,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 0.95,
						duration: 800,
						useNativeDriver: true,
					}),
				])
			).start();

			// Set rotation to zero to not rotate the icon
			Animated.timing(rotateAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		} else {
			// Not detected - subtle animation
			// Clear any existing animations
			if (pulseAnimationRef.current) {
				pulseAnimationRef.current.stop();
			}
			if (arrowAnimationRef.current) {
				arrowAnimationRef.current.stop();
			}
			arrowAnim.setValue(1);

			Animated.timing(pulseAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}).start();

			// Reset rotation
			Animated.timing(rotateAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}).start();
		}

		// Play sound based on new status - wrapped in try/catch to prevent errors
		try {
			SoundService.playAlignmentSound(status, lastStatusRef.current);
		} catch (error) {
			console.error("Error playing alignment sound:", error);
			// Silently continue if sound fails
		}

		// Trigger vibration feedback based on status
		try {
			VibrationService.vibrateForAlignmentStatus(status, lastStatusRef.current);
		} catch (error) {
			console.warn("Error triggering vibration:", error);
		}

		// Update the last status ref
		lastStatusRef.current = status;

		// Notify parent component of alignment changes
		onAlignmentChange(status);
	}, [
		status,
		pulseAnim,
		rotateAnim,
		fadeAnim,
		glowAnim,
		arrowAnim,
		onAlignmentChange,
	]);

	// Get colors based on alignment status
	const getStatusColor = () => {
		switch (status) {
			case "aligned":
				return isDarkMode ? "#059669" : "#10B981"; // green
			case "not-detected":
				return isDarkMode ? "#4B5563" : "#9CA3AF"; // gray
			case "misaligned-left":
			case "misaligned-right":
				return isDarkMode ? "#DC2626" : "#EF4444"; // red
			case "misaligned-forward":
			case "misaligned-backward":
				return isDarkMode ? "#D97706" : "#F59E0B"; // amber/orange
			default:
				return isDarkMode ? "#4B5563" : "#9CA3AF";
		}
	};

	const getGradientColors = () => {
		switch (status) {
			case "aligned":
				return isDarkMode
					? ["#065F46", "#059669", "#10B981"]
					: ["#D1FAE5", "#34D399", "#10B981"];
			case "not-detected":
				return isDarkMode
					? ["#374151", "#4B5563", "#6B7280"]
					: ["#F3F4F6", "#9CA3AF", "#6B7280"];
			case "misaligned-left":
			case "misaligned-right":
				return isDarkMode
					? ["#7F1D1D", "#B91C1C", "#DC2626"]
					: ["#FEE2E2", "#EF4444", "#DC2626"];
			case "misaligned-forward":
			case "misaligned-backward":
				return isDarkMode
					? ["#78350F", "#B45309", "#D97706"]
					: ["#FEF3C7", "#F59E0B", "#D97706"];
			default:
				return isDarkMode
					? ["#374151", "#4B5563", "#6B7280"]
					: ["#F3F4F6", "#9CA3AF", "#6B7280"];
		}
	};

	const getBorderColor = () => {
		switch (status) {
			case "aligned":
				return isDarkMode ? "#065F46" : "#D1FAE5"; // green border
			case "not-detected":
				return isDarkMode ? "#374151" : "#F3F4F6"; // gray border
			case "misaligned-left":
			case "misaligned-right":
				return isDarkMode ? "#7F1D1D" : "#FEE2E2"; // red border
			case "misaligned-forward":
			case "misaligned-backward":
				return isDarkMode ? "#78350F" : "#FEF3C7"; // amber border
			default:
				return isDarkMode ? "#374151" : "#F3F4F6";
		}
	};

	// Get directional icon based on alignment status
	const getDirectionalIcon = () => {
		switch (status) {
			case "misaligned-left":
				return (
					<View style={styles.arrowContainer}>
						<Animated.View style={{ transform: [{ scale: arrowAnim }] }}>
							<ArrowLeft size={36} color="white" strokeWidth={2.5} />
						</Animated.View>
					</View>
				);
			case "misaligned-right":
				return (
					<View style={styles.arrowContainer}>
						<Animated.View style={{ transform: [{ scale: arrowAnim }] }}>
							<ArrowRight size={36} color="white" strokeWidth={2.5} />
						</Animated.View>
					</View>
				);
			case "misaligned-forward":
				return (
					<View style={styles.arrowContainer}>
						<Animated.View style={{ transform: [{ scale: arrowAnim }] }}>
							<ArrowUp size={36} color="white" strokeWidth={2.5} />
						</Animated.View>
					</View>
				);
			case "misaligned-backward":
				return (
					<View style={styles.arrowContainer}>
						<Animated.View style={{ transform: [{ scale: arrowAnim }] }}>
							<ArrowDown size={36} color="white" strokeWidth={2.5} />
						</Animated.View>
					</View>
				);
			case "aligned":
				return (
					<View style={styles.arrowContainer}>
						<Check size={36} color="white" strokeWidth={2.5} />
					</View>
				);
			case "not-detected":
			default:
				return (
					<View style={styles.arrowContainer}>
						<CarFront size={36} color="white" strokeWidth={2.5} />
					</View>
				);
		}
	};

	const getStatusMessage = () => {
		switch (status) {
			case "aligned":
				return "Perfect Alignment";
			case "misaligned-left":
				return "Move Right";
			case "misaligned-right":
				return "Move Left";
			case "misaligned-forward":
				return "Move Backward";
			case "misaligned-backward":
				return "Move Forward";
			case "not-detected":
				return "Waiting for Vehicle";
			default:
				return "Checking Alignment...";
		}
	};

	const getStatusDetailMessage = () => {
		switch (status) {
			case "aligned":
				return "Your vehicle is perfectly positioned in the parking slot.";
			case "misaligned-left":
				return `Steer right by approximately ${distanceFromIdeal} cm to center your vehicle.`;
			case "misaligned-right":
				return `Steer left by approximately ${distanceFromIdeal} cm to center your vehicle.`;
			case "misaligned-forward":
				return `Reverse by approximately ${distanceFromIdeal} cm for optimal positioning.`;
			case "misaligned-backward":
				return `Move forward by approximately ${distanceFromIdeal} cm for optimal positioning.`;
			case "not-detected":
				return "Please pull into the parking slot slowly to begin detection.";
			default:
				return "Analyzing vehicle position...";
		}
	};

	// Calculate shadow opacity based on status
	const shadowOpacity =
		status === "aligned" ? 0.5 : status === "not-detected" ? 0.1 : 0.3;

	return (
		<Animated.View
			style={[
				styles.container,
				{
					opacity: fadeAnim,
				},
			]}
		>
			{/* Circle indicator section - main content */}
			<View style={styles.contentContainer}>
				<View style={styles.circleContainer}>
					{/* Outer glow effect */}
					<Animated.View
						style={[
							styles.glowCircle,
							{
								width: mainCircleSize * 1.15,
								height: mainCircleSize * 1.15,
								borderRadius: mainCircleSize * 0.575,
								backgroundColor: getStatusColor(),
								opacity: glowAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [0.1, 0.25],
								}),
							},
						]}
					/>

					{/* Main circle with gradient */}
					<Animated.View
						style={[
							styles.mainCircle,
							{
								width: mainCircleSize,
								height: mainCircleSize,
								borderRadius: mainCircleSize / 2,
								transform: [{ scale: pulseAnim }],
								borderWidth: 4,
								borderColor: getBorderColor(),
							},
						]}
					>
						<LinearGradient
							colors={
								getGradientColors() as unknown as readonly [
									string,
									string,
									...string[]
								]
							}
							style={styles.gradient}
							start={{ x: 0.2, y: 0.2 }}
							end={{ x: 0.8, y: 0.8 }}
						>
							{/* Inner circle for icon */}
							<View
								style={[
									styles.innerCircle,
									{
										width: innerCircleSize,
										height: innerCircleSize,
										borderRadius: innerCircleSize / 2,
									},
								]}
							>
								{getDirectionalIcon()}
							</View>
						</LinearGradient>
					</Animated.View>
				</View>

				{/* Direction text */}
				<Text style={[styles.directionText, { color: getStatusColor() }]}>
					{getStatusMessage()}
				</Text>

				{/* Detail message */}
				<View
					style={[
						styles.messageContainer,
						status === "aligned" && {
							backgroundColor: isDarkMode
								? "rgba(6, 78, 59, 0.3)"
								: "rgba(236, 253, 245, 0.7)",
						},
					]}
				>
					<Text
						style={[
							styles.messageText,
							{
								color:
									status === "aligned"
										? isDarkMode
											? "#34D399"
											: "#059669"
										: textSecondaryColor,
							},
						]}
					>
						{getStatusDetailMessage()}
					</Text>
				</View>
			</View>

			{/* Distance indicator for misaligned states */}
			{status !== "aligned" && status !== "not-detected" && (
				<View style={styles.distanceIndicator}>
					<View style={styles.distanceBar}>
						<View
							style={[
								styles.distanceFill,
								{
									width: `${Math.min(100, distanceFromIdeal * 3)}%`,
									backgroundColor: getStatusColor(),
								},
							]}
						/>
					</View>
					<Text style={[styles.distanceText, { color: textSecondaryColor }]}>
						{distanceFromIdeal} cm from ideal position
					</Text>
				</View>
			)}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: "100%",
		paddingTop: 5,
		paddingBottom: 10,
		paddingHorizontal: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	contentContainer: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
	},
	circleContainer: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 15,
	},
	glowCircle: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
	},
	mainCircle: {
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 10,
		overflow: "hidden",
	},
	gradient: {
		width: "100%",
		height: "100%",
		borderRadius: 999,
		justifyContent: "center",
		alignItems: "center",
	},
	innerCircle: {
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(255,255,255,0.15)",
	},
	arrowContainer: {
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
	},
	directionText: {
		fontSize: 18,
		fontWeight: "700",
		marginBottom: 10,
		textAlign: "center",
	},
	messageContainer: {
		width: "100%",
		padding: 8,
		borderRadius: 12,
		marginBottom: 1,
	},
	messageText: {
		textAlign: "center",
		fontSize: 13,
		lineHeight: 18,
		fontWeight: "500",
	},
	distanceIndicator: {
		width: "100%",
		marginTop: 5,
		alignItems: "center",
		marginBottom: 1,
	},
	distanceBar: {
		width: "100%",
		height: 5,
		backgroundColor: "rgba(0,0,0,0.1)",
		borderRadius: 3,
		overflow: "hidden",
		marginBottom: 8,
	},
	distanceFill: {
		height: "100%",
		borderRadius: 3,
	},
	distanceText: {
		fontSize: 11,
		fontWeight: "500",
		marginTop: 2,
	},
});

export default AlignmentIndicator;
