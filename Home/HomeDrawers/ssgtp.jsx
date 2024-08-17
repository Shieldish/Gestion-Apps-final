import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
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
          const response = await axios.get(`${process.env.BACKEND_URL}/settings/expo/${id}`);
          if (response.data.success) {
            const userDetails = response.data.data;
            userDetails.DATE = userDetails.DATE ? new Date(userDetails.DATE) : new Date();
            setUserData({ ...userDetails, PASSWORD: '', PASSWORD2: '' });
          } else {
            console.error('Failed to load user details:', response.data.message);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
  };

  const validateForm = () => {
    let valid = true;
    let errors = {};

    const requiredFields = ['NOM', 'PRENOM', 'DEPARTEMENT', 'ADDRESS', 'DATE', 'PASSWORD', 'PASSWORD2'];
    requiredFields.forEach(field => {
      if (!userData[field]) {
        errors[field] = `${field} is required`;
        valid = false;
      }
    });

    if (userData.PASSWORD && userData.PASSWORD2) {
      if (userData.PASSWORD !== userData.PASSWORD2) {
        errors.PASSWORD2 = 'Passwords do not match';
        valid = false;
      }
      if (userData.PASSWORD.length < 8 || userData.PASSWORD2.length < 8) {
        errors.PASSWORD = 'Password must be at least 8 characters';
        valid = false;
      }
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !isCheckboxChecked) {
      if (!isCheckboxChecked) {
        setErrors(prevErrors => ({ ...prevErrors, checkbox: 'You must agree to the terms and conditions' }));
      }
      return;
    }

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}/settings/updateUserData2`, userData);
      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the profile');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || userData.DATE;
    setShowDatePicker(false);
    setUserData({ ...userData, DATE: currentDate });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Editer Profiles</Text>

          {/* ID and Email (read-only) */}
          <View style={styles.formRow}>
            <Icon name="id-card" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.UUID}
              editable={false}
              placeholder="ID"
              placeholderTextColor="#888"
            />
          </View>
          <View style={styles.formRow}>
            <Icon name="envelope" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.EMAIL}
              editable={false}
              placeholder="Email"
              placeholderTextColor="#888"
            />
          </View>

          {/* Name and Last Name */}
          <View style={styles.formRow}>
            <Icon name="user" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.NOM}
              onChangeText={(value) => handleInputChange('NOM', value)}
              placeholder="Name"
              placeholderTextColor="#888"
            />
          </View>
          {errors.NOM && <Text style={styles.error}>{errors.NOM}</Text>}

          <View style={styles.formRow}>
            <Icon name="user" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={userData.PRENOM}
              onChangeText={(value) => handleInputChange('PRENOM', value)}
              placeholder="Last Name"
              placeholderTextColor="#888"
            />
          </View>
          {errors.PRENOM && <Text style={styles.error}>{errors.PRENOM}</Text>}

          {/* Department and Address */}
          <View style={styles.formRow}>
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

          <View style={styles.formRow}>
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
              {/* Add other locations as needed */}
            </Picker>
          </View>
          {errors.ADDRESS && <Text style={styles.error}>{errors.ADDRESS}</Text>}

          {/* Date of Birth */}
          <View style={styles.formRow}>
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
          <View style={styles.formRow}>
            <Icon name="lock" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              value={userData.PASSWORD}
              onChangeText={(value) => handleInputChange('PASSWORD', value)}
              placeholder="New Password"
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Icon name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          {errors.PASSWORD && <Text style={styles.error}>{errors.PASSWORD}</Text>}

          <View style={styles.formRow}>
            <Icon name="lock" size={20} color="#4A90E2" style={styles.icon} />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword2}
              value={userData.PASSWORD2}
              onChangeText={(value) => handleInputChange('PASSWORD2', value)}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)} style={styles.eyeIcon}>
              <Icon name={showPassword2 ? 'eye-slash' : 'eye'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          {errors.PASSWORD2 && <Text style={styles.error}>{errors.PASSWORD2}</Text>}

          {/* Checkbox */}
          <View style={styles.formRow}>
            <CheckBox
              style={styles.checkbox}
              onClick={() => setIsCheckboxChecked(!isCheckboxChecked)}
              isChecked={isCheckboxChecked}
              rightText="I agree to the terms and conditions"
            />
          </View>
          {errors.checkbox && <Text style={styles.error}>{errors.checkbox}</Text>}

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    padding: 16,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  picker: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
  error: {
    color: '#FF4D4F',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
    marginLeft: 30,
  },
  datePickerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  checkbox: {
    flex: 1,
    marginLeft: -8,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileEditScreen;
