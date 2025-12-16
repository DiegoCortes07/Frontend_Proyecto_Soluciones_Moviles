import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../../interfaces/Song";
import { useTheme } from "../../../../contexts/ThemeContext";
import { PlaylistSongRow } from "./PlaylistSongRow";
import { getSongImageUrl } from "../../../../utils/imageHelper";

interface LikedSongsModalProps {
  visible: boolean;
  songs: Song[];
  isFavorited: (songId: number) => boolean;
  onClose: () => void;
  onPlayAll: () => void;
  onSongPress: (index: number) => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export const LikedSongsModal: React.FC<LikedSongsModalProps> = ({
  visible,
  songs,
  isFavorited,
  onClose,
  onPlayAll,
  onSongPress,
  onToggleFavorite,
  onAddToPlaylist,
}) => {
  const { theme, isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar canciones por nombre, artista o género
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;

    const query = searchQuery.toLowerCase().trim();
    return songs.filter((song) => {
      const title = song.title?.toLowerCase() || "";
      const artist = song.artistName?.toLowerCase() || "";
      
      return (
        title.includes(query) ||
        artist.includes(query)     );
    });
  }, [songs, searchQuery]);

  const coverImage = songs.length > 0 && songs[0].imageUrl 
    ? getSongImageUrl(songs[0].imageUrl) 
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="chevron-down" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Canciones que te gustan</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            {coverImage && (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
            )}
            <View style={styles.infoText}>
              <Text style={styles.playlistName}>Canciones que te gustan</Text>
              <Text style={styles.songCount}>
                {songs.length} {songs.length === 1 ? "canción" : "canciones"}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={16} color={theme.textTertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por canción, artista o género..."
              placeholderTextColor={theme.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Icon name="times-circle" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Results Info */}
          {searchQuery.trim() && (
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsText}>
                {filteredSongs.length} {filteredSongs.length === 1 ? "resultado" : "resultados"} encontrados
              </Text>
            </View>
          )}

          {/* Play All Button */}
          {filteredSongs.length > 0 && (
            <TouchableOpacity style={styles.playAllButton} onPress={onPlayAll}>
              <Icon
                name="play"
                size={16}
                color={isDark ? "#031427" : "#f6fbff"}
                style={styles.playIcon}
              />
              <Text style={styles.playAllText}>Reproducir todo</Text>
            </TouchableOpacity>
          )}

          {/* Songs List */}
          <FlatList
            data={filteredSongs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <PlaylistSongRow
                song={item}
                isFavorited={isFavorited(item.id)}
                onPress={() => {
                  const originalIndex = songs.findIndex(s => s.id === item.id);
                  onSongPress(originalIndex);
                }}
                onToggleFavorite={() => onToggleFavorite(item)}
                onAddToPlaylist={() => onAddToPlaylist(item)}
                onRemoveFromPlaylist={() => onToggleFavorite(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search" size={48} color={theme.textTertiary} />
                <Text style={styles.emptyText}>
                  No se encontraron canciones
                </Text>
                <Text style={styles.emptySubtext}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.overlay,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: theme.backgroundSecondary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  coverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.textPrimary,
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
    color: theme.textTertiary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 14,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 8,
  },
  resultsInfo: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 14,
    color: theme.textTertiary,
    fontWeight: "600",
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: theme.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  playIcon: {
    marginRight: 8,
  },
  playAllText: {
    color: isDark ? "#031427" : "#f6fbff",
    fontSize: 14,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textTertiary,
    marginTop: 8,
  },
});
