


import React, { useCallback, useMemo, forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../Services/authService'; // Adjust the import path as needed

const LogoutBottomSheet = forwardRef((props, ref) => {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ['25%'], []);
  const [isLoading, setIsLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
  }));

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    await logout(navigation);
    setIsLoading(false);
    handleCloseModal();
  }, [navigation]);

  const renderBackdrop = useCallback(
    props => <BottomSheetBackdrop {...props} pressBehavior="close" />,
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Voulez-vous- déconnecter ?</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleCloseModal} style={styles.button}>
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={[styles.button, styles.logoutButton]}>
            {isLoading ? (
              <ActivityIndicator color="#4A90E2"/>
            ) : (
              <Text style={[styles.buttonText, styles.logoutButtonText]}>Déconnecter</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 15,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#007bff',
  },
  logoutButton: {
    backgroundColor: '#007bff',
  },
  logoutButtonText: {
    color: '#fff',
  },
});

export default LogoutBottomSheet;
