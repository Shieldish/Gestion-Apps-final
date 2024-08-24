import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { RadioButton, Checkbox } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApplicationForm = ({ route, navigation }) => {
  const { stage } = route.params;
 

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    adresse: '',
    telephone: '',
    email: '',
    niveau_etudes: '',
    institution: '',
    domaine_etudes: '',
    section: '',
    annee_obtention: '',
    experience: '',
    experience_description: '',
    motivation: '',
    langues: '',
    logiciels: '',
    competences_autres: '',
    date_debut: '',
    duree_stage: '',
    cv: null,
    lettre_motivation: null,
    releves_notes: null,
    termsAccepted: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailInUse, setEmailInUse] = useState(false); 
  const [submitting, setSubmitting] = useState(false);


  const checkEmailInUse = async (email) => {
    if (!email) return;
  
    try {
      const stageId =stage  // stage.id; // Assuming you have stage.id available from route.params
      const url =`${process.env.BACKEND_URL}/etudiant/check-email?email=${email}&stageId=${stageId}`;
    
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
  
      if (data.exists) {
        setEmailInUse(true);
        setErrors((prevErrors) => ({ ...prevErrors, email: ' this email is already used to apply for this stage.' }));
      } else {
        setEmailInUse(false);
        setErrors((prevErrors) => ({ ...prevErrors, email: null }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setErrors((prevErrors) => ({ ...prevErrors, email: 'Erreur lors de la vérification de l\'email.' }));
    }
  };
  


  const handleEmailBlur = () => {
    checkEmailInUse(formData.email);
  };

  const handleSubmit = async () => {
    // Disable the button and show loading message
    setSubmitting(true);

    // Check if terms are accepted
    if (!formData.termsAccepted) {
      Alert.alert('Erreur', 'Vous devez accepter les termes avant de soumettre.');
      setSubmitting(false);
      return;
    }

    // Validate the form data
    if (!validateForm()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      setSubmitting(false);
      return;
    }

    // Validate that all required files are selected
    if (!formData.cv) {
      Alert.alert('Erreur', 'Vous devez télécharger le fichier requis (CV).');
      setSubmitting(false);
      return;
    }
    try {
      await checkEmailInUse(formData.email);
      
      // After checkEmailInUse completes, check the errors state
      const emailError = errors.email;
      if (emailError) {
        Alert.alert('Erreur', emailError);
        setSubmitting(false);
        return;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification de l\'email.');
      setSubmitting(false);
      return;
    }
  
    // Construct the form data for the API call
    const formDataToSend = new FormData();
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prenom', formData.prenom);
    formDataToSend.append('date_naissance', formData.date_naissance);
    formDataToSend.append('adresse', formData.adresse);
    formDataToSend.append('telephone', formData.telephone);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('niveau_etudes', formData.niveau_etudes);
    formDataToSend.append('institution', formData.institution);
    formDataToSend.append('domaine_etudes', formData.domaine_etudes);
    formDataToSend.append('section', formData.section);
    formDataToSend.append('annee_obtention', formData.annee_obtention);
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('experience_description', formData.experience_description);
    formDataToSend.append('motivation', formData.motivation);
    formDataToSend.append('langues', formData.langues);
    formDataToSend.append('logiciels', formData.logiciels);
    formDataToSend.append('competences_autres', formData.competences_autres);
    formDataToSend.append('date_debut', formData.date_debut);
    formDataToSend.append('duree_stage', formData.duree_stage);

    const generateUniqueFileName = (originalName) => {
      // Extract file extension
      const fileExtension = originalName.split('.').pop();
      // Generate timestamp
      const timestamp = Date.now();
      // Return new file name with timestamp and extension
      return `${timestamp}.${fileExtension}`;
    };
  
    // Append files to formData with renamed file names
    if (formData.cv) {
      formDataToSend.append('cv', {
        uri: formData.cv.uri,
        name: generateUniqueFileName(formData.cv.name), // Rename file
        type: formData.cv.type,
      });
    }
    if (formData.lettre_motivation) {
      formDataToSend.append('lettre_motivation', {
        uri: formData.lettre_motivation.uri,
        name: generateUniqueFileName(formData.lettre_motivation.name), // Rename file
        type: formData.lettre_motivation.type,
      });
    }
    if (formData.releves_notes) {
      formDataToSend.append('releves_notes', {
        uri: formData.releves_notes.uri,
        name: generateUniqueFileName(formData.releves_notes.name), // Rename file
        type: formData.releves_notes.type,
      });
    }
  

    try {
      const id = stage;
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(`${process.env.BACKEND_URL}/etudiant/postulates/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
             'Authorization': `Bearer ${token}`
        },
      });

      console.log('Form submitted successfully:',);
      Alert.alert('Formulaire soumis', 'Votre candidature a été soumise avec succès.', [
        { text: 'OK', onPress: () => navigateToAnotherComponent() }
      ]);
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Une erreur est survenue lors de la soumission du formulaire.';
      if (error.response) {
        errorMessage += ` Statut: ${error.response.status}. ${error.response.data.message || ''}`;
      } else if (error.request) {
        errorMessage += ' La requête a été faite mais aucune réponse n\'a été reçue.';
      } else {
        errorMessage += ` Détails: ${error.message}`;
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      // Enable the button again after submission completes (success or error)
      setSubmitting(false);
    }
  };
  const navigations = useNavigation(); // Hook to get navigation
  const navigateToAnotherComponent = () => {
    // Navigate to another component after successful submission
    // Example navigation logic, adjust as per your navigation setup (e.g., React Navigation)
    navigation.navigate('HomeTabs', { screen: 'StagesPostuler' });
  };



  const handleDateInputChange = (field, value) => {
    const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
    if (datePattern.test(value)) {
      setErrors({ ...errors, [field]: null });
      setFormData({ ...formData, [field]: value });
    } else {
      setErrors({ ...errors, [field]: 'Date must be in dd/mm/yyyy format' });
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'set') {
      const currentDate = selectedDate || new Date();
      setShowDatePicker(false);

      const formattedDate = currentDate.toLocaleDateString('fr-FR');
      setFormData({ ...formData, date_naissance: formattedDate });
      setErrors({ ...errors, date_naissance: null });
    } else {
      setShowDatePicker(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  useEffect(() => {
   // console.log('Updated formData:', formData);
  }, [formData]);
  
   const handleFilePicker = async (fileType) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: false,
        allowMultiSelection: false,
      });
      const file = res.assets[0];
    //  console.log(fileType, file);
      if (file) {
        setFormData(prevState => ({
          ...prevState,
          [fileType]: {
            name: file.name,
            uri: file.uri,
            type: file.mimeType // Add this line to include the file type
          }
        }));
        
      }
      
    } catch (err) {
      console.log('Error picking document:', err);
    }
  }; 

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
      isValid = false;
    }
    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis';
      isValid = false;
    }
    if (!formData.date_naissance) {
      newErrors.date_naissance = 'La date de naissance est requise';
      isValid = false;
    }
    if (!formData.adresse) {
      newErrors.adresse = "L'adresse est requise";
      isValid = false;
    }
    if (!formData.telephone) {
      newErrors.telephone = 'Le numéro de téléphone est requis';
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = "L'email est requis";
      isValid = false;
    }
    if (!formData.niveau_etudes) {
      newErrors.niveau_etudes = "Le niveau d'études est requis";
      isValid = false;
    }
    if (!formData.institution) {
      newErrors.institution = "L'institution est requise";
      isValid = false;
    }
    if (!formData.domaine_etudes) {
      newErrors.domaine_etudes = "Le domaine d'études est requis";
      isValid = false;
    }
    if (!formData.section) {
      newErrors.section = 'La section est requise';
      isValid = false;
    }
    if (!formData.annee_obtention) {
      newErrors.annee_obtention = "L'année d'obtention est requise";
      isValid = false;
    }
    if (!formData.experience) {
      newErrors.experience = 'Veuillez indiquer si vous avez de l\'expérience';
      isValid = false;
    }
    if (!formData.motivation) {
      newErrors.motivation = 'La motivation est requise';
      isValid = false;
    }
    if (!formData.langues) {
      newErrors.langues = 'Les langues sont requises';
      isValid = false;
    }
    if (!formData.cv) {
      newErrors.cv = 'Le CV est requis';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  return (
    <SafeAreaView style={{ flex: 1 , paddingBottom:30 }}>
      <ScrollView style={styles.container}>
        {/* Your form sections and inputs */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={formData.nom}
            onChangeText={(value) => handleInputChange('nom', value)}
          />
          {errors.nom && <Text style={styles.errorText}>{errors.nom}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={formData.prenom}
            onChangeText={(value) => handleInputChange('prenom', value)}
          />
          {errors.prenom && <Text style={styles.errorText}>{errors.prenom}</Text>}
          
          <View style={styles.inputContainer}>
            <MaterialIcons name="date-range" size={24} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Date de naissance (dd/mm/yyyy)"
              value={formData.date_naissance}
              onFocus={() => setShowDatePicker(true)}
              onChangeText={(value) => handleDateInputChange('date_naissance', value)}
              keyboardType="numeric"
            />
          </View>
          {errors.date_naissance && <Text style={styles.errorText}>{errors.date_naissance}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={formData.date_naissance ? new Date(formData.date_naissance.split('/').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* <TextInput
            style={styles.input}
            placeholder="Adresse"
            value={formData.adresse}
            onChangeText={(value) => handleInputChange('adresse', value)}
          /> */}

<Picker
  selectedValue={formData.adresse}
  style={styles.picker}
  onValueChange={(value) => handleInputChange('adresse', value)}
>
  <Picker.Item label="Veuillez sélectionner votre adresse" value="" />
  <Picker.Item label="Tunis, Tunisie" value="Tunis, Tunisie" />
  <Picker.Item label="Ariana, Tunisie" value="Ariana, Tunisie" />
  <Picker.Item label="Ben Arous, Tunisie" value="Ben Arous, Tunisie" />
  <Picker.Item label="Manouba, Tunisie" value="Manouba, Tunisie" />
  <Picker.Item label="Nabeul, Tunisie" value="Nabeul, Tunisie" />
  <Picker.Item label="Zaghouan, Tunisie" value="Zaghouan, Tunisie" />
  <Picker.Item label="Bizerte, Tunisie" value="Bizerte, Tunisie" />
  <Picker.Item label="Béja, Tunisie" value="Béja, Tunisie" />
  <Picker.Item label="Jendouba, Tunisie" value="Jendouba, Tunisie" />
  <Picker.Item label="Kef, Tunisie" value="Kef, Tunisie" />
  <Picker.Item label="Siliana, Tunisie" value="Siliana, Tunisie" />
  <Picker.Item label="Kairouan, Tunisie" value="Kairouan, Tunisie" />
  <Picker.Item label="Kasserine, Tunisie" value="Kasserine, Tunisie" />
  <Picker.Item label="Sidi Bouzid, Tunisie" value="Sidi Bouzid, Tunisie" />
  <Picker.Item label="Sousse, Tunisie" value="Sousse, Tunisie" />
  <Picker.Item label="Monastir, Tunisie" value="Monastir, Tunisie" />
  <Picker.Item label="Mahdia, Tunisie" value="Mahdia, Tunisie" />
  <Picker.Item label="Sfax, Tunisie" value="Sfax, Tunisie" />
  <Picker.Item label="Gafsa, Tunisie" value="Gafsa, Tunisie" />
  <Picker.Item label="Tozeur, Tunisie" value="Tozeur, Tunisie" />
  <Picker.Item label="Kebili, Tunisie" value="Kebili, Tunisie" />
  <Picker.Item label="Gabès, Tunisie" value="Gabès, Tunisie" />
  <Picker.Item label="Medenine, Tunisie" value="Medenine, Tunisie" />
  <Picker.Item label="Tataouine, Tunisie" value="Tataouine, Tunisie" />
</Picker>

          {errors.adresse && <Text style={styles.errorText}>{errors.adresse}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            value={formData.telephone}
            onChangeText={(value) => handleInputChange('telephone', value)}
            keyboardType="phone-pad"
          />
          {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Adresse email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            onBlur={handleEmailBlur}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>} 
        </View>

    
        <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Formation</Text>
        <Picker
          selectedValue={formData.niveau_etudes}
          onValueChange={(value) => handleInputChange('niveau_etudes', value)}
          style={styles.picker}
        >
          <Picker.Item label="Sélectionner un niveau" value="" />
          <Picker.Item label="Baccalauréat" value="Baccalauréat" />
          <Picker.Item label="Licence" value="Licence" />
          <Picker.Item label="Master" value="Master" />
          <Picker.Item label="Ingénieur" value="Ingénieur" />
          <Picker.Item label="Doctorat" value="Doctorat" />
        </Picker>
        {errors.niveau_etudes && <Text style={styles.errorText}>{errors.niveau_etudes}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Institution/Université"
          value={formData.institution}
          onChangeText={(value) => handleInputChange('institution', value)}
        />
        {errors.institution && <Text style={styles.errorText}>{errors.institution}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Domaine d'études"
          value={formData.domaine_etudes}
          onChangeText={(value) => handleInputChange('domaine_etudes', value)}
        />
        {errors.domaine_etudes && <Text style={styles.errorText}>{errors.domaine_etudes}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Section"
          value={formData.section}
          onChangeText={(value) => handleInputChange('section', value)}
        />
        {errors.section && <Text style={styles.errorText}>{errors.section}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Année d'obtention du diplôme (prévue)"
          value={formData.annee_obtention}
          onChangeText={(value) => handleInputChange('annee_obtention', value)}
        />
        {errors.annee_obtention && <Text style={styles.errorText}>{errors.annee_obtention}</Text>}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Expérience pertinente</Text>
        <RadioButton.Group
          onValueChange={(value) => handleInputChange('experience', value)}
          value={formData.experience}
        >
          <View style={styles.radioGroup}>
            <RadioButton value="oui" />
            <Text>Oui</Text>
            <RadioButton value="non" />
            <Text>Non</Text>
          </View>
        </RadioButton.Group>
        {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
        {formData.experience === 'oui' && (
          <TextInput
            style={styles.textArea}
            placeholder="Décrivez brièvement votre expérience"
            value={formData.experience_description}
            onChangeText={(value) => handleInputChange('experience_description', value)}
            multiline
          />
        )}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Motivation pour ce stage</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Quelles sont vos motivations pour postuler à ce stage ?"
          value={formData.motivation}
          onChangeText={(value) => handleInputChange('motivation', value)}
          multiline
        />
        {errors.motivation && <Text style={styles.errorText}>{errors.motivation}</Text>}
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Compétences</Text>
        <TextInput
          style={styles.input}
          placeholder="Langues parlées/écrites"
          value={formData.langues}
          onChangeText={(value) => handleInputChange('langues', value)}
        />
        {errors.langues && <Text style={styles.errorText}>{errors.langues}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Logiciels/Outils maîtrisés"
          value={formData.logiciels}
          onChangeText={(value) => handleInputChange('logiciels', value)}
        />
        <TextInput
          style={styles.textArea}
          placeholder="Autres compétences pertinentes"
          value={formData.competences_autres}
          onChangeText={(value) => handleInputChange('competences_autres', value)}
          multiline
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Disponibilité</Text>
        <TextInput
          style={styles.input}
          placeholder="Date de début souhaitée"
          value={formData.date_debut}
          onChangeText={(value) => handleInputChange('date_debut', value)}
          inputMode="start"
        /> 
 
 {/* <View style={styles.inputContainer}>
            <MaterialIcons name="date-range" size={24} color="black" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Date de début souhaitée (dd/mm/yyyy)"
              value={formData.date_naissance}
              onFocus={() => setShowDatePicker(true)}
              onChangeText={(value) => handleDateInputChange('date_debut', value)}
             
            />
          </View>
          {errors.date_debut && <Text style={styles.errorText}>{errors.date_debut}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={formData.date_debut ? new Date(formData.date_debut.split('/').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

 */}



        <Picker
          selectedValue={formData.duree_stage}
          onValueChange={(value) => handleInputChange('duree_stage', value)}
          style={styles.picker}
        >
          <Picker.Item label="Sélectionner la durée" value="" />
          <Picker.Item label="1 mois" value="1 mois" />
          <Picker.Item label="2 mois" value="2 mois" />
          <Picker.Item label="3 mois" value="3 mois" />
          <Picker.Item label="Plus de 3 mois" value="Plus de 3 mois" />
        </Picker>
      </View>


        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <TouchableOpacity style={styles.filePickerButton} onPress={() => handleFilePicker('cv')}>
            <Text style={styles.filePickerButtonText}>
              {formData.cv ? formData.cv.name : 'Ajouter votre CV (obligatoire)'}
            </Text>
          </TouchableOpacity>
          {errors.cv && <Text style={styles.errorText}>{errors.cv}</Text>}

          <TouchableOpacity style={styles.filePickerButton} onPress={() => handleFilePicker('lettre_motivation')}>
            <Text style={styles.filePickerButtonText}>
              {formData.lettre_motivation ? formData.lettre_motivation.name : 'Ajouter une lettre de motivation (optionel)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filePickerButton} onPress={() => handleFilePicker('releves_notes')}>
            <Text style={styles.filePickerButtonText}>
              {formData.releves_notes ? formData.releves_notes.name : 'Ajouter votre dernier relevés de notes (optionel)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Conditions générales</Text>
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={formData.termsAccepted ? 'checked' : 'unchecked'}
              onPress={() => setFormData({ ...formData, termsAccepted: !formData.termsAccepted })}
            />
            <Text style={styles.checkboxLabel}>
              J'accepte les termes et conditions,
              En soumettant ce formulaire, j'atteste que les informations fournies sont exactes et complètes
              NB : Après soumission il n'est plus possible de modifier !
            </Text>
          </View>
        </View>

        <TouchableOpacity
        style={submitting ? styles.submitButtonDisabled : styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitButtonText}>{submitting ? 'En cours d\'envoi...' : 'Soumettre'}</Text>
      </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
   
    backgroundColor: '#fff',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign:'center'
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',  // This ensures text starts from the top in Android
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  filePickerButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  filePickerButtonText: {
    color: '#007bff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 30,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    backgroundColor: 'lightgray',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0', // Light grey background
    borderColor: '#ccc',         // Light grey border
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,           // Add padding at the bottom
    color: '#333',               // Dark grey text color
  },    // Dark grey text color
});

export default ApplicationForm;
