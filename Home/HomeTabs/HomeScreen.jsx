import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, RefreshControl, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import JobListings from '../../Partials/JobListings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobData, setJobData] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error("Aucun jeton d'authentification trouvé");
      }

      const response = await axios.get(`${process.env.BACKEND_URL}/etudiant/All`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobData(response.data.stages);
      setError('');
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setError('Échec de la récupération des données. Veuillez vérifier votre connexion réseau  . ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>2
          </View>
        ) : !jobData ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Aucune offre d'emploi disponible.</Text>
          </View>
        ) : (
          <JobListings data={jobData} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFE5E5', // Light red background for error container
    borderRadius: 10, // Rounded corners
    margin: 20, // Margin around the error container
  },
  errorText: {
    fontSize: 16,
    color: '#D8000C', // Red color for error text
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default App;