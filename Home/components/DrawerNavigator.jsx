import React, { useEffect, useState } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, SafeAreaView, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Deconnexion from '../HomeDrawers/Deconnexion';
import HomeTabs from '../HomeTabs';
import Profiles from '../HomeDrawers/Profiles';
import Settings from '../HomeDrawers/Settings';
import About from '../HomeDrawers/Abouts';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const [userData, setUserData] = useState({ NOM: '', PRENOM: '', EMAIL: '' });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserData(userData.userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <Animated.View style={[styles.userInfoSection, { opacity: fadeAnim }]}>
        <View style={styles.profilePic}>
          <Icon name="user-graduate" size={120} color="#4A90E2" />
        </View>
        <Text style={styles.userName}>{userData.NOM} {userData.PRENOM}</Text>
        <Text style={styles.userEmail}>{userData.EMAIL}</Text>
      </Animated.View>
      <DrawerItemList {...props} />
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          label="Déconnexion"
          onPress={props.handleLogoutPress}
          icon={({ color, size }) => <Icon name="sign-out-alt" color={color} size={size} />}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = ({ handleLogoutPress }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} handleLogoutPress={handleLogoutPress} />}
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerLabelStyle: {
          color: '#333',
          fontWeight: '600',
        },
        drawerIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'HomeTabs':
              iconName = 'home';
              break;
            case 'Profiles':
              iconName = 'user-circle';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            case 'About':
              iconName = 'info-circle';
              break;
            default:
              iconName = 'question-circle';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: '#4A90E2',
        drawerInactiveTintColor: '#666',
        drawerStyle: {
          backgroundColor: '#f8f8f8',
          width: 280,
        },
      })}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{
          drawerLabel: 'Accueil',
          headerTitle: 'Gestion de Stages',
        }}
      />
      <Drawer.Screen
        name="Profiles"
        component={Profiles}
        options={{ drawerLabel: 'Profiles', headerTitle: 'Profiles' }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{ drawerLabel: 'Paramètres', headerTitle: 'Paramètres' }}
      />
      <Drawer.Screen
        name="About"
        component={About}
        options={{ drawerLabel: 'À propos', headerTitle: 'À propos' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  userInfoSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  profilePic: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  bottomDrawerSection: {
    marginTop: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
    paddingTop: 15,
  },
});

export default DrawerNavigator;