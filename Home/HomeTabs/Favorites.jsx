import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../Partials/FavoritesContext';
import BottomSheet from '../../Partials/BottomSheet'; 

const Favorites = () => {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { updateFavoritesCount } = useFavorites();
  const [appliedJobs, setAppliedJobs] = useState({});
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [theMail, setEmail] = useState(null);

  const checkAppliedStatus = async (email, jobId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${process.env.BACKEND_URL}/etudiant/check-email`, {
        params: { email, stageId: jobId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.exists;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de candidature:', error);
      return false;
    }
  };

  const handleDeletePress = (job) => {
    setJobToDelete(job);
    setIsBottomSheetVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete) {
      await handleToggleFavorite(jobToDelete, false);
      setIsBottomSheetVisible(false);
      setJobToDelete(null);
    }
  };

  const renderStyledMessage = () => {
    if (!jobToDelete) {
      return <Text style={styles.messageText}>Êtes-vous sûr de vouloir retirer ce poste de vos favoris ?</Text>;
    }

    return (
      <Text style={styles.messageText}>
        Êtes-vous sûr de vouloir retirer ce poste :{' '}
        <Text style={[styles.highlightedText, styles.greenText, styles.boldText]}>{jobToDelete.Titre}</Text>,{' '}
        <Text style={[styles.highlightedText, styles.blueText, styles.boldText]}>{jobToDelete.Libelle}</Text>
        {' '}de vos favoris ?
      </Text>
    );
  };

  const fetchJobsByIds = async (ids) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${process.env.BACKEND_URL}/etudiant/stages/byIds`,
        { ids },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      updateFavoritesCount(response.data?.length);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des postes par IDs:', error);
      throw error;
    }
  };

  const loadFavoriteJobs = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favoriteJobs');
      if (savedFavorites !== null) {
        const favoriteIds = JSON.parse(savedFavorites);
        if (Array.isArray(favoriteIds) && favoriteIds.length > 0) {
          const favorites = await fetchJobsByIds(favoriteIds);
          setFavoriteJobs(Array.isArray(favorites) ? favorites : []);

          // Check applied status for each job
          const Data = await AsyncStorage.getItem('userData');
          const data = JSON.parse(Data);
          const email = data.userData.EMAIL;
          setEmail(email);
          const appliedStatus = {};
          for (const job of favorites) {
            appliedStatus[job.id] = await checkAppliedStatus(email, job.id);
          }
          setAppliedJobs(appliedStatus);
        } else {
          setFavoriteJobs([]);
        }
      } else {
        setFavoriteJobs([]);
        updateFavoritesCount(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des postes favoris:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavoriteJobs();
    }, [])
  );

  const handleToggleFavorite = async (job, isFavorite) => {
    try {
      const updatedFavorites = isFavorite
        ? [...favoriteJobs, job]
        : favoriteJobs.filter(favJob => favJob.id !== job.id);
      setFavoriteJobs(updatedFavorites);
      const favoriteIds = updatedFavorites.map(job => job.id);
      await AsyncStorage.setItem('favoriteJobs', JSON.stringify(favoriteIds));
      updateFavoritesCount(favoriteIds.length);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des postes favoris:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null); // Reset the error state
    try {
      await loadFavoriteJobs();
    } catch (error) {
      setError(error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur lors du chargement des postes favoris : {error.message}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Rafraîchir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderJob = ({ item: job }) => (
    <View style={[
      styles.jobContainer,
      appliedJobs[job.id] && styles.appliedJobContainer
    ]}>
      <TouchableOpacity
        style={styles.trashIcon}
        onPress={() => handleDeletePress(job)}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
      {appliedJobs[job.id] && (
        <Text style={styles.appliedText}>Déjà Candidaté</Text>
      )}
      <Text style={styles.cardTitle}>{job.Titre}</Text>
      <Text style={styles.cardSubtitle}>{job.Libelle}</Text>
      <Divider />
      <Text style={styles.cardInfo2}>{job.Nom} - {job.Address}</Text>
      <Divider />
      <Text style={styles.cardInfo}><Text style={styles.bold}>Experience:</Text> {job.Experience}</Text>
      <Text style={styles.cardInfo}><Text style={styles.bold}>Niveau:</Text> {job.Niveau}</Text>
      <Text style={styles.cardInfo}><Text style={styles.bold}>Postes Vacants:</Text> {job.PostesVacants}</Text>
      <Text style={styles.cardInfo}><Text style={styles.bold}>Date Debut:</Text> {new Date(job.DateDebut).toLocaleDateString()}</Text>
      <Text style={styles.cardInfo}><Text style={styles.bold}>Date Fin:</Text> {new Date(job.DateFin).toLocaleDateString()}</Text>
      <Text style={styles.cardInfo3}>Publié le : {new Date(job.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
      <Divider />
      <TouchableOpacity 
        style={[styles.button, appliedJobs[job.id] && styles.viewDetailsButton]}
        onPress={() => {
          if (appliedJobs[job.id]) {
            navigation.navigate('MoreDetails', {
              stageId: job.id,
              etudiantEmail: theMail
            });
          } else {
            navigation.navigate('Postulation', { stage: job });
          }
        }}
      >
        <Text style={styles.buttonText}>
          {appliedJobs[job.id] ? 'Voir les détails de la candidature' : 'Postuler'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <Text style={styles.header}>Postes Favoris</Text>
  );

  const renderFooter = () => (
    <Text style={styles.footer}>Fin de la liste</Text>
  );

  return (
    <View style={styles.container}>
      {favoriteJobs && Array.isArray(favoriteJobs) && favoriteJobs.length === 0 ? (
        <Text style={styles.noFavoritesText}>Aucun poste favori pour l'instant</Text>
      ) : (
        <FlatList
          data={favoriteJobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
        />
      )}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onConfirm={handleConfirmDelete}
        message={renderStyledMessage()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  jobContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appliedJobContainer: {
    backgroundColor: '#e0f7fa',
  },
  trashIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  appliedText: {
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  cardInfo2: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  cardInfo: {
    fontSize: 14,
    color: '#333',
  },
  cardInfo3: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    color: '#aaa',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  viewDetailsButton: {
    backgroundColor: '#e76f51',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noFavoritesText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  refreshButton: {
    padding: 10,
    backgroundColor: '#4A90E2',
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  highlightedText: {
    fontSize: 16,
  },
  greenText: {
    color: 'green',
  },
  blueText: {
    color: 'blue',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default Favorites;
