import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-swiper';
import { useAuth } from '../App';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const OnboardingScreens = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setHasSeenOnboarding } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const screens = [
    {
      id: 1,
      title: 'Bienvenue',
      content: `Bienvenue dans notre application de gestion de stages. Cette plateforme est conçue pour vous aider à organiser et suivre facilement vos stages, de l'inscription à l'évaluation finale.`,
      icon: 'users',
    },
    {
      id: 2,
      title: 'Fonctionnalités',
      content: 'Découvrez nos fonctionnalités exceptionnelles. Naviguez facilement dans l\'application grâce à une interface utilisateur intuitive et bénéficiez d\'outils puissants pour gérer vos stages de manière efficace.',
      icon: 'laptop-code',
    },
    {
      id: 3,
      title: 'Besoin d\'aide ?',
      content: 'Nous sommes là pour vous aider ! Si vous avez des questions, des suggestions ou des problèmes, n\'hésitez pas à nous contacter.',
      icon: 'question-circle',
    },
    {
      id: 4,
      title: 'Commencer',
      content: 'Commencez dès maintenant à utiliser notre application pour une gestion simplifiée de vos stages. Inscrivez-vous, créez votre profil, et explorez les nombreuses opportunités de stages disponibles.',
      icon: 'graduation-cap',
    }
  ];

  const handleSkip = () => {
    completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomePage' }],
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      swiper.scrollBy(-1);
    }
  };

  let swiper;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [currentIndex]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={Platform.OS === 'android' ? '#4A90E2' : 'transparent'}
      />
      <GestureHandlerRootView style={styles.container}>
        <Swiper
          ref={(ref) => (swiper = ref)}
          loop={false}
          index={currentIndex}
          onIndexChanged={(index) => {
            setCurrentIndex(index);
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.5);
            rotateAnim.setValue(0);
          }}
          showsPagination={true}
          paginationStyle={styles.pagination}
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
        >
          {screens.map((screen) => (
            <Animated.View key={screen.id} style={[styles.slide, { opacity: fadeAnim }]}>
              <Animated.View 
                style={[
                  styles.iconContainer, 
                  { 
                    transform: [
                      { scale: scaleAnim }, 
                      { rotate: spin },
                      { scale: pulseAnim }
                    ] 
                  }
                ]}
              >
                <FontAwesome5 name={screen.icon} size={190} color="#4A90E2" style={styles.icon} />
              </Animated.View>
              <Text style={styles.title}>{screen.title}</Text>
              <ScrollView style={styles.scrollView}>
                <Text style={styles.content}>{screen.content}</Text>
              </ScrollView>
            </Animated.View>
          ))}
        </Swiper>
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={handlePrevious} style={styles.button}>
              <Text style={styles.buttonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSkip} style={styles.button}>
            <Text style={styles.buttonText}>
              {currentIndex === screens.length - 1 ? 'Terminer' : 'Passer'}
            </Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Added more space on top
  },
  iconContainer: {
    marginBottom: 40,
  },
  icon: {
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 20,
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: '#4A90E2',
    width: 12,
    height: 12,
    borderRadius: 6,
    margin: 3,
  },
});

export default OnboardingScreens;