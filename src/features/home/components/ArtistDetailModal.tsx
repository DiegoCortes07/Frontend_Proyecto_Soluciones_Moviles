import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Song from "../../../interfaces/Song";
import Artist from "../../../interfaces/Artist";

const defaultSongImage = "https://cdn-icons-png.flaticon.com/512/1384/1384060.png";
const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

interface ArtistDetailModalProps {
  artist: Artist | null;
  songs: Song[];
  loading: boolean;
  isFavorited: (songId: number) => boolean;
  onClose: () => void;
  onSongPress: (song: Song) => void;
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  artist,
  songs,
  loading,
  isFavorited,
  onClose,
  onSongPress,
  onToggleFavorite,
  onAddToPlaylist,
}) => {
  const getArtistImage = () => artist?.image || defaultAvatar;
  const getSongImage = (song: Song) =>
    song?.imageUrl || (song as any)?.image || defaultSongImage;

  if (!artist) return null;

  return (
    <Modal visible={!!artist} transparent animationType="slide">
      <View style={styles.artistDetailContainer}>
        <View style={styles.artistDetailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: getArtistImage() }}
            style={styles.artistDetailImage}
            resizeMode="cover"
          />
          <Text style={styles.artistDetailName}>{artist.name}</Text>
          <Text style={styles.artistDetailDesc}>{artist.description}</Text>
        </View>
        <View style={styles.artistSongsContainer}>
          <Text style={styles.artistSongsTitle}>Canciones</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#1DB954" />
          ) : (
            <FlatList<Song>
              data={songs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.artistSongItem}>
                  <TouchableOpacity
                    onPress={() => {
                      onSongPress(item);
                      onClose();
                    }}
                    style={styles.artistSongMain}
                  >
                    <Image
                      source={{ uri: getSongImage(item) }}
                      style={styles.artistSongImage}
                      resizeMode="cover"
                    />
                    <View style={styles.artistSongInfo}>
                      <Text style={styles.artistSongTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.artistSongArtist} numberOfLines={1}>
                        {item.artistName}
                      </Text>
                    </View>
                    <Icon name="play-circle" size={28} color="#1DB954" />
                  </TouchableOpacity>
                  <View style={styles.artistSongActions}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item);
                      }}
                      style={styles.songActionButton}
                    >
                      <Icon
                        name={isFavorited(item.id) ? "heart" : "heart-o"}
                        size={16}
                        color={isFavorited(item.id) ? "#ff4d4d" : "#9fb4d6"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(item);
                      }}
                      style={styles.songActionButton}
                    >
                      <Icon name="plus" size={16} color="#9fb4d6" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay canciones disponibles</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  artistDetailContainer: {
    flex: 1,
    backgroundColor: "#050d1a",
  },
  artistDetailHeader: {
    backgroundColor: "#0f1d38",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#1c2f55",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  artistDetailImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#1DB954",
  },
  artistDetailName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  artistDetailDesc: {
    color: "#bbb",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  artistSongsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  artistSongsTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  artistSongItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  artistSongMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  artistSongActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  artistSongImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  artistSongInfo: {
    flex: 1,
  },
  artistSongTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  artistSongArtist: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
    marginTop: 20,
  },
  songActionButton: {
    padding: 6,
  },
});
