import FavoriteButton from '@/components/FavoriteButton';
import { AppContext } from '@/context/AppContext';
import { useRecipes } from '@/hooks/useRecipes';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useContext, useEffect, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text
} from 'react-native';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const { toggleFavorite, isFavorite, favorites } = useContext(AppContext);
  const { fetchRecipeDetail, recipeDetail, loading } = useRecipes();
  const navigation = useNavigation();
  
  useEffect(() => {
    if (id) {
      fetchRecipeDetail(id as string);
    }
  }, [id]);

  const isFav = recipeDetail ? isFavorite(recipeDetail.idMeal) : false;

  useLayoutEffect(() => {
    if (recipeDetail) {
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


  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" />;
  if (!recipeDetail) return <Text style={styles.error}>Receta no encontrada</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 0 }}>
        <Image source={{ uri: recipeDetail.strMealThumb }} style={styles.image} />
        <Text style={styles.subtitle}>Categoría: {recipeDetail.strCategoryES ?? recipeDetail.strCategory}</Text>
        <Text style={styles.subtitle}>Área: {recipeDetail.strAreaES ?? recipeDetail.strArea}</Text>

        <Text style={styles.section}>Ingredientes:</Text>
        {Array.from({ length: 20 }).map((_, i) => {
          const ingredient = recipeDetail[`strIngredient${i + 1}`];
          const measure = recipeDetail[`strMeasure${i + 1}`];
          if (ingredient && ingredient.trim() !== '') {
            return (
              <Text key={i} style={styles.ingredient}>
                • {ingredient} - {measure}
              </Text>
            );
          }
          return null;
        })}

        <Text style={styles.section}>Instrucciones:</Text>
        <Text style={styles.instructions}>{recipeDetail.strInstructionsES ?? recipeDetail.strInstructions}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    color: 'red',
  },
});
