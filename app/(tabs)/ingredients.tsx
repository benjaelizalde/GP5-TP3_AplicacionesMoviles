import IngredientItem from '@/components/IngredientItem';
import { supabase } from '@/constants/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function MisIngredientesScreen() {
  const [ingredientes, setIngredientes] = useState<{ name: string; quantity?: string }[]>([]);
  const [nuevoIngrediente, setNuevoIngrediente] = useState('');
  const [cantidad, setCantidad] = useState('');
  const { theme, mode } = useTheme();
  const { user } = useAuth();
  const placeholderColor = mode === 'dark' ? '#bbb' : '#888';
  const cantidadInputRef = useRef<TextInput>(null);

  useEffect(() => {
    cargarIngredientes();
  }, [user]);

  const cargarIngredientes = async () => {
    if (!user?.id) return setIngredientes([]);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('name, quantity')
        .eq('user_id', user.id);
      if (error) throw error;
      setIngredientes(data ?? []);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los ingredientes');
    }
  };

  const agregarIngrediente = async () => {
    if (!nuevoIngrediente.trim() || !user?.id) return;
    const nuevo = { name: nuevoIngrediente.trim(), quantity: cantidad.trim() };
    try {
      await supabase
        .from('ingredients')
        .upsert({ user_id: user.id, ...nuevo }, { onConflict: 'user_id,name' });
      await cargarIngredientes();
      setNuevoIngrediente('');
      setCantidad('');
    } catch (e) {
      Alert.alert('Error', 'No se pudo agregar el ingrediente');
    }
  };

  const eliminarIngrediente = async (index: number) => {
    if (!user?.id) return;
    const ing = ingredientes[index];
    try {
      await supabase
        .from('ingredients')
        .delete()
        .eq('user_id', user.id)
        .eq('name', ing.name);
      await cargarIngredientes();
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar el ingrediente');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '33' },
          ]}
          placeholder="Ingrediente *"
          placeholderTextColor={placeholderColor}
          value={nuevoIngrediente}
          onChangeText={setNuevoIngrediente}
          onSubmitEditing={() => cantidadInputRef.current?.focus()}
          returnKeyType="next"
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '33' },
          ]}
          placeholder="Cantidad"
          placeholderTextColor={placeholderColor}
          value={cantidad}
          onChangeText={setCantidad}
          ref={cantidadInputRef}
          returnKeyType="done"
          onSubmitEditing={agregarIngrediente}
        />
        <TouchableOpacity onPress={agregarIngrediente}>
          <Text style={{ color: '#007AFF',  fontSize: 16 }}>Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ingredientes}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <IngredientItem name={item.name} quantity={item.quantity} />
            </View>
            <TouchableOpacity onPress={() => eliminarIngrediente(index)}>
              <Text style={{ color: 'red', fontSize: 16 }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.text }]}>
            No hay ingredientes guardados.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputRow: { flexDirection: 'row', marginTop:16, marginBottom: 16, marginHorizontal:16, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 6, marginRight: 8, padding: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginHorizontal: 16 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 16 },
});