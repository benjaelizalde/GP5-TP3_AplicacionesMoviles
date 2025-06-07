import { supabase } from '@/constants/supabaseClient';
import { createContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('favorites')
          .select('recipe_id, recipe_data')
          .eq('user_id', user.id);
        setFavorites(data ? data.map(f => f.recipe_data) : []);
      } else {
        setFavorites([]);
      }
    };
    loadFavorites();
  }, [user]);

  const toggleFavorite = async (recipe) => {
    if (!user?.id) return;
    const exists = favorites.some((r) => r.idMeal === recipe.idMeal);
    if (exists) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.idMeal);
      setFavorites((prev) => prev.filter((r) => r.idMeal !== recipe.idMeal));
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: user.id, recipe_id: recipe.idMeal, recipe_data: recipe }]);
      setFavorites((prev) => [...prev, recipe]);
    }
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