import RecipeCard from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/useRecipes';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
} from 'react-native';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const { recipes, loading, searchRecipes } = useRecipes();
  const router = useRouter();

  const handleSearch = () => {
    Keyboard.dismiss();
    searchRecipes(query);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Buscar receta o ingrediente..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => router.push(`/recipe/${item.idMeal}`)}
            />
          )}
          ListEmptyComponent={
            recipes.length === 0 && query !== '' && !loading ? (
              <Text style={styles.emptyText}>No se encontraron recetas.</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
  },
});
