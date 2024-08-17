import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, TextInput, Animated, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Divider = () => <View style={styles.divider} />;

const JobCard = React.memo(({ job, onToggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favoriteJobs = await AsyncStorage.getItem('favoriteJobs');
        if (favoriteJobs !== null) {
          const favorites = JSON.parse(favoriteJobs);
          setIsFavorite(favorites.includes(job.id));
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    checkFavoriteStatus();
  }, [job.id]);

  const toggleFavorite = useCallback(async () => {
    try {
      const favoriteJobs = await AsyncStorage.getItem('favoriteJobs');
      let favorites = favoriteJobs ? JSON.parse(favoriteJobs) : [];
      
      if (isFavorite) {
        favorites = favorites.filter(id => id !== job.id);
      } else {
        favorites.push(job.id);
      }
      
      await AsyncStorage.setItem('favoriteJobs', JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
      if (typeof onToggleFavorite === 'function') {
        onToggleFavorite(job, !isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [isFavorite, job, onToggleFavorite]);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? '#FF6B6B' : '#4A4A4A'} />
      </TouchableOpacity>
      <Text style={styles.cardTitle}>{job.Titre}</Text>
      <Text style={styles.cardSubtitle}>{job.Libelle}</Text>
      <Text style={styles.cardInfo2}>
        <Ionicons name="business-outline" size={16} color="#4A90E2" /> {job.Nom} - {job.Address}
      </Text>
      <View style={styles.infoRow}>
        <InfoItem icon="briefcase-outline" label="Experience" value={job.Experience} />
        <InfoItem icon="school-outline" label="Niveau" value={job.Niveau} />
      </View>
      <View style={styles.infoRow}>
        <InfoItem icon="people-outline" label="Postes Vacants" value={job.PostesVacants.toString()} />
        <InfoItem icon="calendar-outline" label="Date Debut" value={new Date(job.DateDebut).toLocaleDateString()} />
      </View>
      <InfoItem icon="calendar-outline" label="Date Fin" value={new Date(job.DateFin).toLocaleDateString()} />
      <Text style={styles.cardInfo3}>
        <Ionicons name="time-outline" size={16} color="#4A90E2" /> Publié le : {new Date(job.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </Text>
      <Divider />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Postulation', { stage: job })}>
        <Text style={styles.buttonText}>Voir plus de détails</Text>
      </TouchableOpacity>
    </View>
  );
});

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={16} color="#4A90E2" />
    <Text style={styles.infoLabel}>{label}: </Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const JobListings = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const [favoriteJobs, setFavoriteJobs] = useState([]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    const loadFavoriteJobs = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favoriteJobs');
        if (savedFavorites !== null) {
          const favoriteIds = JSON.parse(savedFavorites);
          const favorites = data.filter(job => favoriteIds.includes(job.id));
          setFavoriteJobs(favorites);
        }
      } catch (error) {
        console.error('Error loading favorite jobs:', error);
      }
    };
    loadFavoriteJobs();
  }, [data]);

  const handleToggleFavorite = useCallback((job, isFavorite) => {
    setFavoriteJobs(prevFavorites =>
      isFavorite ? [...prevFavorites, job] : prevFavorites.filter(favJob => favJob.id !== job.id)
    );
  }, []);

  useEffect(() => {
    const filtered = data.filter(job =>
      job.Titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Domaine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Niveau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.State.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Experience.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    setFilteredData(sorted);
  }, [searchTerm, data, sortOrder]);

  const FilterTab = ({ sortOrder, onSortChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleAccordion = () => {
      const toValue = expanded ? 0 : 1;
      Animated.timing(animation, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setExpanded(!expanded);
    };

    const bodyHeight = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 100], // Adjust this value based on your content
    });

    return (
      <View style={styles.accordion}>
        <TouchableOpacity style={styles.header} onPress={toggleAccordion}>
          <Text style={styles.headerText}>triés par</Text>
          <Ionicons name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Animated.View style={[styles.body, { height: bodyHeight }]}>
          <TouchableOpacity
            style={[styles.filterButton, sortOrder === 'newest' && styles.activeFilter]}
            onPress={() => {
              onSortChange('newest');
              toggleAccordion();
            }}
          >
            <Ionicons name="time-outline" size={24} color={sortOrder === 'newest' ? "#4A90E2" : '#7f8c8d'} />
            <Text style={[styles.filterText, sortOrder === 'newest' && styles.activeFilterText]}>Les plus Recents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, sortOrder === 'oldest' && styles.activeFilter]}
            onPress={() => {
              onSortChange('oldest');
              toggleAccordion();
            }}
          >
            <Ionicons name="calendar-outline" size={24} color={sortOrder === 'oldest' ? "#4A90E2" : '#7f8c8d'} />
            <Text style={[styles.filterText, sortOrder === 'oldest' && styles.activeFilterText]}>Les plus anciens</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const groupedData = useMemo(() => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];

    return Object.entries(
      filteredData.reduce((acc, item) => {
        if (!acc[item.Domaine]) {
          acc[item.Domaine] = [];
        }
        acc[item.Domaine].push(item);
        return acc;
      }, {})
    );
  }, [filteredData]);

  const renderJobList = useCallback(
    ([domain, jobs]) => (
      <View style={styles.domaineContainer} key={domain}>
        <Text style={styles.domaineTitle}>{domain}</Text>
        <FlatList
          data={jobs}
          renderItem={({ item }) => <JobCard job={item} onToggleFavorite={handleToggleFavorite} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
        <Divider />
      </View>
    ),
    [handleToggleFavorite]
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Recherche..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <FilterTab sortOrder={sortOrder} onSortChange={setSortOrder} />
      {filteredData.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.notFoundText}>"{searchTerm}" pas trouvé(e)s</Text>
        </View>
      ) : (
        <ScrollView>
          {searchTerm
            ? filteredData.map(item => <JobCard key={item.id} job={item} onToggleFavorite={handleToggleFavorite} />)
            : groupedData.map(renderJobList)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 10,
  },
  cardInfo2: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#4A4A4A',
    marginLeft: 5,
  },
  infoValue: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  cardInfo3: {
    fontSize: 12,
    color: '#4A4A4A',
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  domaineContainer: {
    marginBottom: 20,
  },
  domaineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginLeft: 10,
    marginBottom: 10,
  },
  accordion: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },
  body: {
    overflow: 'hidden',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  filterText: {
    marginLeft: 10,
    color: '#4A4A4A',
  },
  activeFilter: {
    backgroundColor: '#E6F0FF',
  },
  activeFilterText: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#4A4A4A',
  },
});

export default JobListings;

