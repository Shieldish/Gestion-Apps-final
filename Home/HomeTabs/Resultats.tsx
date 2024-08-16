// ExampleComponent.jsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTheme } from '../../Services/ThemeContext';  

const Resultats = () => {
  const { globalStyles, toggleTheme } = useTheme(); // Destructure globalStyles and toggleTheme

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.text}>This is an example text</Text>
      <Button title="Toggle Dark Mode" onPress={toggleTheme} />
    </View>
  );
};




export default Resultats;
