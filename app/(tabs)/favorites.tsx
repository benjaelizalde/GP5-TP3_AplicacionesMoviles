import RecipeListWithFilters from '@/components/RecipeListWithFilters';
import { AppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function FavoritesScreen() {
  const { favorites } = useContext(AppContext);
  const router = useRouter();
  const { theme } = useTheme();

  const [filtered, setFiltered] = useState(favorites);

  useEffect(() => {
    setFiltered(favorites);
  }, [favorites]);

  const fetchCategories = async () =>
    Array.from(new Set(favorites.map(r => r.strCategory).filter(Boolean)));

  const fetchAreas = async () =>
    Array.from(new Set(favorites.map(r => r.strArea).filter(Boolean)));

  const fetchIngredients = async () => {
    const all: string[] = [];
    favorites.forEach(r => {
      for (let i = 1; i <= 20; i++) {
        const ing = r[`strIngredient${i}`];
        if (ing && ing.trim()) all.push(ing.trim());
      }
    });
    return Array.from(new Set(all.filter(Boolean)));
  };

  const filterByCategory = async (category: string) => {
    setFiltered(favorites.filter(r => r.strCategory === category));
  };

  const filterByArea = async (area: string) => {
    setFiltered(favorites.filter(r => r.strArea === area));
  };

  const filterByIngredient = async (ingredient: string) => {
    setFiltered(
      favorites.filter(r =>
        Array.from({ length: 20 }, (_, i) => r[`strIngredient${i + 1}`])
          .map(ing => ing && ing.trim().toLowerCase())
          .includes(ingredient.trim().toLowerCase())
      )
    );
  };

  const allFavorites = (query: string) => {
    if (!query) setFiltered(favorites);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <RecipeListWithFilters
        recipes={filtered}
        loading={false}
        onRecipePress={item => router.push(`/recipe/${item.idMeal}`)}
        fetchCategories={fetchCategories}
        fetchAreas={fetchAreas}
        fetchIngredients={fetchIngredients}
        filterByCategory={filterByCategory}
        filterByArea={filterByArea}
        filterByIngredient={filterByIngredient}
        searchRecipes={allFavorites}
        showFilters={true}
        emptyText="No hay recetas favoritas aún."
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});