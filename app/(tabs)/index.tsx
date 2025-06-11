import RecipeListWithFilters from "@/components/RecipeListWithFilters";
import { useTheme } from "@/context/ThemeContext";
import { useRecipes } from "@/hooks/useRecipes";
import { useScrollToTop } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput
} from "react-native";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const {
    recipes,
    loading,
    fetchCategories,
    fetchAreas,
    fetchIngredients,
    filterByCategory,
    filterByArea,
    filterByIngredient,
    searchRecipes,
  } = useRecipes();
  const router = useRouter();
  const { theme, mode } = useTheme();
  const flatListRef = useRef(null);
  useScrollToTop(flatListRef);

  const placeholderColor = mode === "dark" ? "#bbb" : "#888";

  const handleSearch = () => {
    Keyboard.dismiss();
    searchRecipes(query);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TextInput
        placeholder="Buscar receta o ingrediente..."
        placeholderTextColor={placeholderColor}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            color: theme.text,
            borderColor: theme.text + "33",
          },
        ]}
      />
      <RecipeListWithFilters
        recipes={recipes}
        loading={loading}
        onRecipePress={(item) => router.push(`/recipe/${item.idMeal}`)}
        fetchCategories={fetchCategories}
        fetchAreas={fetchAreas}
        fetchIngredients={fetchIngredients}
        filterByCategory={filterByCategory}
        filterByArea={filterByArea}
        filterByIngredient={filterByIngredient}
        searchRecipes={searchRecipes}
        showFilters={true}
        emptyText={query ? "No se encontraron recetas." : ""}
        theme={theme}
        clearQuery={() => setQuery("")}
        query={query}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
  },
});
