// ExampleComponent.jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from './ThemeContext';

const ExampleComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#000' : '#fff' }}>
      <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>This is an example text</Text>
      <Button title="Toggle Dark Mode" onPress={toggleTheme} />
    </View>
  );
};

export default ExampleComponent;
