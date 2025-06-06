import FavoriteButton from '@/components/FavoriteButton';
import IngredientList from '@/components/IngredientList';
import { AppContext } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useRecipes } from '@/hooks/useRecipes';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useContext, useEffect, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const { toggleFavorite, isFavorite, favorites } = useContext(AppContext);
  const { fetchRecipeDetail, recipeDetail, loading } = useRecipes();
  const navigation = useNavigation();
  const { theme } = useTheme();

  navigation.setOptions({
    headerShown: true,
    headerStyle: {
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
  });

  useEffect(() => {
    if (id) {
      fetchRecipeDetail(id as string);
    }
  }, [id]);

  const isFav = recipeDetail ? isFavorite(recipeDetail.idMeal) : false;

  useLayoutEffect(() => {
    if (recipeDetail){
      navigation.setOptions({
        title: recipeDetail.strMealES ?? recipeDetail.strMeal,
        headerRight: () => (
          <FavoriteButton
            isFavorite={isFav}
            onToggle={() => toggleFavorite(recipeDetail)}
          />
        ),
      });
    }
  }, [recipeDetail, favorites]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>
        <ActivityIndicator style={{ marginTop: 30 }} size="large" color={theme.text} />
      </SafeAreaView>
    );
  }
  if (!recipeDetail) return <Text style={[styles.error, { color: theme.text }]}>Receta no encontrada</Text>;
  
  const ingredientes = Array.from({ length: 20 })
    .map((_, i) => {
      const name = recipeDetail[`strIngredient${i + 1}`];
      const quantity = recipeDetail[`strMeasure${i + 1}`];
      if (name && name.trim() !== '') {
        return { name, quantity };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0 }}>
        <Image source={{ uri: recipeDetail.strMealThumb }} style={styles.image} />
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Categoría: {recipeDetail.strCategoryES ?? recipeDetail.strCategory}
        </Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Área: {recipeDetail.strAreaES ?? recipeDetail.strArea}
        </Text>

        <Text style={[styles.section, { color: theme.text }]}>Ingredientes:</Text>
        <IngredientList ingredients={ingredientes} />

        <Text style={[styles.section, { color: theme.text }]}>Instrucciones:</Text>
        <Text style={[styles.instructions, { color: theme.text }]}>
          {recipeDetail.strInstructionsES ?? recipeDetail.strInstructions}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 15,
    marginLeft: 10,
  },
  instructions: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },
  error: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 18,
  },
});