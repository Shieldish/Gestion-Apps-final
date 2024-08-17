import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

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
      <View style={styles.infoContainer}>
        <Icon name="id-card" size={20} style={styles.icon} />
        <Text style={styles.infoTitle}>ID</Text>
        <Text style={styles.info}>{UUID}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Icon name="envelope" size={20} style={styles.icon} />
        <Text style={styles.infoTitle}>Email</Text>
        <Text style={styles.info}>{EMAIL}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Icon name="building" size={20} style={styles.icon} />
        <Text style={styles.infoTitle}>Department</Text>
        <Text style={styles.info}>{DEPARTEMENT}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Icon name="calendar" size={20} style={styles.icon} />
        <Text style={styles.infoTitle}>Account created at</Text>
        <Text style={styles.info}>{new Date(createdAt).toLocaleString('fr-FR')}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Icon name="refresh" size={20} style={styles.icon} />
        <Text style={styles.infoTitle}>Account last updated</Text>
        <Text style={styles.info}>{new Date(updatedAt).toLocaleString('fr-FR')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 20,
    marginBottom: 20,
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
    color: '#FFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  icon: {
    marginRight: 10,
    color: '#4A90E2',
  },
  infoTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
  },
  info: {
    fontSize: 16,
    color: '#555',
    textAlign: 'right',
  },
});

export default ProfileScreen;
