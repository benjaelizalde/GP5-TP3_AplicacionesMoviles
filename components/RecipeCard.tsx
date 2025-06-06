import { useTheme } from '@/context/ThemeContext';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function RecipeCard({ recipe, onPress }: { recipe: any, onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.card }]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        {recipe.strMealES ?? recipe.strMeal}
      </Text>
      <Image source={{ uri: recipe.strMealThumb }} style={styles.image} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    height: 200,
    width: '100%',
  },
  title: {
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
});