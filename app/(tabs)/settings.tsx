import { supabase } from '@/constants/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const THEME_OPTIONS = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Según el dispositivo', value: 'system' },
];

export default function SettingsScreen() {
  const { theme, mode,themePreference, setThemePreference } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const newPasswordRef = useRef<TextInput>(null);
  const repeatPasswordRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        if (data?.username) setUsername(data.username);
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('APP_THEME');
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Debes ingresar tu contraseña actual.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== repeatPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser distinta a la anterior.');
      return;
    }
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (loginError) {
      setLoading(false);
      Alert.alert('Error', 'La contraseña actual es incorrecta.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      if (error.message === 'New password should be different from the old password') {
        Alert.alert('Error', 'La nueva contraseña debe ser distinta a la anterior.');
      } else {
        Alert.alert('Error', error.message);
      }
    } else {
      setPwModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tarjeta de usuario */}
      <View style={[styles.card, { backgroundColor: theme.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.avatar, { backgroundColor: mode === 'light' ? '#000' : '#fff' }]}>
            <Text style={{ color: mode === 'light' ? '#fff' : '#000', fontSize: 28, fontWeight: 'bold' }}>
              {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.username, { color: theme.text }]}>{username || 'Sin usuario'}</Text>
            <Text style={[styles.email, { color: theme.text }]}>{user?.email ?? 'Sin email'}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => setModalVisible(true)}
        >
          {themePreference === 'light' || (themePreference === 'system' && mode === 'light') ? (
            <Ionicons name="sunny-outline" size={30} color={theme.text} />
          ) : (
            <Ionicons name="moon-outline" size={30} color={theme.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Botón para cambiar contraseña */}
      <TouchableOpacity 
      style={[
        styles.outlineBtn,
        {
          borderColor: theme.text,
          backgroundColor: 'transparent',
        }
      ]} 
      onPress={() => setPwModalVisible(true)}>
      <Text
        style={{
          color: theme.text,
          fontSize: 16,
        }}>     
        Cambia tu contraseña</Text>
      </TouchableOpacity>

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={pwModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPwModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPwModalVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>Cambiar contraseña</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
              placeholder="Contraseña actual"
              placeholderTextColor="#888"
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => newPasswordRef.current?.focus()}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
              placeholder="Nueva contraseña"
              placeholderTextColor="#888"
              secureTextEntry
              ref={newPasswordRef}
              returnKeyType="next"
              onSubmitEditing={() => repeatPasswordRef.current?.focus()}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.text }]}
              placeholder="Repetir nueva contraseña"
              placeholderTextColor="#888"
              secureTextEntry
              ref={repeatPasswordRef}
              returnKeyType="send"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              onSubmitEditing={handleChangePassword}
            />
            <TouchableOpacity
              style={styles.filledBtn}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={{ color: theme.text, fontSize: 16 }}>
                {loading ? 'Cambiando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Selector de tema modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Tema</Text>
            {THEME_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={styles.themeModalOption}
                onPress={() => {
                  setThemePreference(opt.value);
                  setModalVisible(false);
                }}
              >
                <Text style={{
                  color: theme.text,
                  fontWeight: themePreference === opt.value ? 'bold' : 'normal',
                  fontSize: 16,
                }}>
                  {opt.label}
                </Text>
                {themePreference === opt.value && (
                  <Text style={{ color: '#4f8cff', fontSize: 18, marginLeft: 8 }}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Botón cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 18,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 8,
    marginHorizontal: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 15, color: '#888', marginTop: 2 },
  outlineBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 18,
    marginHorizontal: 30,
  },
  filledBtn: {
    alignItems: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 8,
    padding: 30,
    minWidth: 260,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: 200,
    fontSize: 16,
  },
  logoutBtn: {
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 8,
  },
  logoutBtnText: {
    color: 'red',
    fontSize: 16,
  },
  themeModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});