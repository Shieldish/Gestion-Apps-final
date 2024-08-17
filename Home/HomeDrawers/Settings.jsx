import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated, Alert, StatusBar ,ActivityIndicator} from 'react-native';
import CheckBox from 'react-native-check-box';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome5';

const ProfileEditScreen = () => {
  const [userData, setUserData] = useState({
    NOM: '',
    PRENOM: '',
    EMAIL: '',
    DEPARTEMENT: '',
    ADDRESS: '',
    DATE: new Date(),
    UUID: '',
    PASSWORD: '',
    PASSWORD2: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        const data = JSON.parse(storedUserData);
        const id = data.userData.UUID;

        if (data && id) {
          // Fetch detailed user data from the backend
          console.log(id);
          const response = await axios.get(`${process.env.BACKEND_URL}/settings/expo/${id}`);

          if (response.data.success) {
            const userDetails = response.data.data;
            userDetails.DATE = userDetails.DATE ? new Date(userDetails.DATE) : new Date();
            setUserData({ ...userDetails, PASSWORD: '', PASSWORD2: '' });
          } else {
            console.error('Échec du chargement des détails de l\'utilisateur:', response.data.message);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Échec du chargement des données utilisateur :', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
  };


  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateForm = () => {
    let valid = true;
    let errors = {};

    // Check for empty required fields
    const requiredFields = ['NOM', 'PRENOM', 'DEPARTEMENT', 'ADDRESS', 'DATE','PASSWORD','PASSWORD2'];
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors[field] = `${field} est requis`;
        valid = false;
      }
    });

    // Check password validation
    if (userData.PASSWORD && userData.PASSWORD2) {
      if (userData.PASSWORD !== userData.PASSWORD2) {
        errors.PASSWORD2 = 'Les mots de passe ne correspondent pas';
        valid = false;
      }
      if (userData.PASSWORD.length < 8 || userData.PASSWORD2.length < 8) {
        errors.PASSWORD = 'le mot de passe doit contenir au moins 8 caractères';
        valid = false;
      }
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !isCheckboxChecked) {
      if (!isCheckboxChecked) {
        setErrors(prevErrors => ({ ...prevErrors, checkbox: 'Vous devez accepter les termes et conditions' }));
      }
      return;
    }

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/settings/updateUserData2`, userData);

      if (response.data.success) {
        // Handle success (e.g., show a success message, navigate to another screen)
        console.log('Profile updated successfully');
        Alert.alert('Succès', 'Profil mis à jour avec succès');
      } else {
        // Handle error
        Alert.alert('Erreur', 'Échec de la mise à jour du profil');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour du profil');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || userData.DATE;
    setShowDatePicker(Platform.OS === 'ios');
    setUserData({ ...userData, DATE: currentDate });
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
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      <ScrollView>
        <View style={styles.header}>
          <Icon name="user-cog" size={40} color="#4A90E2" />
          <Text style={styles.title}>Modifier le profil</Text>
        </View>

        <View style={styles.formContainer}>
          {/* ID and Email (read-only) */}
          <View style={styles.inputContainer}>
            <Icon name="id-card" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.UUID}
              editable={false}
              placeholder="ID"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon name="envelope" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.EMAIL}
              editable={false}
              placeholder="Email"
              placeholderTextColor="#999"
            />
          </View>

          {/* Name and Last Name */}
          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.NOM}
              onChangeText={(value) => handleInputChange('NOM', value)}
              placeholder="Name"
              placeholderTextColor="#999"
            />
          </View>
          {errors.NOM && <Text style={styles.error}>{errors.NOM}</Text>}

          <View style={styles.inputContainer}>
            <Icon name="user" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.PRENOM}
              onChangeText={(value) => handleInputChange('PRENOM', value)}
              placeholder="Last Name"
              placeholderTextColor="#999"
            />
          </View>
          {errors.PRENOM && <Text style={styles.error}>{errors.PRENOM}</Text>}

          {/* Department and Address */}
          <View style={styles.inputContainer}>
            <Icon name="building" size={20} color="#4A90E2" style={styles.icon} />
            <Picker
              selectedValue={userData.DEPARTEMENT}
              style={styles.picker}
              onValueChange={(value) => handleInputChange('DEPARTEMENT', value)}
            >
              <Picker.Item label="Select Department" value="" />
              <Picker.Item label="Department 1" value="department1" />
              <Picker.Item label="Department 2" value="department2" />
            </Picker>
          </View>
          {errors.DEPARTEMENT && <Text style={styles.error}>{errors.DEPARTEMENT}</Text>}

          <View style={styles.inputContainer}>
            <Icon name="map-marker-alt" size={20} color="#4A90E2" style={styles.icon} />
            <Picker
              selectedValue={userData.ADDRESS}
              style={styles.picker}
              onValueChange={(value) => handleInputChange('ADDRESS', value)}
            >
              <Picker.Item label="Select a town" value="" />
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
  <Picker.Item label="Tataouine, Tunisie" value="Tataouine, Tunisie" />{/* ... (keep your existing Picker.Item elements) */}
            </Picker>
          </View>
          {errors.ADDRESS && <Text style={styles.error}>{errors.ADDRESS}</Text>}

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Icon name="calendar-alt" size={20} color="#4A90E2" style={styles.icon} />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.dateText}>
                {userData.DATE ? userData.DATE.toLocaleDateString() : 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={userData.DATE || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          {errors.DATE && <Text style={styles.error}>{errors.DATE}</Text>}

          {/* Password Fields */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              value={userData.PASSWORD}
              onChangeText={(value) => handleInputChange('PASSWORD', value)}
              placeholder="New Password"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          {errors.PASSWORD && <Text style={styles.error}>{errors.PASSWORD}</Text>}

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword2}
              value={userData.PASSWORD2}
              onChangeText={(value) => handleInputChange('PASSWORD2', value)}
              placeholder="Repeat New Password"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)} style={styles.eyeIcon}>
              <Icon name={showPassword2 ? 'eye' : 'eye-slash'} size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          {errors.PASSWORD2 && <Text style={styles.error}>{errors.PASSWORD2}</Text>}

          {/* Terms and Conditions Checkbox */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              isChecked={isCheckboxChecked}
              onClick={() => setIsCheckboxChecked(!isCheckboxChecked)}
              checkBoxColor="#4A90E2"
            />
            <Text style={styles.checkboxLabel}>J'accepte les termes et conditions</Text>
          </View>
          {errors.checkbox && <Text style={styles.error}>{errors.checkbox}</Text>}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Mettre à jour le profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  picker: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  datePickerButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  dateText: {
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    color: '#333',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileEditScreen;