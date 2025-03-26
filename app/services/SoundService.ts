import { Audio } from "expo-av";
import { Platform } from "react-native";

// Define sound type for better type checking
export type SoundType =
	| "aligned"
	| "misaligned"
	| "notDetected"
	| "adjustLeft"
	| "adjustRight"
	| "adjustForward"
	| "adjustBackward";

// Cache for loaded sounds
const soundCache: Record<SoundType, Audio.Sound | null> = {
	aligned: null,
	misaligned: null,
	notDetected: null,
	adjustLeft: null,
	adjustRight: null,
	adjustForward: null,
	adjustBackward: null,
};

// Flag to track if we're using demo sounds
let usingDemoSounds = true;

// Default sounds as resources (these are built into the app, no file dependencies)
const defaultSounds: Record<string, any> = {
	click: require("../assets/sounds/click.mp3"),
	notification: require("../assets/sounds/notification.mp3"),
};

// Frequency map for demo sounds (in Hz)
const demoSoundFrequencies: Record<SoundType, number> = {
	aligned: 880, // High A note
	misaligned: 440, // A note
	notDetected: 220, // Low A note
	adjustLeft: 523, // C note
	adjustRight: 587, // D note
	adjustForward: 659, // E note
	adjustBackward: 698, // F note
};

/**
 * Creates a demo sound using a fallback mechanism
 * @param frequency The frequency to play
 * @returns The sound object
 */
const createDemoSound = async (type: SoundType): Promise<Audio.Sound> => {
	try {
		// Try to use the default notification sound
		let soundSource = defaultSounds.notification;
		if (!soundSource) {
			// If we don't have a default sound, create an empty source
			soundSource = { uri: "" };
		}

		const { sound } = await Audio.Sound.createAsync(soundSource, {
			shouldPlay: false,
		});
		return sound;
	} catch (error) {
		console.error(`Failed to create demo sound for ${type}:`, error);
		// Create empty sound as fallback
		const { sound } = await Audio.Sound.createAsync(
			{ uri: "" },
			{ shouldPlay: false }
		);
		return sound;
	}
};

/**
 * Try to initialize the sound system
 */
export const initSounds = async (): Promise<void> => {
	try {
		// Always use demo sounds to avoid file not found errors
		usingDemoSounds = true;
		console.log("Using demo sounds for safety");

		// Initialize the Audio API
		await initAudio();

		// Log status of sound initialization
		console.log(
			`Sound system initialized. Using ${
				usingDemoSounds ? "demo" : "file"
			} sounds.`
		);
	} catch (error) {
		console.error("Failed to initialize sounds:", error);
	}
};

/**
 * Load a sound into memory
 * @param type The type of sound to load
 * @returns Promise that resolves when the sound is loaded
 */
export const loadSound = async (type: SoundType): Promise<void> => {
	try {
		// Unload existing sound if present
		if (soundCache[type]) {
			await soundCache[type]?.unloadAsync();
			soundCache[type] = null;
		}

		// Use demo sounds regardless of usingDemoSounds flag for safety
		const sound = await createDemoSound(type);
		soundCache[type] = sound;
	} catch (error) {
		console.error(`Failed to load sound ${type}:`, error);
		// Don't throw so app continues to work without sound
	}
};

/**
 * Play a notification sound
 * @param type The type of sound to play
 * @param volume Volume level (0-1)
 * @returns Promise that resolves when the sound finishes playing
 */
export const playSound = async (
	type: SoundType,
	volume = 1.0
): Promise<void> => {
	try {
		// Load the sound if not already loaded
		if (!soundCache[type]) {
			await loadSound(type);
		}

		const sound = soundCache[type];
		if (sound) {
			try {
				// Reset sound to beginning (in case it was played before)
				await sound.setPositionAsync(0);

				// Set volume and play
				await sound.setVolumeAsync(volume);

				// If using demo sounds, fake it with a console log
				if (Platform.OS !== "web") {
					console.log(
						`Playing demo sound: ${type} (${demoSoundFrequencies[type]}Hz)`
					);
				}

				await sound.playAsync();
			} catch (playError) {
				console.warn(`Error playing sound ${type}:`, playError);
				// Continue app execution even if sound fails
			}
		}
	} catch (error) {
		console.error(`Failed to play sound ${type}:`, error);
		// Don't throw so app continues to work without sound
	}
};

/**
 * Play a sound based on alignment status
 * @param status The current alignment status
 * @param prevStatus The previous alignment status
 * @param volume Volume level (0-1)
 */
export const playAlignmentSound = async (
	status: string,
	prevStatus: string | null,
	volume = 1.0
): Promise<void> => {
	// Don't play if status hasn't changed
	if (prevStatus === status) return;

	try {
		switch (status) {
			case "aligned":
				await playSound("aligned", volume);
				break;
			case "misaligned-left":
				await playSound("adjustRight", volume);
				break;
			case "misaligned-right":
				await playSound("adjustLeft", volume);
				break;
			case "misaligned-forward":
				await playSound("adjustBackward", volume);
				break;
			case "misaligned-backward":
				await playSound("adjustForward", volume);
				break;
			case "not-detected":
				await playSound("notDetected", volume);
				break;
			default:
				await playSound("misaligned", volume);
		}
	} catch (error) {
		console.error("Error playing alignment sound:", error);
		// Don't throw so app continues to work without sound
	}
};

/**
 * Unload all sounds to free up memory
 */
export const unloadAllSounds = async (): Promise<void> => {
	const soundTypes = Object.keys(soundCache) as SoundType[];

	for (const type of soundTypes) {
		if (soundCache[type]) {
			try {
				await soundCache[type]?.unloadAsync();
				soundCache[type] = null;
			} catch (error) {
				console.warn(`Failed to unload sound ${type}:`, error);
			}
		}
	}
};

/**
 * Initialize the audio session
 * @returns Promise that resolves when audio is initialized
 */
export const initAudio = async (): Promise<void> => {
	try {
		// Configure audio mode
		await Audio.setAudioModeAsync({
			playsInSilentModeIOS: true,
			staysActiveInBackground: false,
			shouldDuckAndroid: true,
		});
	} catch (error) {
		console.error("Failed to initialize audio:", error);
	}
};

export default {
	loadSound,
	playSound,
	playAlignmentSound,
	unloadAllSounds,
	initAudio,
	initSounds,
};
