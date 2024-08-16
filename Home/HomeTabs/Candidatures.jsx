import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl, Animated, FlatList, StatusBar } from 'react-native';
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
        setError(' Erreur lors de la récupération des données: '+error.message);
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
            transform: [{ translateY }]
          }
        ]}
      >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderIcon}>
          <Icon name="work" size={24} color="#4A90E2" />
        </View>
        <View style={styles.cardHeaderContent}>
          <Text style={styles.cardTitle}>{item.stageDomaine}</Text>
          <Text style={styles.cardSubtitle}>{item.entrepriseName}</Text>
        </View>
      </View>
        <View style={styles.cardBody}>
          <InfoItem icon="person" label="Nom et Prenom" value={item.etudiantName} />
          <InfoItem icon="email" label="Email" value={item.etudiantEmail} />
          <InfoItem icon="school" label="Institut" value={item.etudiantInstitue} />
          <InfoItem icon="business-center" label="Domaine" value={item.stageDomaine} />
          <InfoItem icon="category" label="Section" value={item.etudiantSection} />
          <InfoItem icon="description" label="Sujet" value={item.stageSujet} />
          <InfoItem icon="home" label="Entreprise/Société" value={item.entrepriseName} />
          <InfoItem icon="check-circle" label="Status" value={item.status} color={getStatusColor(item.status)} />
          <InfoItem icon="calendar-today" label="Date de postulation" value={item.postulatedAt} />
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('MoreDetails', {
              stageId: item.stageId,
              etudiantEmail: item.etudiantEmail
            })}
          >
            <Icon name="info" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Plus de détails</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <FlatList
        data={[1, 2, 3, 4]}
        renderItem={renderLoader}
        keyExtractor={(item, index) => `loader-${index}`}
        contentContainerStyle={styles.container}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      <FlatList
        data={postulants}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.ID}-${item.etudiantEmail}`}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.title}>Liste des stages postulés</Text>
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="error" size={24} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4A90E2']} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const InfoItem = ({ icon, label, value, color }) => (
  <View style={styles.infoItem}>
    <Icon name={icon} size={18} color="#4A90E2" />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
  </View>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'a attente':
      return '#FFA500';
    case 'accepté':
      return '#4CAF50';
    default:
      return '#FF6B6B';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8', //
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  cardBody: {
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
  },
  loaderContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeaderIcon: {
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default PostulantList;