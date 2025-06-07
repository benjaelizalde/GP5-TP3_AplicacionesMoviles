import { supabase } from '@/constants/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = isDark ? '#181818' : '#fff';
  const textColor = isDark ? '#fff' : '#181818';
  const inputBg = isDark ? '#222' : '#f5f5f5';
  const borderColor = isDark ? '#444' : '#ccc';
  const placeholderColor = isDark ? '#aaa' : '#888';

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const repeatPasswordInputRef = useRef<TextInput>(null);

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
        if (!email) throw new Error('El email es obligatorio');
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
          if (error.message.includes('Unable to validate email address: invalid format') || error.message.toLowerCase().includes('invalid email')) {
            throw new Error('El email ingresado no es válido');
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
        if (!emailOrUsername) throw new Error('El email o nombre de usuario es obligatorio');
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
      {!isRegister && (
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Ionicons
            name="book-outline"
            size={100}
            color={isDark ? '#fff' : '#181818'}
          />
        </View>
      )}
      {isRegister && (
        <Text style={[styles.title, { color: textColor }]}>Crear cuenta</Text>
      )}
      {isRegister ? (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Nombre de usuario"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Email"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            ref={emailInputRef}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Contraseña"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            ref={passwordInputRef}
            returnKeyType="next"
            onSubmitEditing={() => repeatPasswordInputRef.current?.focus()}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Repetir contraseña"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            ref={repeatPasswordInputRef}
            returnKeyType="send"
            onSubmitEditing={handleAuth}
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
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            placeholder="Contraseña"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            ref={passwordInputRef}
            returnKeyType="done"
            onSubmitEditing={handleAuth}
          />
          <Text
            style={[styles.password, { color: isDark ? '#4fa3ff' : '#007AFF',  }]}
            onPress={() => {
              // Aquí puedes abrir un modal, navegar a otra pantalla o mostrar un Alert
              Alert.alert(
                'Recuperar contraseña',
                'Para recuperar tu contraseña, ingresa tu email en el login y presiona este enlace.',
                [
                  {
                    text: 'Enviar email',
                    onPress: async () => {
                      if (!emailOrUsername || emailOrUsername.includes('@') === false) {
                        Alert.alert('Por favor, ingresa tu email en el campo correspondiente.');
                        return;
                      }
                      const { error } = await supabase.auth.resetPasswordForEmail(emailOrUsername);
                      if (error) {
                        Alert.alert('Error', error.message);
                      } else {
                        Alert.alert('Listo', 'Te enviamos un email para restablecer tu contraseña.');
                      }
                    },
                  },
                  { text: 'Cancelar', style: 'cancel' },
                ]
              );
            }}
          >
            ¿Olvidaste tu contraseña?
          </Text>
        </>
      )}
      <TouchableOpacity
        onPress={handleAuth}
        activeOpacity={0.7}
        style={{
          paddingVertical: 12,
          alignItems: 'center',
          borderColor: textColor,
          borderWidth: 1,
          borderRadius: 8,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        <Text style={{
          color: textColor,
          fontSize: 16,
        }}>
          {isRegister ? 'Registrarse' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>
      <Text
        style={[styles.link, { color: isDark ? '#4fa3ff' : '#007AFF' }]}
        onPress={() => {
            setIsRegister((prev) => !prev);
            clearFields();
        }}
      >
        {isRegister ? '¿Ya tenés cuenta? Inicia sesión' : '¿No tenés cuenta? Regístrate'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  password:{marginTop: 0, marginBottom: 16, textAlign: 'left'},
  link: { marginTop: 16, textAlign: 'center' },
});