import { Vibration } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlignmentStatus } from './AlignmentIndicator';

type VibrationPatternType =
	| "success"
	| "warning"
	| "error"
	| "notification"
	| "click";

// Define vibration patterns (in ms)
// Android: wait, vibrate, wait, vibrate, ...
// iOS: vibrate, wait, vibrate, wait, ...
const VIBRATION_PATTERNS = {
	success: [0, 100, 100, 100], // Two short vibrations
	warning: [0, 300, 150, 300], // Two medium vibrations
	error: [0, 500, 100, 500], // Two long vibrations
	notification: [0, 200], // Single medium vibration
	click: [0, 50], // Very short vibration for UI feedback
};

let vibrationEnabled = true;

// Initialize the vibration system
const initVibration = async (): Promise<void> => {
	try {
		// Load setting from storage
		const storedVibrationEnabled = await AsyncStorage.getItem(
			"vibrationEnabled"
		);
		if (storedVibrationEnabled !== null) {
			vibrationEnabled = storedVibrationEnabled === "true";
		}

		return Promise.resolve();
	} catch (error) {
		console.error("Error initializing vibration:", error);
		return Promise.reject(error);
	}
};

// Trigger vibration with a specific pattern
const triggerVibration = async (type: VibrationPatternType): Promise<void> => {
	try {
		if (!vibrationEnabled) {
			return;
		}

		const storedVibrationEnabled = await AsyncStorage.getItem(
			"vibrationEnabled"
		);
		if (storedVibrationEnabled === "false") {
			return;
		}

		const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.notification;
		Vibration.vibrate(pattern);

		return Promise.resolve();
	} catch (error) {
		console.warn("Error in triggerVibration:", error);
		return Promise.reject(error);
	}
};

// Vibrate based on alignment status
const vibrateForAlignmentStatus = async (
	status: AlignmentStatus,
	previousStatus?: AlignmentStatus
): Promise<void> => {
	try {
		// Don't vibrate if status hasn't changed
		if (previousStatus && status === previousStatus) {
			return;
		}

		switch (status) {
			case "aligned":
				await triggerVibration("success");
				break;
			case "misaligned-left":
			case "misaligned-right":
			case "misaligned-forward":
			case "misaligned-backward":
				await triggerVibration("warning");
				break;
			case "not-detected":
				// No vibration when vehicle is not detected
				break;
			default:
				break;
		}
	} catch (error) {
		console.warn("Error in vibrateForAlignmentStatus:", error);
	}
};

// Cancel ongoing vibration
const cancelVibration = (): void => {
	Vibration.cancel();
};

// Update vibration enabled state
const setVibrationEnabled = async (enabled: boolean): Promise<void> => {
	vibrationEnabled = enabled;
	try {
		await AsyncStorage.setItem("vibrationEnabled", enabled.toString());
		return Promise.resolve();
	} catch (error) {
		console.error("Error setting vibration enabled state:", error);
		return Promise.reject(error);
	}
};

const VibrationService = {
	initVibration,
	triggerVibration,
	vibrateForAlignmentStatus,
	cancelVibration,
	setVibrationEnabled,
};

export default VibrationService;
