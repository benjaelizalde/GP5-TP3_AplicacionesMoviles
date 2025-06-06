import RecipeCard from '@/components/RecipeCard';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme, mode } = useTheme();

  const placeholderColor = mode === 'dark' ? '#bbb' : '#888';

  const handleSearch = () => {
    Keyboard.dismiss();
    searchRecipes(query);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        placeholder="Buscar receta o ingrediente..."
        placeholderTextColor={placeholderColor}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '33' },
        ]}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} color={theme.text} />
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
              <Text style={[styles.emptyText, { color: theme.text }]}>No se encontraron recetas.</Text>
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
  },
  input: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
  },
});