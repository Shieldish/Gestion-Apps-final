import React, { useEffect, useState, useRef } from 'react';
import Icons from 'react-native-vector-icons/FontAwesome5';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
  FlatList,
} from 'react-native';
import axios from 'axios';
import ContentLoader, { Rect } from 'react-content-loader/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostulantList = () => {
  const [postulants, setPostulants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const fetchPostulants = async () => {
    try {
      setError(null);
      setLoading(true);
      setRefreshing(true);
  
      const token = await AsyncStorage.getItem('userToken');
  
      if (!token) {
        throw new Error('No token found');
      }
  
      const response = await axios.get(
        `${process.env.BACKEND_URL}/etudiant/stage_postuler2`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setPostulants(response.data.postulant);
    } catch (error) {
      console.error('Error fetching postulants:', error);
  
      if (error.response && error.response.status === 404) {
        setError('Vous n\'avez pas de stage postuler');
      } else {
        setError('Erreur lors de la récupération des données: ' + error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPostulants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPostulants();
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderLoader = () => (
    <View style={styles.loaderContainer}>
      <ContentLoader 
        speed={1}
        width={400}
        height={150}
        viewBox="0 0 400 150"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="0" y="10" rx="5" ry="5" width="360" height="10" />
        <Rect x="0" y="30" rx="5" ry="5" width="320" height="10" />
        <Rect x="0" y="50" rx="5" ry="5" width="280" height="10" />
        <Rect x="0" y="80" rx="10" ry="10" width="400" height="60" />
      </ContentLoader>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const translateY = new Animated.Value(50);

    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View 
        style={[
          styles.card,
          { 
            opacity: fadeAnim,
            transform: [{ translateY }],
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>
            <Icons name="university" size={24} color="#4A90E2" /> {item.stageDomaine} : {item.entrepriseName}
          </Text>
          <View style={styles.hrLine} />
          <Text>
            <Text style={styles.bold}><Icon name="person" size={16} /> Nom et Prenom:</Text> {item.etudiantName}
          </Text>
          <Text>
            <Text style={styles.bold}><Icon name="email" size={16} /> Email:</Text> {item.etudiantEmail}
          </Text>
          <Text>
            <Text style={styles.bold}><Icon name="school" size={16} /> Institue:</Text> {item.etudiantInstitue}
          </Text>
          <Text>
            <Text style={styles.bold}><Icon name="business-center" size={16} /> Domaine:</Text> {item.stageDomaine}
          </Text>
          <Text>
            <Text style={styles.bold}><Icon name="category" size={16} /> Section:</Text> {item.etudiantSection}
          </Text>
          <Text>
            <Text style={styles.bold}><Icon name="description" size={16} /> Sujet:</Text> {item.stageSujet}
          </Text>
          <Text>
            <Text style={styles.bold}><Icons name="building" size={16} /> Entreprise/Société:</Text> {item.entrepriseName}
          </Text>
          <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>
            <Text style={styles.bold}><Icon name="check-circle" size={16} /> Status:</Text> {item.status}
          </Text>
          <Text>
            <Text style={styles.bold}><Icon name="calendar-today" size={16} /> Date de postulation:</Text> {item.postulatedAt}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('MoreDetails', {
              stageId: item.stageId,
              etudiantEmail: item.etudiantEmail
            })}
          >
            <Text><Icon name="info" size={16} color={"#4A90E2"}  /> Plus de détails</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <FlatList
        data={[1, 2, 3, 4]} // Render 4 skeleton loaders
        renderItem={renderLoader}
        keyExtractor={(item, index) => `loader-${index}`}
        contentContainerStyle={styles.container}
      />
    );
  }

  return (
    <FlatList
      data={postulants}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.ID}-${item.etudiantEmail}`}
      contentContainerStyle={styles.container}
      ListHeaderComponent={() => (
        <>
          <Text style={styles.title}>Listes des stages Postulés</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
    />
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'a attente':
      return 'rgb(200, 130, 30)';
    case 'accepté':
      return 'green';
    default:
      return 'red';
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  loaderContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
  },
  errorText: {
    color: '#D8000C',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardBody: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  hrLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostulantList;

