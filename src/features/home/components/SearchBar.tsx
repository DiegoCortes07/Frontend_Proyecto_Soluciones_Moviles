import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../../../contexts/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  return (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color={theme.textTertiary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar canciones, álbumes o artistas..."
        placeholderTextColor={theme.textTertiary}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? theme.backgroundSecondary : theme.backgroundCard,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: theme.textPrimary, fontSize: 16 },
});
