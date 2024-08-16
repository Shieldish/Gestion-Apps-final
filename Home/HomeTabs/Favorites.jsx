import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../Partials/FavoritesContext';
import BottomSheet from '../../Partials/BottomSheet';
import { Divider } from 'react-native-elements';

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
  const [theMail,SetEmail]=useState(null)

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
      updateFavoritesCount(response.data?.length)
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
        //  console.log("Data =", data.userData.EMAIL)
          const email = data.userData.EMAIL;
          SetEmail(email)
          const appliedStatus = {};
          for (const job of favorites) {
            appliedStatus[job.id] = await checkAppliedStatus( email, job.id);
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
        <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
      </TouchableOpacity>
      {appliedJobs[job.id] && (
        <View style={styles.appliedBadge}>
          <Text style={styles.appliedText}>Déjà Candidaté</Text>
        
        </View>
       
      
      )}
      
      <Text style={styles.cardTitle}>{job.Titre}</Text>
      <Text style={styles.cardSubtitle}>{job.Libelle}</Text>
      
      <View style={styles.companyInfo}>
        <Ionicons name="business-outline" size={16} color="#4A90E2" />
        <Text style={styles.cardInfo2}>{job.Nom} - {job.Address}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <InfoItem icon="briefcase-outline" label="Experience" value={job.Experience} />
      <InfoItem icon="school-outline" label="Niveau" value={job.Niveau} />
      <InfoItem icon="people-outline" label="Postes Vacants" value={job.PostesVacants} />
      <InfoItem icon="calendar-outline" label="Date Debut" value={new Date(job.DateDebut).toLocaleDateString()} />
      <InfoItem icon="calendar-outline" label="Date Fin" value={new Date(job.DateFin).toLocaleDateString()} />
      
      <Text style={styles.cardInfo3}>
        Publié le : {new Date(job.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </Text>
      
      <View style={styles.divider} />
      
      <TouchableOpacity 
        style={[styles.button, appliedJobs[job.id] && styles.viewDetailsButton]}
        onPress={() => {
          if (appliedJobs[job.id]) {
            navigation.navigate('MoreDetails', {
              stageId: job.id,
              etudiantEmail: theMail
            })
          } else {
            navigation.navigate('Postulation', { stage: job });
          }
        }}
      >
        <Text style={styles.buttonText}>
          {appliedJobs[job.id] ? 'Voir les détails' : 'Postuler'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color="#4A90E2" />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderHeader = () => (
   
      <Text style={styles.header}>Postes Favoris</Text>
   
  );

  const renderFooter = () => (
    <Text style={styles.footer}>Fin de la liste</Text>
  );

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
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>Erreur lors du chargement des postes favoris : {error.message}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Rafraîchir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {favoriteJobs && Array.isArray(favoriteJobs) && favoriteJobs.length === 0 ? (
        <View style={styles.noFavoritesContainer}>
          <Ionicons name="heart-outline" size={64} color="#4A90E2" />
          <Text style={styles.noFavoritesText}>Aucun poste favori pour l'instant</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteJobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        onConfirm={handleConfirmDelete}
        message={renderStyledMessage()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  jobContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appliedJobContainer: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  trashIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  appliedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  appliedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    paddingTop:20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardInfo2: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
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
  cardInfo3: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 16,
    marginBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noFavoritesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFavoritesText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Favorites;