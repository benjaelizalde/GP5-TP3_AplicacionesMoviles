import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function RecipeCard({ recipe, onPress }: { recipe: any, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.title}>{recipe.strMealES ?? recipe.strMeal}</Text>
      <Image source={{ uri: recipe.strMealThumb }} style={styles.image} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
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
