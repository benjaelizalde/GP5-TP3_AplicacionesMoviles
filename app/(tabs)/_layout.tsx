import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { theme, mode } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        tabBarActiveTintColor: '#e91e63',
        tabBarInactiveTintColor: mode === 'dark' ? '#bbb' : '#555',
        tabBarStyle: { backgroundColor: theme.card },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'index') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'favorites') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'ingredients') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'settings') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Recetas' }} />
      <Tabs.Screen name="ingredients" options={{ title: 'Mis Ingredientes' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="settings" options={{ title: 'Cuenta' }} />
    </Tabs>
  );
}