import {
	DefaultTheme,
	ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useContext } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, useColorScheme } from "react-native";
import { ThemeContext, ThemeProvider } from "./preferences";

// Define theme objects
const LightTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: "#FFFFFF",
		text: "#000000",
		primary: "#3B82F6",
	},
};

const DarkTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: "#1F2937",
		text: "#FFFFFF",
		primary: "#60A5FA",
		card: "#374151",
	},
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
			const { TempoDevtools } = require("tempo-devtools");
			TempoDevtools.init();
		}
	}, []);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider>
			<AppContent />
		</ThemeProvider>
	);
}

// Separate component to consume ThemeContext
function AppContent() {
	const { isDarkMode } = useContext(ThemeContext);
	return (
		<NavigationThemeProvider value={isDarkMode ? DarkTheme : LightTheme}>
			<Stack
				screenOptions={({ route }) => ({
					headerShown: !route.name.startsWith("tempobook"),
					contentStyle: { backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF" },
				})}
			>
				<Stack.Screen name="index" options={{ headerShown: false }} />
				<Stack.Screen name="notifications" options={{ headerShown: false }} />
				<Stack.Screen name="preferences" options={{ headerShown: false }} />
			</Stack>
			<StatusBar style={isDarkMode ? "light" : "dark"} />
		</NavigationThemeProvider>
	);
}
