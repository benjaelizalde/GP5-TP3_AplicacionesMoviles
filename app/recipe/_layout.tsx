import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function RecipeLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
      }}
    />
  );
}
