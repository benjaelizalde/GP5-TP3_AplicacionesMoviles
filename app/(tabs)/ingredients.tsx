import IngredientItem from '@/components/IngredientItem';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const STORAGE_KEY = 'MIS_INGREDIENTES';

export default function MisIngredientesScreen() {
  const [ingredientes, setIngredientes] = useState<{ name: string; quantity?: string }[]>([]);
  const [nuevoIngrediente, setNuevoIngrediente] = useState('');
  const [cantidad, setCantidad] = useState('');
  const { theme, mode } = useTheme();
  const placeholderColor = mode === 'dark' ? '#bbb' : '#888';

  useEffect(() => {
    cargarIngredientes();
  }, []);

  useEffect(() => {
    guardarIngredientes();
  }, [ingredientes]);

  const cargarIngredientes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setIngredientes(JSON.parse(data));
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los ingredientes');
    }
  };

  const guardarIngredientes = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ingredientes));
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los ingredientes');
    }
  };

  const agregarIngrediente = () => {
    if (!nuevoIngrediente.trim()) return;
    setIngredientes([...ingredientes, { name: nuevoIngrediente.trim(), quantity: cantidad.trim() }]);
    setNuevoIngrediente('');
    setCantidad('');
  };

  const eliminarIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '33' },
          ]}
          placeholder="Ingrediente"
          placeholderTextColor={placeholderColor}
          value={nuevoIngrediente}
          onChangeText={setNuevoIngrediente}
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, color: theme.text, borderColor: theme.text + '33' },
          ]}
          placeholder="Cantidad (opcional)"
          placeholderTextColor={placeholderColor}
          value={cantidad}
          onChangeText={setCantidad}
        />
        <Button title="Agregar" onPress={agregarIngrediente} />
      </View>
      <FlatList
        data={ingredientes}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <IngredientItem name={item.name} quantity={item.quantity} />
            </View>
            <Button title="Eliminar" color="red" onPress={() => eliminarIngrediente(index)} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.text + '99' }]}>
            No hay ingredientes guardados.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputRow: { flexDirection: 'row', marginTop:16, marginBottom: 16, marginHorizontal:16, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 6, marginRight: 8, padding: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginHorizontal: 16 },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 16 },
});