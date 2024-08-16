import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Linking,Alert, TouchableOpacity,RefreshControl  } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Font from 'expo-font';

const MoreDetails = ({ route }) => {
    const { stageId, etudiantEmail } = route.params;
    const [candidature, setCandidature] = useState(null);
    const [stageData, setStageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData().then(() => setRefreshing(false));
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepté':
                return styles.statusAccepted;
            case 'refusé':
                return styles.statusRejected;
            default:
                return styles.statusPending;
        }
    };

    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
                'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
            });
            setFontsLoaded(true);
        };

        loadFonts();
        fetchData();
    }, [etudiantEmail, stageId]);

    const fetchData = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(`${process.env.BACKEND_URL}/etudiant/candidatures2`, {
                params: { etudiantEmail, stageId },
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            const { candidature, stage } = response.data;
            console.log(candidature)
            setCandidature(candidature);
            setStageData(stage);
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    if (loading || !fontsLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <FontAwesome5 name="spinner" size={50} color="#007AFF" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <FontAwesome5 name="exclamation-triangle" size={50} color="#FF3B30" />
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false} 
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
    >
       
            <LinearGradient
                colors={["#4A90E2", "#4A90E2", '#192f6a']}
                style={styles.gradientBackground}
            >
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <Text style={styles.heading}>
                        <FontAwesome5 name="building" size={24} color="#FFF" /> {stageData.entrepriseName}
                    </Text>
                    <Text style={styles.subHeading}>
                        <FontAwesome5 name="briefcase" size={18} color="#FFF" /> {stageData.stageDomaine} - {stageData.stageSujet}
                    </Text>

                    <View style={[styles.statusContainer, getStatusStyle(stageData.status)]}>
                        <FontAwesome5 name={stageData.status === 'accepté' ? 'check-circle' : 'times-circle'} size={18} color="#FFF" />
                        <Text style={styles.statusText}>CANDIDATURE {stageData.status.toUpperCase()}</Text>
                    </View>

                    {candidature && (
                        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                            <Text style={styles.title}>{candidature.nom} {candidature.prenom}</Text>
                            <View style={styles.separator} />
                            
                            {/* Personal Information */}
                            <SectionWithIcon icon="user" title="Informations personnelles">
                                <InfoItem label="Date de naissance" value={candidature.date_naissance} />
                                <InfoItem label="Adresse" value={candidature.adresse} />
                                <InfoItem label="Téléphone" value={candidature.telephone} />
                                <InfoItem label="Email" value={candidature.email} />
                            </SectionWithIcon>

                            {/* Education */}
                            <SectionWithIcon icon="graduation-cap" title="Formation">
                                <InfoItem label="Niveau d'études" value={candidature.niveau_etudes} />
                                <InfoItem label="Institution" value={candidature.institution} />
                                <InfoItem label="Domaine d'études" value={candidature.domaine_etudes} />
                                <InfoItem label="Section" value={candidature.section} />
                                <InfoItem label="Année d'obtention" value={candidature.annee_obtention} />
                            </SectionWithIcon>

                            {/* Experience */}
                            <SectionWithIcon icon="briefcase" title="Expérience pertinente">
                                <InfoItem label="Expérience" value={candidature.experience ? 'Oui' : 'Non'} />
                                {candidature.experience_description && (
                                    <InfoItem label="Description de l'expérience" value={candidature.experience_description} />
                                )}
                            </SectionWithIcon>

                            {/* Motivation */}
                            <SectionWithIcon icon="comment" title="Motivation pour ce stage">
                                <InfoItem label="Motivation" value={candidature.motivation} />
                            </SectionWithIcon>

                            {/* Skills */}
                            <SectionWithIcon icon="cogs" title="Compétences">
                                <InfoItem label="Langues" value={candidature.langues} />
                                <InfoItem label="Logiciels" value={candidature.logiciels} />
                                <InfoItem label="Autres compétences" value={candidature.competences_autres} />
                            </SectionWithIcon>

                            {/* Availability */}
                            <SectionWithIcon icon="calendar-alt" title="Disponibilités">
                                <InfoItem label="Date de début" value={candidature.date_debut} />
                                <InfoItem label="Durée du stage" value={`${candidature.duree_stage} mois`} />
                            </SectionWithIcon>

                            {/* Documents */}
                        {/*     <SectionWithIcon icon="file-alt" title="Pièces justificatives">
                              <DocumentLink label="CV" url={candidature.cv} />
                              <DocumentLink label="Lettre de Motivation" url={candidature.lettre_motivation} />
                              <DocumentLink label="Relevés de Notes" url={candidature.releves_notes} />
                            </SectionWithIcon> */}

     <SectionWithIcon icon="file-alt" title="Pièces justificatives">
        <DocumentLink label="CV" url={candidature.cv} />
        <DocumentLink label="Lettre de Motivation" url={candidature.lettre_motivation} />
        <DocumentLink label="Relevés de Notes" url={candidature.releves_notes} />
      </SectionWithIcon>
                        </Animated.View>
                    )}
                </Animated.View>
            </LinearGradient>
        </ScrollView>
    );
};

const SectionWithIcon = ({ icon, title, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <FontAwesome5 name={icon} size={18} color="#007AFF" />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const InfoItem = ({ label, value }) => (
    <Text style={styles.infoItem}>
        <Text style={styles.bold}>{label}:</Text> {value}
    </Text>
);

/* const DocumentLink = ({ label, url }) => (
    <View style={styles.documentLinkContainer}>
        <FontAwesome5 
            name="file-pdf" 
            size={18} 
            color={url && url !== "document pas fournis" ? "#007AFF" : "#FF3B30"} 
        />
        {url && url !== "document pas fournis" ? (
            <TouchableOpacity onPress={() => Linking.openURL(url)}>
                <Text style={styles.documentLinkText}>{label}</Text>
            </TouchableOpacity>
        ) : (
            <Text style={styles.documentMissingText}>
                {label}: <Text style={styles.redText}>document pas fournis</Text>
            </Text>
        )}
    </View>
);
 */

const DocumentLink = ({ label, url }) => {
    const openDocument = async () => {
      const supported = await Linking.canOpenURL(url);
      console.log(url)
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this document :"+url);
      }
    };
  
    return (
      <TouchableOpacity onPress={openDocument} style={styles.documentLink}>
        <FontAwesome5 name="file-pdf" size={18} color="#007AFF" />
        <Text style={styles.documentLinkText}>{label}</Text>
      </TouchableOpacity>
    );
  };

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    gradientBackground: {
        flex: 1,
        paddingVertical: 20,
    },
    container: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        fontFamily: 'Roboto-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 10,
        fontSize: 18,
        color: '#FF3B30',
        fontFamily: 'Roboto-Regular',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
        fontFamily: 'Roboto-Bold',
    },
    subHeading: {
        fontSize: 18,
        color: '#FFF',
        marginBottom: 20,
        fontFamily: 'Roboto-Regular',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    statusAccepted: {
        backgroundColor: '#4CD964',
    },
    statusRejected: {
        backgroundColor: '#FF3B30',
    },
    statusPending: {
        backgroundColor: '#FF9500',
    },
    statusText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'Roboto-Bold',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
        fontFamily: 'Roboto-Bold',
        textAlign:'center',
        textTransform:'uppercase'

    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#007AFF',
        fontFamily: 'Roboto-Bold',
    },
    infoItem: {
        marginBottom: 5,
        fontFamily: 'Roboto-Regular',
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: 'Roboto-Bold',
    },
    documentLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    documentLinkText: {
        marginLeft: 10,
        color: '#007AFF',
        textDecorationLine: 'underline',
        fontFamily: 'Roboto-Regular',
    },
    documentLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    documentLinkText: {
        marginLeft: 10,
        color: '#007AFF',
        textDecorationLine: 'underline',
        fontFamily: 'Roboto-Regular',
    },
    documentMissingText: {
        marginLeft: 10,
        fontFamily: 'Roboto-Regular',
    },
    redText: {
        color: '#FF3B30',
        fontFamily: 'Roboto-Bold',
    },

    documentLink: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      documentLinkText: {
        marginLeft: 10,
        color: '#007AFF',
        textDecorationLine: 'underline',
        fontFamily: 'Roboto-Regular',
      },
});


export default MoreDetails;