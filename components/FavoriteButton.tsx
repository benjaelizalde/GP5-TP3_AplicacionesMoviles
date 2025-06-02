import { Ionicons } from '@expo/vector-icons';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  isFavorite: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function FavoriteButton({ isFavorite, onToggle, style }: Props) {
  return (
    <TouchableOpacity onPress={onToggle} style={style}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={28}
        color={isFavorite ? 'red' : 'gray'}
      />
    </TouchableOpacity>
  );
}
