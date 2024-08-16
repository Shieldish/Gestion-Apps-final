// OnboardingScreens.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-swiper';
import { useAuth } from '../App'; 

const { width, height } = Dimensions.get('window');

const OnboardingScreens = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { setHasSeenOnboarding } = useAuth();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  const screens = [
    {
      title: 'Bienvenue',
      content: `Bienvenue dans notre application de gestion de stages. Cette plateforme est conçue pour vous aider à organiser et suivre facilement vos stages, de l'inscription à l'évaluation finale. Grâce à notre application, vous pouvez :
      - Rechercher et postuler à des offres de stages.
      - Suivre l'état de vos candidatures en temps réel.
      - Communiquer avec les superviseurs et les entreprises.
      - Remplir et soumettre des rapports de stage.
      - Recevoir des évaluations et des feedbacks.
      
      Que vous soyez étudiant, stagiaire ou recruteur, notre application est là pour simplifier et améliorer votre expérience de gestion des stages. Profitez de toutes les fonctionnalités pour une gestion efficace et sans tracas de vos stages.`,
      image: require('../assets/graduation/d5f0.webp'),
    },
    {
        id: 2,
        title: 'Fonctionnalités',
        content: 'Découvrez nos exceptionnelles. Naviguez facilement dans l\'application grâce à une interface utilisateur intuitive et bénéficiez d\'outils puissants pour gérer vos stages de manière efficace. Que ce soit pour trouver des offres de stages, suivre vos candidatures, ou communiquer avec les recruteurs, notre application vous offre tout ce dont vous avez besoin.',
        image: require('../assets/graduation/mall.jpeg'),
      },
      
        {
            id: 3,
            title: 'Besoin d\'aide ! , Feedback...',
            content: 'Nous sommes là pour vous aider ! Si vous avez des questions, des suggestions ou des problèmes, n\'hésitez pas à nous contacter. Votre avis est précieux pour nous permettre d\'améliorer continuellement notre application. Merci de contribuer à faire de notre plateforme un meilleur outil pour tous.',
            image: require('../assets/graduation/41.jpeg'),
          },
          
      
      {
        id: 4,
        title: 'Commencer',
        content: 'Commencez dès maintenant à utiliser notre application pour une gestion simplifiée de vos stages. Inscrivez-vous, créez votre profil, et explorez les nombreuses opportunités de stages disponibles. Notre plateforme vous accompagne pas à pas, de la recherche de stage à la validation de votre expérience professionnelle.',
        image: require('../assets/graduation/duation.jpg'),
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Swiper
        ref={(ref) => (swiper = ref)}
        loop={false}
        index={currentIndex}
        onIndexChanged={(index) => setCurrentIndex(index)}
        showsPagination={true}
        paginationStyle={styles.pagination}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {screens.map((screen) => (
          <View key={screen.id} style={styles.slide}>
            <Image source={screen.image} style={styles.image} />
            <Text style={styles.title}>{screen.title}</Text>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.content}>{screen.content}</Text>
            </ScrollView>
          </View>
        ))}
      </Swiper>
      <View style={styles.buttonContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity onPress={handlePrevious} style={styles.button}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSkip} style={styles.button}>
          <Text style={styles.buttonText}>
            {currentIndex === screens.length - 1 ? 'Finish' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: width,
    height: height * 0.45,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  scrollView: {
    maxHeight: height * 0.4,
    width: width * 0.9,
  },
  content: {
    fontSize: 16,
    fontWeight:'medium',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    padding: 10,
    backgroundColor: '#666',
  
 /*    backgroundColor: '#007AFF', */

    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  pagination: {
    bottom: 70,
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
});

export default OnboardingScreens;