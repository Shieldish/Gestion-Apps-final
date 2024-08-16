import 'react-native-gesture-handler';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Postulation = ({ route }) => {
  const { stage } = route.params;
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => setLoading(false));
  }, []);

  const handlePostuler = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.navigate('ApplicationForm', { stage: stage.id }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        <LinearGradient
          colors={['#4c669f', "#4A90E2", '#192f6a']}
          style={styles.header}
        >
          <Text style={styles.title}>Stage Details</Text>
        </LinearGradient>
        <View style={styles.detailsContainer}>
          <DetailItem icon="briefcase" label="StageID" value={stage.id} />
          <DetailItem icon="building" label="Sociéte/Entreprise" value={stage.Nom} />
          <DetailItem icon="tags" label="Domaine" value={stage.Domaine} />
          <DetailItem icon="file-text" label="Sujets" value={`${stage.Libelle} : ${stage.Titre}`} />
          <DetailItem icon="info-circle" label="Description" value={stage.Description} />
          <DetailItem icon="graduation-cap" label="Niveau" value={stage.Niveau} />
          <DetailItem icon="star" label="Experience" value={stage.Experience} />
          <DetailItem icon="language" label="Langue" value={stage.Langue} />
          <DetailItem icon="map-marker" label="Address" value={`${stage.Address}, ${stage.Rue}`} />
          <DetailItem icon="phone" label="Contact" value={`${stage.Telephone} / ${stage.Fax}`} />
          <DetailItem icon="envelope" label="Mail" value={`${stage.Email} / ${stage.Email2}`} />
          <DetailItem 
            icon="calendar" 
            label="Période" 
            value={`${new Date(stage.DateDebut).toLocaleDateString()} - ${new Date(stage.DateFin).toLocaleDateString()}`} 
          />
        </View>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity style={styles.postulerButton} onPress={handlePostuler}>
            <LinearGradient
              colors={['#4c669f',"#4A90E2", '#192f6a']}
              style={styles.gradient}
            >
              <Text style={styles.postulerButtonText}>Postuler maintenant</Text>
              <Icon name="arrow-right" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
};

const DetailItem = ({ icon, label, value }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = value.length > 100;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Animated.View style={[styles.detailItem, { opacity: fadeAnim }]}>
      <Icon name={icon} size={20} color="#4A90E2" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {isLongText && !expanded ? (
          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.value} numberOfLines={3} ellipsizeMode="tail">
              {value}
            </Text>
            <Text style={styles.expandButton}>See more</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleExpand}>
            <Text style={styles.value}>{value}</Text>
            {isLongText && <Text style={styles.expandButton}>See less</Text>}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    color: "#4A90E2",
    marginBottom: 5,
  },
  value: {
    color: '#333',
  },
  expandButton: {
    color: '#3b5998',
    marginTop: 5,
  },
  postulerButton: {
    margin: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  postulerButtonText: {
    color: 'white',
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Postulation;


