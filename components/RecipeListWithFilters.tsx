import { useScrollToTop } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import RecipeCard from "./RecipeCard";

function AutocompleteInput({
  label,
  data,
  value,
  onChange,
  openInput,
  setOpenInput,
  theme,
}) {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = data.filter((item) =>
    item.toLowerCase().includes(query?.toLowerCase() || "")
  );

  const isOpen = openInput === label;

  const visibleItems = filtered.slice(0, 20);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[styles.label, { color: theme?.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme?.card,
            color: theme?.text,
            borderColor: theme?.text,
          },
        ]}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setOpenInput(label);
          onChange(text);
        }}
        onFocus={() => setOpenInput(label)}
        placeholder={`Elegí o escribí ${label.toLowerCase()}...`}
        placeholderTextColor="grey"
      />
      {isOpen && visibleItems.length > 0 && (
        <ScrollView
          style={[
            styles.list,
            { backgroundColor: theme?.card, borderColor: theme?.text + "33" },
          ]}
          nestedScrollEnabled={true}
        >
          {visibleItems.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                setQuery(item);
                setOpenInput("");
                onChange(item);
                Keyboard.dismiss();
              }}
            >
              <Text style={[styles.item, { color: theme?.text }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function RecipeListWithFilters({
  recipes,
  loading,
  onRecipePress,
  fetchCategories,
  fetchAreas,
  fetchIngredients,
  filterByCategory,
  filterByArea,
  filterByIngredient,
  searchRecipes,
  showFilters = true,
  emptyText = "",
  theme,
  clearQuery,
  query,
}) {
  const flatListRef = useRef(null);
  useScrollToTop(flatListRef);

  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [openInput, setOpenInput] = useState<string>("");

  useEffect(() => {
    if (showFilters && fetchCategories && fetchAreas && fetchIngredients) {
      fetchCategories().then(setCategories);
      fetchAreas().then(setAreas);
      fetchIngredients().then(setIngredients);
    }
  }, [showFilters, fetchCategories, fetchAreas, fetchIngredients]);

  useEffect(() => {
    if (query && query.length > 0) {
      setSelectedCategory("");
      setSelectedArea("");
      setSelectedIngredient("");
    }
  }, [query]);

  const handleApplyFilters = async () => {
    setModalVisible(false);
    setOpenInput("");
    if (clearQuery) clearQuery();
    if (selectedCategory) {
      await filterByCategory(selectedCategory);
    } else if (selectedArea) {
      await filterByArea(selectedArea);
    } else if (selectedIngredient) {
      await filterByIngredient(selectedIngredient);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedArea("");
    setSelectedIngredient("");
    setOpenInput("");
    if (searchRecipes) searchRecipes("");
  };

  return (
    <View style={{ flex: 1 }}>
      {showFilters && (
        <>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setModalVisible(true);
              setOpenInput("");
            }}
          >
            <Text style={{ color: "#007AFF" }}>Búsqueda por filtro</Text>
          </Pressable>
          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => {
              setModalVisible(false);
              setOpenInput("");
              Keyboard.dismiss();
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setModalVisible(false);
                setOpenInput("");
                Keyboard.dismiss();
              }}
            >
              <View style={styles.modalOverlay}>
                <ScrollView
                  style={{ width: "100%" }}
                  contentContainerStyle={{
                    alignItems: "center",
                    justifyContent: "center",
                    flexGrow: 1,
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  <TouchableWithoutFeedback onPress={() => {}}>
                    <View
                      style={[
                        styles.card,
                        { backgroundColor: theme?.card || "#fff" },
                      ]}
                    >
                      <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Filtrar recetas
                      </Text>
                      <Text
                        style={{
                          fontStyle: "italic",
                          color: "grey",
                          marginBottom: 12,
                          textAlign: "center",
                        }}
                      >
                        nota: solo se puede buscar por un filtro a la vez
                      </Text>
                      <AutocompleteInput
                        label="Categoría"
                        data={categories}
                        value={selectedCategory}
                        onChange={(value) => {
                          setSelectedCategory(value);
                          setSelectedArea("");
                          setSelectedIngredient("");
                        }}
                        openInput={openInput}
                        setOpenInput={setOpenInput}
                        theme={theme}
                      />
                      <AutocompleteInput
                        label="Área"
                        data={areas}
                        value={selectedArea}
                        onChange={(value) => {
                          setSelectedArea(value);
                          setSelectedCategory("");
                          setSelectedIngredient("");
                        }}
                        openInput={openInput}
                        setOpenInput={setOpenInput}
                        theme={theme}
                      />
                      <AutocompleteInput
                        label="Ingrediente"
                        data={ingredients}
                        value={selectedIngredient}
                        onChange={(value) => {
                          setSelectedIngredient(value);
                          setSelectedCategory("");
                          setSelectedArea("");
                        }}
                        openInput={openInput}
                        setOpenInput={setOpenInput}
                        theme={theme}
                      />
                      <View style={styles.buttonRow}>
                        <Pressable
                          style={{
                          flex: 1,
                          alignItems: "flex-start",
                          justifyContent: "center",
                          paddingVertical: 8,
                          paddingLeft: 16,
                          }}
                          onPress={handleApplyFilters}
                        >
                          <Text style={{ color: "#007AFF", fontSize: 18 }}>
                          Filtrar
                          </Text>
                        </Pressable>
                        <Pressable
                          style={{
                          flex: 1,
                          alignItems: "flex-end",
                          justifyContent: "center",
                          paddingVertical: 8,
                          paddingRight: 16,
                          }}
                          onPress={handleClearFilters}
                        >
                          <Text style={{ color: "grey", fontSize: 18 }}>
                          Limpiar
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 20 }}
          color={theme?.text || "#000"}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => onRecipePress(item)} />
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme?.text || "#000" }]}>
              {emptyText}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 12,
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  label: { marginBottom: 4, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f2f2f2",
  },
  list: {
    maxHeight: 120,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    marginTop: 2,
    zIndex: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 8,
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
  },
});
