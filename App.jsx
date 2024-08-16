import 'react-native-gesture-handler';
import React, { useState, useEffect, createContext, useContext ,useCallback} from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './connection/Login';
import RegistrationScreen from './connection/Registration';
import ForgetPasswordScreen from './connection/ForgetPassword';
import RegistrationSuccessMessages from './connection/RegistrationSuccessMessages';
import HomePage from './Home/components/HomeDrawers';
import Postulation from './Partials/Postulation';
import ApplicationForm from './Partials/ApplicationForm';
import StagesPostuler from './Home/HomeTabs/Candidatures';
import Resultats from './Home/HomeTabs/Resultats';
import MoreDetails from './Partials/MoreDetails';
import Favorites from './Home/HomeTabs/Favorites';
import { FavoritesProvider } from './Partials/FavoritesContext';
import OnboardingScreens from './Partials/OnboardingScreens';
import { ThemeProvider, useTheme } from './Services/ThemeContext'; 

const Stack = createStackNavigator();

// Create a Context for authentication
const AuthContext = createContext();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [userToken, setUserToken] = useState(null);

  
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setUserToken(null);
    navigation.replace('Login'); 
  }, []);

  useEffect(() => {
    const checkTokenAndOnboarding = async () => {
      const token = await AsyncStorage.getItem('userToken');
      const onboardingSeen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (token) {
        setIsLoggedIn(true);
        setUserToken(token);
      }
      if (onboardingSeen) {
        setHasSeenOnboarding(true);
      }
      setIsLoading(false);
    };

    checkTokenAndOnboarding();
  }, []);

  useEffect(() => {
    if (userToken) {
      const tokenExpirationCheck = setInterval(async () => {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/check-token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            // Token is no longer valid
            logout();
          }
        } catch (error) {
          console.error('Error checking token:', error);
          logout();
        }
      }, 60000); // Check every minute

      return () => clearInterval(tokenExpirationCheck);
    }
  }, [userToken, logout]);



  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, hasSeenOnboarding, setHasSeenOnboarding , userToken, setUserToken,logout }}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={isLoggedIn ? (hasSeenOnboarding ? "HomePage" : "Onboarding") : "Login"}>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} options={{ headerShown: false }} />
              <Stack.Screen name="RegistrationSuccessMessages" component={RegistrationSuccessMessages} options={{ headerShown: false }} />
              <Stack.Screen name="Onboarding" component={OnboardingScreens} options={{ headerShown: false }} />
              <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
              <Stack.Screen name="Postulation" component={Postulation} options={{ headerShown: true, title: 'Postulation', headerTitleAlign: 'center' }} />
              <Stack.Screen name="ApplicationForm" component={ApplicationForm} options={{ title: 'Formulaire de Candidature', headerTitleAlign: 'center' }} />
              <Stack.Screen name="StagesPostuler" component={StagesPostuler} options={{ title: 'Stages Postuler' }} />
              <Stack.Screen name="MoreDetails" component={MoreDetails} options={{ headerShown: true, title: 'Candidature', headerTitleAlign: 'center' }} />
              <Stack.Screen name="Favorites" component={Favorites} options={{ title: 'Favoris' }} />
              <Stack.Screen name="Resultats" component={Resultats} options={{ title: 'Resultats' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthContext.Provider>
      </FavoritesProvider>
    </ThemeProvider>
  );
};

export default App;

// Export AuthContext for use in other components
export const useAuth = () => useContext(AuthContext);
