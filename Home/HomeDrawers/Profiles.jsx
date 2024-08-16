import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#007bff',
    paddingVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
    color: '#007bff',
  },
  infoTitle: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    flex: 1,
  },
  info: {
    fontSize: 16,
    color: '#343a40',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default ProfileScreen;
