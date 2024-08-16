import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '@env';



const ForgotPasswordModal = ({ visible, onClose = () => {} }) => {
  const navigation = useNavigation();
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);


  useEffect(() => {
    if (!visible) {
      setResetEmail('');
      setMessage('');
      setIsError(false);
    }
  }, [visible]);

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setMessage('Veuillez entrer votre adresse e-mail');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${BACKEND_URL}/connection/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Un lien de réinitialisation a été envoyé à ${resetEmail}`);
        setIsError(false);
      } else {
        setMessage(data.error || 'Une erreur est survenue. Veuillez réessayer.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Mot de passe oublié</Text>
          <TouchableOpacity  onPress={() => navigation.navigate('Login')} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre adresse e-mail"
              value={resetEmail}
              onChangeText={(text) => {
                setResetEmail(text);
                setMessage('');
                setIsError(false);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {message ? (
              <Text style={[styles.message, isError ? styles.errorMessage : styles.successMessage]}>
                {message}
              </Text>
            ) : null}

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={[styles.button, styles.secondaryButton]}
                accessibilityLabel="Aller à la connexion"
              >
                <Text style={styles.buttonText}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetPassword}
                style={[styles.button, styles.primaryButton]}
                accessibilityLabel="Réinitialiser le mot de passe"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Réinitialiser</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBody: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
  },
  errorMessage: {
    color: 'red',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  secondaryButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ForgotPasswordModal;