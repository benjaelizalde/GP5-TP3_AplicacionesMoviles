import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const stored = await AsyncStorage.getItem('FAVORITES');
      if (stored) setFavorites(JSON.parse(stored));
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('FAVORITES', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (recipe) => {
    setFavorites((prevFavorites) => {
        const exists = prevFavorites.some((r) => r.idMeal === recipe.idMeal);
        if (exists) {
        return prevFavorites.filter((r) => r.idMeal !== recipe.idMeal);
        } else {
        return [...prevFavorites, recipe];
        }
    });
    };


  const isFavorite = (idMeal) => {
    return favorites.some((r) => r.idMeal === idMeal);
  };

  return (
    <AppContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </AppContext.Provider>
  );
};
