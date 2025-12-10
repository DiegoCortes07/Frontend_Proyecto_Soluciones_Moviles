import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Platform,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../../interfaces/Song";
import { PlaylistSongRow } from "./PlaylistSongRow";

// Declarar window para TypeScript en web
declare const window: any;

interface PlaylistModalProps {
  visible: boolean;
  playlistId: number;
  playlistName: string;
  playlistDescription: string;
  playlistImage: string | null;
  songs: Song[];
  isFavorited: (songId: number) => boolean;
  onClose: () => void;
  onPlayAll: () => void;
  onSongPress: (index: number) => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  onRemoveSong: (song: Song) => void;
  onDeletePlaylist: () => void;
  onEditPlaylist: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  visible,
  playlistId,
  playlistName,
  playlistDescription,
  playlistImage,
  songs,
  isFavorited,
  onClose,
  onPlayAll,
  onSongPress,
  onToggleFavorite,
  onAddToPlaylist,
  onRemoveSong,
  onDeletePlaylist,
  onEditPlaylist,
}) => {
  if (!visible) return null;

  const [showMenu, setShowMenu] = React.useState(false);

  const handleDeletePlaylist = (e: any) => {
    e?.stopPropagation?.();
    console.log("PlaylistModal: handleDeletePlaylist called");

    if (Platform.OS === "web") {
      // En web usar confirm nativo
      if (
        window.confirm("¿Estás seguro de que deseas eliminar esta playlist?")
      ) {
        console.log(
          "PlaylistModal: User confirmed delete, calling onDeletePlaylist"
        );
        onDeletePlaylist();
      } else {
        console.log("PlaylistModal: User cancelled delete");
      }
    } else {
      // En mobile usar Alert
      Alert.alert(
        "Eliminar playlist",
        "¿Estás seguro de que deseas eliminar esta playlist?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              console.log(
                "PlaylistModal: Confirmed delete, calling onDeletePlaylist"
              );
              onDeletePlaylist();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.overlayBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <SafeAreaView style={styles.overlayPanel}>
        <View style={styles.modalCard}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.backButtonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMenu(!showMenu)}
              style={{ padding: 6 }}
              activeOpacity={0.7}
            >
              <Icon name="ellipsis-v" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {showMenu && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  onEditPlaylist();
                }}
              >
                <Icon name="edit" size={16} color="#9fb4d6" />
                <Text style={styles.menuItemText}>Editar playlist</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={(e) => {
                  setShowMenu(false);
                  handleDeletePlaylist(e);
                }}
              >
                <Icon name="trash" size={16} color="#ff6b6b" />
                <Text style={[styles.menuItemText, { color: "#ff6b6b" }]}>
                  Eliminar playlist
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.heroRow}>
            {playlistImage ? (
              <Image
                source={{ uri: playlistImage }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.coverImage, styles.coverPlaceholder]}>
                <Icon name="music" size={28} color="#9fb4d6" />
              </View>
            )}

            <View style={styles.heroText}>
              <Text style={styles.playlistLabel}>Playlist</Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {playlistName}
              </Text>
              {playlistDescription ? (
                <Text style={styles.heroDescription} numberOfLines={3}>
                  {playlistDescription}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Icon name="music" size={12} color="#9fb4d6" />
                <Text style={styles.metaText}>
                  {songs.length} {songs.length === 1 ? "canción" : "canciones"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.playAllButton, { alignSelf: "stretch" }]}
            onPress={onPlayAll}
            activeOpacity={0.9}
          >
            <Text style={styles.playAllText}>Reproducir todo</Text>
          </TouchableOpacity>

          <FlatList
            data={songs}
            keyExtractor={(_, index) => `song-${index}`}
            renderItem={({ item, index }) => (
              <PlaylistSongRow
                song={item}
                isFavorited={isFavorited(item.id)}
                onPress={() => onSongPress(index)}
                onToggleFavorite={() => onToggleFavorite(item)}
                onAddToPlaylist={() => onAddToPlaylist(item)}
                onRemoveFromPlaylist={() => onRemoveSong(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    paddingBottom: 110,
    width: "100%",
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayPanel: {
    backgroundColor: "transparent",
  },
  modalCard: {
    maxHeight: "100%",
    backgroundColor: "#0b142a",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#20345d",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButtonText: {
    color: "#7fe9b5",
    fontSize: 16,
    fontWeight: "700",
  },
  heroRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    marginBottom: 14,
    padding: 10,
    borderRadius: 16,
    backgroundColor: "#0f1d3b",
    borderWidth: 1,
    borderColor: "#1e3156",
  },
  coverImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: "#142443",
  },
  coverPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1e3156",
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  playlistLabel: {
    color: "#8fb3ff",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#f4f8ff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
  },
  heroDescription: {
    color: "#b8c7e8",
    fontSize: 14,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: "#9fb4d6",
    fontSize: 13,
    fontWeight: "600",
  },
  playAllButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1DB954",
    borderRadius: 999,
    marginBottom: 12,
    shadowColor: "#1DB954",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  playAllText: {
    color: "#031427",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  menuContainer: {
    backgroundColor: "#0c1730",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1c2f55",
    marginBottom: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuItemText: {
    color: "#9fb4d6",
    fontSize: 16,
    fontWeight: "600",
  },
});
