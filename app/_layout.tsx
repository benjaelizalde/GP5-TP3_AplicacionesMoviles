import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Stack screenOptions={{ 
          headerShown: false,
        }} />
      </AppProvider>
    </ThemeProvider>
  );
}