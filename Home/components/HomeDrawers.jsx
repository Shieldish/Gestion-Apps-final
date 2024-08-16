import React, { useRef, useCallback } from 'react';
import { View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import DrawerNavigator from './DrawerNavigator';
import LogoutBottomSheet from '../HomeDrawers/Deconnexion';

const HomePage = () => {
  const logoutBottomSheetRef = useRef(null);

  const handleLogoutPress = useCallback(() => {
    if (logoutBottomSheetRef.current) {
      logoutBottomSheetRef.current.present();
    }
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <DrawerNavigator handleLogoutPress={handleLogoutPress} />
        <LogoutBottomSheet ref={logoutBottomSheetRef} />
      </View>
    </BottomSheetModalProvider>
  );
};

export default HomePage;