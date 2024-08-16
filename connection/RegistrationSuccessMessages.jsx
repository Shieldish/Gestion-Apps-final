import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BACKEND_URL } from '@env';

const RegistrationSuccessMessages = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { nom, email } = route.params;

  const [flashMessage, setFlashMessage] = useState('');
  const [flashMessageType, setFlashMessageType] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    setFlashMessage(''); // Efface les messages précédents

    try {
      const response = await fetch(`${BACKEND_URL}/connection/resendmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ NOM: nom, EMAIL: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setFlashMessage(data.message);
        setFlashMessageType('success');
      } else {
        setFlashMessage(data.message);
        setFlashMessageType('error');
      }
    } catch (error) {
      console.error('Échec de l\'envoi de l\'email :', error);
      setFlashMessage('Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer plus tard.');
      setFlashMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Validation de l'Email</Text>
        <Text style={styles.paragraph}>Merci <Text style={styles.strong}>{nom}</Text> pour votre inscription.</Text>
        <Text style={styles.paragraph}>
          Un email contenant un lien de validation a été envoyé à <Text style={styles.email}>{email}</Text>.
          Veuillez ouvrir votre boîte de réception et cliquer sur le lien de validation pour continuer votre inscription.
        </Text>
        <Text style={styles.paragraph}>
          Si vous n'avez pas reçu d'email, veuillez vérifier votre dossier de spam, ou cliquer sur le bouton "Renvoyer l'email de validation" ci-dessous pour le recevoir à nouveau.
        </Text>

        {flashMessage ? (
          <View style={[styles.flashMessage, flashMessageType === 'success' ? styles.success : styles.error]}>
            <Text>{flashMessage}</Text>
          </View>
        ) : null}

        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Connexion</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resendButton, isResending ? styles.buttonDisabled : null]}
            onPress={handleResend}
            disabled={isResending}
          >
            <Text style={styles.buttonText}>{isResending ? 'Renvoi en cours...' : 'Renvoyer l\'email de validation'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  contentWrapper: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 20,
    elevation: 5,
    maxWidth: 500,
    width: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007bff',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  strong: {
    fontWeight: 'bold',
    color: 'green',
  },
  email: {
    fontWeight: 'bold',
    color: 'green',
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#4A90E2',
    color: '#333',
  },
  resendButton: {
    backgroundColor: '#F5A623',
    color: 'white',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  flashMessage: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 4,
    textAlign: 'center',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
});

export default RegistrationSuccessMessages;
