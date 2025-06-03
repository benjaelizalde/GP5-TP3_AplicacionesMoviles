import { useTheme } from '@/context/ThemeContext';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { mode, toggleTheme, theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Configuración</Text>
      <Button
        title={mode === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        onPress={toggleTheme}
        color={theme.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
});