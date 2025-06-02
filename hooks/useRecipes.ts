import { BASE_URL } from '@/constants/api';
import axios from 'axios';
import { useState } from 'react';

export function useRecipes() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipeDetail, setRecipeDetail] = useState<any>(null);

  const searchRecipes = async (query: string) => {
    if (!query) return;
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/search.php?s=${query}`);
      setRecipes(res.data.meals || []);
    } catch (error) {
      console.error('Error al buscar recetas:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/lookup.php?i=${id}`);
      setRecipeDetail(res.data.meals?.[0] || null);
    } catch (error) {
      console.error('Error al obtener el detalle:', error);
      setRecipeDetail(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    recipes,
    recipeDetail,
    loading,
    searchRecipes,
    fetchRecipeDetail,
  };
}
