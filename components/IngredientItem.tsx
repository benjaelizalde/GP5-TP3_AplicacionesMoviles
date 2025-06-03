import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

const IngredientItem = ({ name, quantity }) => {
  const { theme, mode } = useTheme();

  const quantityColor = mode === 'dark' ? '#ccc' : '#555';
  const borderColor = mode === 'dark' ? '#444' : '#ddd';

  return (
    <View style={[styles.container, { borderColor }]}>
      <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
      {quantity && <Text style={[styles.quantity, { color: quantityColor }]}>{quantity}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  quantity: {
    fontSize: 14,
  },
});

export default IngredientItem;