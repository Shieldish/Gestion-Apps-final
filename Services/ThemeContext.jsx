// ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createGlobalStyles } from './themes'; // Import the global styles

const ThemeContext = createContext(); // Make sure the context is created

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [globalStyles, setGlobalStyles] = useState(createGlobalStyles(false));

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        const darkMode = savedTheme === 'dark';
        setIsDarkMode(darkMode);
        setGlobalStyles(createGlobalStyles(darkMode));
      } else {
        const systemDarkMode = Appearance.getColorScheme() === 'dark';
        setIsDarkMode(systemDarkMode);
        setGlobalStyles(createGlobalStyles(systemDarkMode));
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setGlobalStyles(createGlobalStyles(newMode));
    await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, globalStyles }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); // Export the useTheme hook
