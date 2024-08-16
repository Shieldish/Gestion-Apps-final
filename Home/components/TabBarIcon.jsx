import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useFavorites } from '../../Partials/FavoritesContext';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const TabBarIcon = ({ route, color, size, focused }) => {
  const { favoritesCount } = useFavorites();
  
  let iconName;
  switch (route.name) {
    case 'Home':
      iconName = 'home';
      break;
    case 'Stages':
      iconName = 'briefcase';
      break;
    case 'Favorites':
      iconName = 'heart';
      break;
    case 'StagesPostuler':
      iconName = 'id-card';
      break;
    case 'Resultats':
      iconName = 'graduation-cap';
      break;
    default:
      iconName = 'question';
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.2 : 1, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <View>
      <Animated.View style={animatedStyle}>
        <Icon name={iconName} size={size} color={color} />
      </Animated.View>
      {route.name === 'Favorites' && favoritesCount > 0 && (
        <View style={{
          position: 'absolute',
          right: -6,
          top: -3,
          backgroundColor: 'red',
          borderRadius: 7,
          width: 14,
          height: 14,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {favoritesCount}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TabBarIcon;