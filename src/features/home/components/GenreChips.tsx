import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";

interface GenreChipsProps {
  selectedGenre: string | null;
  onGenreSelect: (genre: string | null) => void;
}

const GENRES = [
  "Rock",
  "Pop",
  "Jazz",
  "Hip Hop",
  "Electronic",
  "Classical",
  "Reggae",
  "Country",
  "R&B",
  "Metal",
  "Folk",
  "Blues",
];

export const GenreChips: React.FC<GenreChipsProps> = ({ selectedGenre, onGenreSelect }) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme, isDark);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[styles.chip, selectedGenre === null && styles.chipActive]}
          onPress={() => onGenreSelect(null)}
        >
          <Text style={[styles.chipText, selectedGenre === null && styles.chipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[styles.chip, selectedGenre === genre && styles.chipActive]}
            onPress={() => onGenreSelect(genre)}
          >
            <Text style={[styles.chipText, selectedGenre === genre && styles.chipTextActive]}>
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: isDark ? theme.backgroundSecondary : theme.backgroundCard,
    borderWidth: 1,
    borderColor: theme.border,
    marginHorizontal: 4,
  },
  chipActive: {
    backgroundColor: "#1DB954",
    borderColor: "#1DB954",
  },
  chipText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
