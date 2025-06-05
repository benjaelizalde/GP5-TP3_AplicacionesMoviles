import { supabase } from '@/constants/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const THEME_OPTIONS = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Según el dispositivo', value: 'system' },
];

export default function SettingsScreen() {
  const { theme, themePreference, setThemePreference } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('APP_THEME');
  await supabase.auth.signOut();
  router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Datos básicos de la cuenta */}
      <View style={styles.accountBox}>
        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
        <Text style={[styles.value, { color: theme.text }]}>{user?.email ?? 'Sin email'}</Text>
      </View>

      {/* Selector de tema tipo menú */}
      <Text style={[styles.label, { color: theme.text, marginTop: 24 }]}>Tema de la aplicación</Text>
      <TouchableOpacity
        style={[styles.themeButton, { borderColor: theme.text }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: theme.text }}>
          {THEME_OPTIONS.find(opt => opt.value === themePreference)?.label ?? 'Seleccionar'}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: theme.background }]}>
            {THEME_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={styles.modalOption}
                onPress={() => {
                  setThemePreference(opt.value);
                  setModalVisible(false);
                }}
              >
                <Text style={{ color: theme.text, fontWeight: themePreference === opt.value ? 'bold' : 'normal' }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Botón cerrar sesión */}
      <View style={{ marginTop: 32, width: '100%' }}>
        <Button
          title="Cerrar sesión"
          color="#ff3b30"
          onPress={handleLogout}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 24 },
  accountBox: { marginBottom: 24, alignItems: 'center' },
  label: { fontSize: 16, fontWeight: 'bold' },
  value: { fontSize: 16, marginBottom: 8 },
  themeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    width: 200,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 12,
    padding: 16,
    minWidth: 220,
    elevation: 4,
  },
  modalOption: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});