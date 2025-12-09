import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#bbb" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar canciones, álbumes o artistas..."
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0c1730",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1c2f55",
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#e8f1ff", fontSize: 16 },
});
