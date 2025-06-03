import { View } from 'react-native';
import IngredientItem from './IngredientItem';

const IngredientList = ({ ingredients }) => (
  <View>
    {ingredients.map((item, idx) => (
      <IngredientItem
        key={idx}
        name={item.name}
        quantity={item.quantity}
      />
    ))}
  </View>
);

export default IngredientList;