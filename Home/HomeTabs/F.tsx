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
 /*  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavoriteJobs();
    setRefreshing(false);
  }; */

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
              stageId:job.id,
              etudiantEmail:theMail
            })
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
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  noFavoritesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  jobContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop:30,
    color: '#2c3e50',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardInfo: {
    fontSize: 16,
    marginBottom: 8,
    color: '#7f8c8d',
  },
  cardInfo2: {
    fontSize: 16,
    margin:10,
    color: '#007bff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign:'center'
  },
  cardInfo3: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'right',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  footer: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'pink',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#192f6a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  trashIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  highlightedText: {
    fontWeight: 'bold',
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
  appliedJobContainer: {
    borderColor: 'black',
    backgroundColor :'#FFFAF0'
  },
/*   appliedText: {
    color: 'red',
    fontWeight: 'bold',
    position: 'absolute',
    top: 5,
    left: 5,
  }, */
  appliedText: {
    color: 'red',
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    left: -25,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white background
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
    overflow: 'hidden',
    zIndex: 1, // Ensure it's above other elements
  },
  viewDetailsButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Favorites;
