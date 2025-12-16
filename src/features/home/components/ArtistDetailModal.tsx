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
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { filterExplicitSongs } from "../../../utils/explicitFilter";

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
  const { theme } = useTheme();
  const { user } = useAuth();
  const getArtistImage = () => artist?.image || defaultAvatar;
  const getSongImage = (song: Song) =>
    song?.imageUrl || (song as any)?.image || defaultSongImage;

  if (!artist) return null;

  return (
    <Modal visible={!!artist} transparent animationType="slide">
      <View style={getStyles(theme).artistDetailContainer}>
        <View style={getStyles(theme).artistDetailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="chevron-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Image
            source={{ uri: getArtistImage() }}
            style={getStyles(theme).artistDetailImage}
            resizeMode="cover"
          />
          <Text style={getStyles(theme).artistDetailName}>{artist.name}</Text>
          <Text style={getStyles(theme).artistDetailDesc}>{artist.description}</Text>
        </View>
        <View style={getStyles(theme).artistSongsContainer}>
          <Text style={getStyles(theme).artistSongsTitle}>Canciones</Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <FlatList<Song>
              data={filterExplicitSongs(songs, user)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={getStyles(theme).artistSongItem}>
                  <TouchableOpacity
                    onPress={() => {
                      onSongPress(item);
                      onClose();
                    }}
                    style={getStyles(theme).artistSongMain}
                  >
                    <Image
                      source={{ uri: getSongImage(item) }}
                      style={getStyles(theme).artistSongImage}
                      resizeMode="cover"
                    />
                    <View style={getStyles(theme).artistSongInfo}>
                      <Text style={getStyles(theme).artistSongTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={getStyles(theme).artistSongArtist} numberOfLines={1}>
                        {item.artistName}
                      </Text>
                    </View>
                    <Icon name="play-circle" size={28} color={theme.primary} />
                  </TouchableOpacity>
                  <View style={getStyles(theme).artistSongActions}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item);
                      }}
                      style={getStyles(theme).songActionButton}
                    >
                      <Icon
                        name={isFavorited(item.id) ? "heart" : "heart-o"}
                        size={16}
                        color={isFavorited(item.id) ? theme.liked : theme.textTertiary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        onAddToPlaylist(item);
                      }}
                      style={getStyles(theme).songActionButton}
                    >
                      <Icon name="plus" size={16} color={theme.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <Text style={getStyles(theme).emptyText}>No hay canciones disponibles</Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    artistDetailContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    artistDetailHeader: {
      backgroundColor: theme.backgroundSecondary,
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: theme.border,
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
      borderColor: theme.primary,
    },
    artistDetailName: {
      color: theme.textPrimary,
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
    },
    artistDetailDesc: {
      color: theme.textSecondary,
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
      color: theme.textPrimary,
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 16,
    },
    artistSongItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.border,
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
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    artistSongArtist: {
      color: theme.textTertiary,
      fontSize: 13,
      marginTop: 2,
    },
    emptyText: {
      color: theme.textTertiary,
      textAlign: "center",
      fontSize: 14,
      marginTop: 20,
    },
    songActionButton: {
      padding: 6,
    },
  });
