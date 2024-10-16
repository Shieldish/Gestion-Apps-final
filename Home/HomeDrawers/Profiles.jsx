import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        const data = JSON.parse(storedUserData);
        console.log(data.userData);
        if (data.userData) {
          setUserData(data.userData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    fetchUserData();
  }, []);

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { NOM, PRENOM, EMAIL, DEPARTEMENT, createdAt, updatedAt, UUID } = userData;

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://static.vecteezy.com/system/resources/thumbnails/020/911/740/small_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{`${PRENOM} ${NOM}`}</Text>
      </View>
      <View style={styles.infoSection}>
        <InfoItem icon="id-card" title="ID" info={UUID} />
        <InfoItem icon="envelope" title="Email" info={EMAIL} />
        <InfoItem icon="building" title="Department" info={DEPARTEMENT} />
        <InfoItem icon="calendar-plus" title="Account created at" info={new Date(createdAt).toLocaleString('fr-FR')} />
        <InfoItem icon="calendar-check" title="Account last updated" info={new Date(updatedAt).toLocaleString('fr-FR')} />
      </View>
    </ScrollView>
  );
};

const InfoItem = ({ icon, title, info }) => (
  <View style={styles.infoContainer}>
    <View style={styles.iconContainer}>
      <Icon name={icon} size={20} color="#4A90E2" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.info}>{info}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4A90E2',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoSection: {
    padding: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e8fd',
    borderRadius: 20,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ProfileScreen;