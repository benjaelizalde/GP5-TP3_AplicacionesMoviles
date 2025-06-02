import RecipeCard from '@/components/RecipeCard';
import { AppContext } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';

export default function FavoritesScreen() {
  const { favorites } = useContext(AppContext);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>No hay recetas favoritas aún.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe/${item.idMeal}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
});
