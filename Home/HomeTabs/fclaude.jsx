import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../Partials/FavoritesContext';
import BottomSheet from '../../Partials/BottomSheet';

const Favorites = () => {
  // ... (keep all the existing state and functions)

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
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Postes Favoris</Text>
    </View>
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
    color: '#FFFFFF',
    textAlign: 'center',
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