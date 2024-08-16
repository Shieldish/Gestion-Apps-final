// FavoritesContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    loadFavoritesCount();
  }, []);

  const loadFavoritesCount = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favoriteJobs');
      if (savedFavorites !== null) {
        const favoriteIds = JSON.parse(savedFavorites);
        setFavoritesCount(favoriteIds.length);
      }
    } catch (error) {
      console.error('Error loading favorites count:', error);
    }
  };

  const updateFavoritesCount = (count) => {
    setFavoritesCount(count);
  };

  return (
    <FavoritesContext.Provider value={{ favoritesCount, updateFavoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);