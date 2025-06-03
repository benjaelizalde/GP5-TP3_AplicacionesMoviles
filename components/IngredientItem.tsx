import { StyleSheet, Text, View } from 'react-native';

const IngredientItem = ({ name, quantity }) => (
  <View style={styles.container}>
    <Text style={styles.name}>{name}</Text>
    {quantity && <Text style={styles.quantity}>{quantity}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: {
    flex: 1,
    fontSize: 16,
  },
  quantity: {
    color: '#888',
    fontSize: 14,
  },
});

export default IngredientItem;