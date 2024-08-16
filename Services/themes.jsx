// themes.js
import { StyleSheet } from 'react-native';

const lightTheme = {
  background: '#fff',
  text: '#000',
};

const darkTheme = {
  background: '#000',
  text: '#fff',
};

export const createGlobalStyles = (isDarkMode) => {
  const theme = isDarkMode ? darkTheme : lightTheme;

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    text: {
      color: theme.text,
    },
    // Add more global styles here if needed
  });
};
