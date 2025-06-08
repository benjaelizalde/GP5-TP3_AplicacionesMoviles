import { supabase } from "@/constants/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const backgroundColor = isDark ? "#181818" : "#fff";
  const textColor = isDark ? "#fff" : "#181818";
  const inputBg = isDark ? "#222" : "#f5f5f5";
  const borderColor = isDark ? "#444" : "#ccc";
  const placeholderColor = isDark ? "#aaa" : "#888";

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const repeatPasswordInputRef = useRef<TextInput>(null);

  const clearFields = (user = "", pass = "") => {
    setEmailOrUsername(user);
    setUsername("");
    setEmail("");
    setPassword(pass);
    setRepeatPassword("");
    setFieldErrors({});
  };

  const handleAuth = async () => {
    let errors: { [key: string]: string } = {};
    try {
      if (isRegister) {
        if (!username) errors.username = "El nombre de usuario es obligatorio";
        if (!email) errors.email = "El email es obligatorio";
        if (!password || password.trim() === "")
          errors.password = "La contraseña es obligatoria";
        if (password !== repeatPassword)
          errors.repeatPassword = "Las contraseñas no coinciden";
        if (password.length < 6)
          errors.password = "La contraseña debe tener al menos 6 caracteres";

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          return;
        }
        setFieldErrors({});

        const { data: existingUser } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("username", username)
          .single();

        if (existingUser) {
          setFieldErrors({ username: "El nombre de usuario ya está en uso" });
          return;
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          if (
            error.message.includes("User already registered") ||
            error.message.includes("already registered")
          ) {
            setFieldErrors({ email: "El email ya está en uso" });
            return;
          }
          if (
            error.message.includes(
              "Unable to validate email address: invalid format"
            ) ||
            error.message.toLowerCase().includes("invalid email")
          ) {
            setFieldErrors({ email: "El email ingresado no es válido" });
            return;
          }
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message,
          });
          return;
        }
        const user_id = data.user?.id;
        if (!user_id) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "No se pudo obtener el usuario",
          });
          return;
        }
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({ user_id, username, email });
        if (profileError) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: profileError.message,
          });
          return;
        }
        Toast.show({
          type: "success",
          text1: "Registro exitoso",
          text2: "Tu cuenta fue creada correctamente",
        });
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          Toast.show({
            type: "error",
            text1: "Error al iniciar sesión",
            text2: loginError.message,
          });
          return;
        }
        router.replace("/");
      } else {
        let loginEmail = emailOrUsername;
        if (!emailOrUsername)
          errors.emailOrUsername =
            "El email o nombre de usuario es obligatorio";
        if (!password) errors.password = "La contraseña es obligatoria";

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
          return;
        }
        setFieldErrors({});

        if (!emailOrUsername.includes("@")) {
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("email")
            .eq("username", emailOrUsername)
            .single();
          if (profileError || !profile?.email) {
            setFieldErrors({ emailOrUsername: "Usuario no encontrado" });
            return;
          }
          loginEmail = profile.email;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (error) {
          if (error.message === "Invalid login credentials") {
            setFieldErrors({ password: "La contraseña es incorrecta" });
            return;
          }
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message,
          });
          return;
        }
        router.replace("/");
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: e.message ?? JSON.stringify(e),
      });
    }
  };

  // Manda mail pero como estamos en desarrollo y no va a salir a produccion no funciona el link ese
  const handlePasswordReset = async () => {
    if (!emailOrUsername || !emailOrUsername.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ingresa tu email y presiona nuevamente.",
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(
      emailOrUsername
    );
    if (error) {
      if (
        error.message.includes(
          "Unable to validate email address: invalid format"
        )
      ) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "El email ingresado no es válido",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      }
    } else {
      Toast.show({
        type: "success",
        text1: "Revisa tu correo",
        text2: "Te enviamos un enlace para restablecer tu contraseña.",
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor }]}>
        {!isRegister && (
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Ionicons
              name="book-outline"
              size={100}
              color={isDark ? "#fff" : "#181818"}
            />
          </View>
        )}
        {isRegister && (
          <Text style={[styles.title, { color: textColor }]}>Crear cuenta</Text>
        )}
        {isRegister ? (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="Nombre de usuario"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setFieldErrors((prev) => {
                  const { username, ...rest } = prev;
                  return rest;
                });
              }}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />
            {fieldErrors.username && (
              <Text style={styles.errorText}>{fieldErrors.username}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="Email"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setFieldErrors((prev) => {
                  const { email, ...rest } = prev;
                  return rest;
                });
              }}
              ref={emailInputRef}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            {fieldErrors.email && (
              <Text style={styles.errorText}>{fieldErrors.email}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="Contraseña"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setFieldErrors((prev) => {
                  const { password, ...rest } = prev;
                  return rest;
                });
              }}
              ref={passwordInputRef}
              returnKeyType="next"
              onSubmitEditing={() => repeatPasswordInputRef.current?.focus()}
            />
            {fieldErrors.password && (
              <Text style={styles.errorText}>{fieldErrors.password}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="Repetir contraseña"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={repeatPassword}
              onChangeText={(t) => {
                setRepeatPassword(t);
                setFieldErrors((prev) => {
                  const { repeatPassword, ...rest } = prev;
                  return rest;
                });
              }}
              ref={repeatPasswordInputRef}
              returnKeyType="send"
              onSubmitEditing={handleAuth}
            />
            {fieldErrors.repeatPassword && (
              <Text style={styles.errorText}>{fieldErrors.repeatPassword}</Text>
            )}
          </>
        ) : (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="Email o nombre de usuario"
              placeholderTextColor={placeholderColor}
              autoCapitalize="none"
              value={emailOrUsername}
              onChangeText={(t) => {
                setEmailOrUsername(t);
                setFieldErrors((prev) => {
                  const { emailOrUsername, ...rest } = prev;
                  return rest;
                });
              }}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
            {fieldErrors.emailOrUsername && (
              <Text style={styles.errorText}>
                {fieldErrors.emailOrUsername}
              </Text>
            )}
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: textColor, borderColor },
              ]}
              placeholder="Contraseña"
              placeholderTextColor={placeholderColor}
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setFieldErrors((prev) => {
                  const { password, ...rest } = prev;
                  return rest;
                });
              }}
              ref={passwordInputRef}
              returnKeyType="done"
              onSubmitEditing={handleAuth}
            />
            {fieldErrors.password && (
              <Text style={styles.errorText}>{fieldErrors.password}</Text>
            )}
            <Text
              style={[
                styles.password,
                { color: isDark ? "#4fa3ff" : "#007AFF" },
              ]}
              onPress={handlePasswordReset}
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
            alignItems: "center",
            borderColor: textColor,
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 8,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: textColor,
              fontSize: 16,
            }}
          >
            {isRegister ? "Registrarse" : "Iniciar sesión"}
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.link, { color: isDark ? "#4fa3ff" : "#007AFF" }]}
          onPress={() => {
            setIsRegister((prev) => !prev);
            clearFields();
          }}
        >
          {isRegister
            ? "¿Ya tenés cuenta? Inicia sesión"
            : "¿No tenés cuenta? Regístrate"}
        </Text>
        <Toast position="bottom" bottomOffset={50} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  password: { marginTop: 0, marginBottom: 16, textAlign: "left" },
  link: { marginTop: 16, textAlign: "center" },
  errorText: { color: "red", marginBottom: 8, marginLeft: 4, fontSize: 13 },
});
