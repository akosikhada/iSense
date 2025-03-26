import React, { useState, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";

// Create a theme context that can be used across the app
export const ThemeContext = React.createContext({
	isDarkMode: false,
	toggleDarkMode: () => {},
});

// Create a custom ThemeProvider to optimize rendering
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const deviceColorScheme = useColorScheme();
	const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === "dark");

	const toggleDarkMode = useCallback(() => {
		setIsDarkMode((prev) => !prev);
	}, []);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(
		() => ({
			isDarkMode,
			toggleDarkMode,
		}),
		[isDarkMode, toggleDarkMode]
	);

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
};

export default ThemeContext;
