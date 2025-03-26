import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlignmentStatus } from "./AlignmentIndicator";

type SoundType = "success" | "warning" | "error" | "notification" | "click";

// Use a single placeholder sound for all sound types
const PLACEHOLDER_SOUND = require("../../assets/sounds/placeholder.mp3");

// Map sound types to file paths (all using the same placeholder)
const SOUND_PATHS = {
	success: PLACEHOLDER_SOUND,
	warning: PLACEHOLDER_SOUND,
	error: PLACEHOLDER_SOUND,
	notification: PLACEHOLDER_SOUND,
	click: PLACEHOLDER_SOUND,
};

// Initialize sounds object
let sounds: Record<string, Audio.Sound> = {};
let soundsLoaded = false;
let audioEnabled = true;

// Initialize the audio system
const initAudio = async (): Promise<void> => {
	try {
		await Audio.setAudioModeAsync({
			playsInSilentModeIOS: true,
			staysActiveInBackground: false,
			shouldDuckAndroid: true,
		});

		// Load setting from storage
		const storedSoundEnabled = await AsyncStorage.getItem("soundEnabled");
		if (storedSoundEnabled !== null) {
			audioEnabled = storedSoundEnabled === "true";
		}

		return Promise.resolve();
	} catch (error) {
		console.error("Error initializing audio:", error);
		return Promise.reject(error);
	}
};

// Initialize and load all sound files (in this case, just one placeholder sound)
const initSounds = async (): Promise<void> => {
	try {
		if (!audioEnabled) {
			return Promise.resolve();
		}

		try {
			// Just load the placeholder sound once
			const { sound } = await Audio.Sound.createAsync(PLACEHOLDER_SOUND, {
				volume: 0.7,
			});

			// Use the same sound object for all sound types
			for (const key of Object.keys(SOUND_PATHS)) {
				sounds[key] = sound;
			}

			soundsLoaded = true;
		} catch (error) {
			console.warn(`Could not load placeholder sound`, error);
		}

		return Promise.resolve();
	} catch (error) {
		console.error("Error loading sounds:", error);
		return Promise.reject(error);
	}
};

// Play a sound by type
const playSound = async (type: SoundType): Promise<void> => {
	try {
		if (!audioEnabled) {
			return;
		}

		const storedSoundEnabled = await AsyncStorage.getItem("soundEnabled");
		if (storedSoundEnabled === "false") {
			return;
		}

		if (!soundsLoaded) {
			try {
				await initSounds();
			} catch (error) {
				console.warn("Failed to initialize sounds:", error);
				return;
			}
		}

		// All sound types use the same placeholder sound
		if (sounds[type]) {
			try {
				// Make sure sound is at the beginning before playing
				await sounds[type].setPositionAsync(0);
				await sounds[type].playAsync();
			} catch (error) {
				console.warn(`Error playing sound: ${type}`, error);
				// Try to reload the sound if there was an error
				try {
					await unloadAllSounds();
					await initSounds();
				} catch (reloadError) {
					console.warn("Failed to reload sounds:", reloadError);
				}
			}
		} else {
			// If sound wasn't loaded, try to load it again
			try {
				await initSounds();
			} catch (error) {
				console.warn("Failed to initialize sounds on retry:", error);
			}
		}
	} catch (error) {
		console.warn("Error in playSound:", error);
	}
};

// Play sound based on alignment status
const playAlignmentSound = async (
	status: AlignmentStatus,
	previousStatus?: AlignmentStatus
): Promise<void> => {
	try {
		// Don't play a sound if status hasn't changed
		if (previousStatus && status === previousStatus) {
			return;
		}

		switch (status) {
			case "aligned":
				await playSound("success");
				break;
			case "misaligned-left":
			case "misaligned-right":
			case "misaligned-forward":
			case "misaligned-backward":
				await playSound("warning");
				break;
			case "not-detected":
				// Optional: play a different sound when no vehicle is detected
				break;
			default:
				break;
		}
	} catch (error) {
		console.warn("Error in playAlignmentSound:", error);
	}
};

// Unload all sounds to free memory
const unloadAllSounds = async (): Promise<void> => {
	try {
		for (const key in sounds) {
			if (sounds[key]) {
				await sounds[key].unloadAsync();
			}
		}
		sounds = {};
		soundsLoaded = false;
		return Promise.resolve();
	} catch (error) {
		console.error("Error unloading sounds:", error);
		return Promise.reject(error);
	}
};

// Update audio enabled state
const setAudioEnabled = async (enabled: boolean): Promise<void> => {
	audioEnabled = enabled;
	try {
		await AsyncStorage.setItem("soundEnabled", enabled.toString());
		if (enabled && !soundsLoaded) {
			await initSounds();
		}
		return Promise.resolve();
	} catch (error) {
		console.error("Error setting audio enabled state:", error);
		return Promise.reject(error);
	}
};

const SoundService = {
	initAudio,
	initSounds,
	playSound,
	playAlignmentSound,
	unloadAllSounds,
	setAudioEnabled,
};

export default SoundService;
