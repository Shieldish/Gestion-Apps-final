import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTheme } from   '../../Services/ThemeContext';  

const Stages = () => {
  const { globalStyles } = useTheme();
  
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
          limit: '5',
          ...filters,
        }
      });
        //   console.log(response.data.stages)   
     /*    console.log('response',response.data)     */

      setStages(response.data.stages);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalItems: response.data.pagination.totalItems,
      });
  
      setSearchError(!response.data.stages || response.data.stages.length === 0);
  
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


  const renderStageItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.jobTitle}>{item.Nom} - {item.Domaine}</Text>
      <Text style={styles.companyLocation}> <Icon name='map-marker' size={15} ></Icon> {item.Address} </Text>
      <Text style={styles.postedDate}> <Icon name='clock-o'></Icon>  {getTimeSinceCreated(new Date(item.createdAt))}</Text>
      <View style={styles.hrLine} />
  
      <View style={styles.infoGrid}>
        <InfoItem label="Postes vacants:" value={item.PostesVacants} />
        <InfoItem label="Type d'emploi désiré :" value={`${item.Libelle}`} />
        <InfoItem label="Experience :" value={item.Experience} />
        <InfoItem label="Niveau d'étude :" value={item.Niveau} />
        <InfoItem label="Langue :" value={item.Langue} />
        <InfoItem label="Genre :" value="Indifférent" />
      </View>
      <View style={styles.hrLine} />

      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Description de l'emploi</Text>
        <Text style={styles.descriptionText}>{item.Description}</Text>
      </View>
  
      <TouchableOpacity
        style={styles.postulateButton}
        onPress={() => navigation.navigate('Postulation', { stage: item })}
      >
        <Text style={styles.postulateButtonText}>Postuler</Text>
      </TouchableOpacity>
    </View>
  );
  
  const InfoItem = ({ label, value }) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
        !stages ? (
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
            showsVerticalScrollIndicator={false} // Add this line
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardBody: {
    flex: 1,
  },
  jobCompany: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 30,
    textAlign:"center",
    textTransform:"uppercase",
    color:"#007bff",
    fontStyle:"bold"
  },
  hrLine: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  detailContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  postulateButton: {
    backgroundColor: '#192f6a',
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
  header: {
    marginBottom: 12,
    alignItems:"center"
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#007bff',
   
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  emptySearchContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptySearchText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: 'grey',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom:10,
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

  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
   
    color: '#333',
    marginBottom: 4,
  },
  companyLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  postedDate: {
    alignSelf: 'flex-end',
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  infoGrid: {
  /*   backgroundColor: '#F5F5F5', */
    backgroundColor:'#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    color: '#666',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    color: '#666',
    lineHeight: 20,
  },

  postulateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },


  
});

export default Stages;
