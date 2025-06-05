import { supabase } from '@/constants/supabaseClient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  // Detectar tema del dispositivo
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Colores según tema
  const backgroundColor = isDark ? '#181818' : '#fff';
  const textColor = isDark ? '#fff' : '#181818';
  const inputBg = isDark ? '#222' : '#f5f5f5';
  const borderColor = isDark ? '#444' : '#ccc';
  const placeholderColor = isDark ? '#aaa' : '#888';

  const clearFields = (user = '', pass = '') => {
    setEmailOrUsername(user);
    setUsername('');
    setEmail('');
    setPassword(pass);
    setRepeatPassword('');
  };

  const handleAuth = async () => {
    try {
      if (isRegister) {
        if (!username) throw new Error('El nombre de usuario es obligatorio');
        if (password !== repeatPassword) throw new Error('Las contraseñas no coinciden');
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');

        // Verificar si el username ya existe
        const { data: existingUser } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (existingUser) throw new Error('El nombre de usuario ya está en uso');

        // Registrar usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (error.message.includes('User already registered') || error.message.includes('already registered')) {
            throw new Error('El email ya está en uso');
          }
          throw error;
        }
        const user_id = data.user?.id;
        if (!user_id) throw new Error('No se pudo obtener el usuario');
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({ user_id, username, email });
        if (profileError) throw profileError;
        Alert.alert('Registro exitoso', '¡Tu cuenta fue creada correctamente!', [
          {
            text: 'OK',
            onPress: () => {
              setIsRegister(false);
              clearFields(username || email, password);
            },
          },
        ]);
      } else {
        let loginEmail = emailOrUsername;
        if (!emailOrUsername.includes('@')) {
          // Buscar el email en user_profiles por username
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('username', emailOrUsername)
            .single();
          if (profileError || !profile?.email) throw new Error('Usuario no encontrado');
          loginEmail = profile.email;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (error) {
          if (error.message === 'Invalid login credentials') {
            throw new Error('La contraseña es incorrecta');
          }
          throw error;
        }
        router.replace('/');
      }
    } catch (e) {
      Alert.alert('Error', e.message ?? JSON.stringify(e));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>{isRegister ? 'Crear cuenta' : 'Bienvenido'}</Text>
      {isRegister ? (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Nombre de usuario"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Email"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Contraseña"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Repetir contraseña"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
          />
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Email o nombre de usuario"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Contraseña"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </>
      )}
      <Button title={isRegister ? 'Registrarse' : 'Iniciar sesión'} onPress={handleAuth} />
      <Text
        style={[styles.link, { color: isDark ? '#4fa3ff' : '#007AFF' }]}
        onPress={() => {
            setIsRegister((prev) => !prev);
            clearFields();
        }}
      >
        {isRegister ? '¿Ya tenes cuenta? Inicia sesión' : '¿No tenes cuenta? Regístrate'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  link: { marginTop: 16, textAlign: 'center' },
});