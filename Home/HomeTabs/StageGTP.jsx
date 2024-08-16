import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Stages = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [searchError, setSearchError] = useState(false);
  const navigation = useNavigation();
  const isFetching = useRef(false);
  const [getDate ,setDate]=useState([])

  useEffect(() => {
    fetchStages();
  }, [pagination.currentPage, search, filters]);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${process.env.BACKEND_URL}/etudiant/All`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          search: search.trim(),
          page: pagination.currentPage.toString(),
          limit: '10',
          ...filters,
        }
      });
      console.log("response.data.stages",response.data.stages)
      setStages(response.data.stages);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalItems,
      });

      setSearchError(response.data.stages.length === 0);

    } catch (error) {
      console.error('Error fetching stages:', error);
      let errorMessage = 'An error occurred while fetching the stages.';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else {
          errorMessage = `HTTP error! status: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from the server. Please check your internet connection.';
      }

      Alert.alert(
        'Error Fetching Data',
        errorMessage,
        [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          { text: 'Retry', onPress: fetchStages },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!isFetching.current) {
      setRefreshing(true);
      fetchStages();
    }
  };

  const handlePrevPage = () => {
    if (!loading && pagination.currentPage > 1) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (!loading && pagination.currentPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const getTimeSinceCreated = (createdAt) => {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    if (diffSeconds < 60) {
      return `il y a ${diffSeconds} secondes`;
    } else if (diffMinutes < 60) {
      return `il y a ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours} heures`;
    } else {
      return `il y a ${diffDays} jours`;
    }
  };

  const renderStageItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.jobTitle}>{item.Nom} - {item.Domaine}</Text>
      <Text style={styles.companyLocation}> <Icon name='map-marker' size={15} ></Icon> {item.Address}</Text>
      <Text style={styles.jobDate}>{ 'publié ' +getTimeSinceCreated(new Date(item.createdAt))}</Text>
      <View style={styles.hrLine} />

      <View style={styles.detailContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Postes vacants:</Text>
          <Text style={styles.detailText}>{item.PostesVacants}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type d'emploi désiré:</Text>
          <Text style={styles.detailText}>{item.Libelle}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Experience:</Text>
          <Text style={styles.detailText}>{item.Experience}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Niveau d'étude:</Text>
          <Text style={styles.detailText}>{item.Niveau}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Langue:</Text>
          <Text style={styles.detailText}>{item.Langue}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Genre:</Text>
          <Text style={styles.detailText}>Indifférent</Text>
        </View>
      </View>
      <View style={styles.hrLine} />

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description de l'emploi</Text>
        <Text style={styles.descriptionText}>{item.Description}</Text>
      </View>

      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Exigences de l'emploi</Text>
        <Text style={styles.requirementsText}>Responsabilités</Text>
        <Text style={styles.requirementsText}>{item.Libelle}</Text>
      </View>

      <TouchableOpacity
        style={styles.postulateButton}
        onPress={() => navigation.navigate('Postulation', { stage: item })}
      >
        <Text style={styles.postulateButtonText}>Postuler</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Liste des Stages</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>© 2024 Stages App</Text>
    </View>
  );

  const renderEmptySearch = () => (
    <View style={styles.emptySearchContainer}>
      <Text style={styles.emptySearchText}>{`"${search}" not found`}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        value={search}
        onChangeText={setSearch}
      />

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        !stages? (
          searchError ? renderEmptySearch() : null
        ) : (
          <FlatList
            data={stages}
            renderItem={renderStageItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, { opacity: pagination.currentPage === 1 ? 0.5 : 1 }]}
          onPress={handlePrevPage}
          disabled={pagination.currentPage === 1 || loading}
        >
          <Text style={styles.paginationButtonText}>{'<<'}</Text>
        </TouchableOpacity>
        <Text style={styles.paginationText}>{pagination.currentPage} / {pagination.totalPages}</Text>
        <TouchableOpacity
          style={[styles.paginationButton, { opacity: pagination.currentPage === pagination.totalPages ? 0.5 : 1 }]}
          onPress={handleNextPage}
          disabled={pagination.currentPage === pagination.totalPages || loading}
        >
          <Text style={styles.paginationButtonText}>{'>>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
    borderWidth: 0,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color:'#192f6a',
   /*   '#007bff', */
    marginBottom: 8,
  },
  jobDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  hrLine: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  detailContainer: {
    marginBottom: 16,
    padding:10,
    backgroundColor:"#ccc"
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 16,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'justify',
  },
  requirementsContainer: {
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 16,
    textAlign: 'justify',
  },
 /*  postulateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postulateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }, */
  postulateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  postulateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySearchContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptySearchText: {
    fontSize: 18,
    color: '#888',
  },
  companyLocation: {
    fontSize: 16,
    alignSelf:'center',
    color: '#666',
    marginBottom: 2,
  },
});

export default Stages;
