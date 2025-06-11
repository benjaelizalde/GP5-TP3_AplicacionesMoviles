import { supabase } from "@/constants/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const THEME_OPTIONS = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Según el dispositivo", value: "system" },
];

export default function SettingsScreen() {
  const { theme, mode, themePreference, setThemePreference } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [pwFieldErrors, setPwFieldErrors] = useState<{ [key: string]: string }>(
    {}
  );
  const newPasswordRef = useRef<TextInput>(null);
  const repeatPasswordRef = useRef<TextInput>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("user_id", user.id)
          .single();
        if (data?.username) setUsername(data.username);
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("APP_THEME");
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleClosePwModal = () => {
    setPwModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setRepeatPassword("");
    setPwFieldErrors({});
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleChangePassword = async () => {
    let errors: { [key: string]: string } = {};

    if (!currentPassword) {
      setPwFieldErrors({
        currentPassword: "Debes ingresar tu contraseña actual.",
      });
      return;
    }

    setPwFieldErrors({});
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (loginError) {
      setLoading(false);
      setPwFieldErrors({
        currentPassword: "La contraseña actual es incorrecta.",
      });
      return;
    }

    if (!newPassword || newPassword.length < 6)
      errors.newPassword =
        "La nueva contraseña debe tener al menos 6 caracteres.";
    if (newPassword !== repeatPassword)
      errors.repeatPassword = "Las contraseñas no coinciden.";
    if (newPassword === currentPassword && newPassword)
      errors.newPassword =
        "La nueva contraseña debe ser distinta a la anterior.";

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      setPwFieldErrors(errors);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      if (
        error.message ===
        "New password should be different from the old password"
      ) {
        setPwFieldErrors({
          newPassword: "La nueva contraseña debe ser distinta a la anterior.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      }
    } else {
      handleClosePwModal();
      Toast.show({
        type: "success",
        text1: "Contraseña actualizada",
        text2: "Tu contraseña se cambió correctamente.",
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Tarjeta de usuario */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: mode === "light" ? "#000" : "#fff" },
            ]}
          >
            <Text
              style={{
                color: mode === "light" ? "#fff" : "#000",
                fontSize: 28,
                fontWeight: "bold",
              }}
            >
              {username?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </Text>
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.username, { color: theme.text }]}>
              {username || "Sin usuario"}
            </Text>
            <Text style={[styles.email, { color: theme.text }]}>
              {user?.email ?? "Sin email"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => setModalVisible(true)}
        >
          {themePreference === "light" ||
          (themePreference === "system" && mode === "light") ? (
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
            backgroundColor: "transparent",
          },
        ]}
        onPress={() => setPwModalVisible(true)}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 16,
          }}
        >
          Cambia tu contraseña
        </Text>
      </TouchableOpacity>

      {/* Modal para cambiar contraseña */}
      <Modal
        visible={pwModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClosePwModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            if (keyboardOpen) {
              Keyboard.dismiss();
            } else {
              handleClosePwModal();
            }
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "bold",
                  fontSize: 18,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Cambiar contraseña
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.text },
                ]}
                placeholder="Contraseña actual"
                placeholderTextColor="#888"
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => newPasswordRef.current?.focus()}
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  setPwFieldErrors((prev) => {
                    const { currentPassword, ...rest } = prev;
                    return rest;
                  });
                }}
              />
              {pwFieldErrors.currentPassword && (
                <Text style={styles.errorText}>
                  {pwFieldErrors.currentPassword}
                </Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.text },
                ]}
                placeholder="Nueva contraseña"
                placeholderTextColor="#888"
                secureTextEntry
                ref={newPasswordRef}
                returnKeyType="next"
                onSubmitEditing={() => repeatPasswordRef.current?.focus()}
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setPwFieldErrors((prev) => {
                    const { newPassword, ...rest } = prev;
                    return rest;
                  });
                }}
              />
              {pwFieldErrors.newPassword && (
                <Text style={styles.errorText}>
                  {pwFieldErrors.newPassword}
                </Text>
              )}
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.text },
                ]}
                placeholder="Repetir nueva contraseña"
                placeholderTextColor="#888"
                secureTextEntry
                ref={repeatPasswordRef}
                returnKeyType="send"
                value={repeatPassword}
                onChangeText={(t) => {
                  setRepeatPassword(t);
                  setPwFieldErrors((prev) => {
                    const { repeatPassword, ...rest } = prev;
                    return rest;
                  });
                }}
                onSubmitEditing={handleChangePassword}
              />
              {pwFieldErrors.repeatPassword && (
                <Text style={styles.errorText}>
                  {pwFieldErrors.repeatPassword}
                </Text>
              )}
              <TouchableOpacity
                style={styles.filledBtn}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={{ color: theme.text, fontSize: 16 }}>
                  {loading ? "Cambiando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      {/* Selector de tema modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "bold",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              Tema
            </Text>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={styles.themeModalOption}
                onPress={() => {
                  setThemePreference(opt.value);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={{
                    color: theme.text,
                    fontWeight:
                      themePreference === opt.value ? "bold" : "normal",
                    fontSize: 16,
                  }}
                >
                  {opt.label}
                </Text>
                {themePreference === opt.value && (
                  <Text
                    style={{ color: "#4f8cff", fontSize: 18, marginLeft: 8 }}
                  >
                    ✓
                  </Text>
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
      <Toast position="bottom" bottomOffset={50} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 18,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
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
    alignItems: "center",
    justifyContent: "center",
  },
  username: { fontSize: 20, fontWeight: "bold" },
  email: { fontSize: 15, color: "#888", marginTop: 2 },
  outlineBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 18,
    marginHorizontal: 30,
  },
  filledBtn: {
    alignItems: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    borderRadius: 8,
    padding: 30,
    minWidth: 260,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
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
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 8,
  },
  logoutBtnText: {
    color: "red",
    fontSize: 16,
  },
  themeModalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 13,
    width: 200,
  },
});
