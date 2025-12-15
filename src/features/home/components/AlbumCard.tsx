import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Album from "../../../interfaces/Album";
import { useTheme } from "../../../contexts/ThemeContext";
import Artist from "../../../interfaces/Artist";
import { getSongImageUrl, logImageError } from "../../../utils/imageHelper";

const defaultAvatar =
  "https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

interface AlbumCardProps {
  album: Album;
  artist?: Artist | null;
  onAlbumPress: () => void;
  onArtistPress?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  artist,
  onAlbumPress,
  onArtistPress,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const getAlbumImage = () => getSongImageUrl(album?.image || (album as any)?.imageUrl);
  const getArtistImage = () => artist?.image || defaultAvatar;

  return (
    <View style={styles.albumItem}>
      <TouchableOpacity onPress={onAlbumPress}>
        <Image
          source={{ uri: getAlbumImage() }}
          style={styles.albumImage}
          resizeMode="cover"
          onError={() => logImageError("AlbumCard", getAlbumImage())}
          progressiveRenderingEnabled={true}
        />
      </TouchableOpacity>
      <Text style={styles.albumTitle} numberOfLines={1}>
        {album.title}
      </Text>
      <View style={styles.albumMetadata}>
        <Text style={styles.albumMeta} numberOfLines={1}>
          {album.genre}
        </Text>
        <Text style={styles.albumMeta}>•</Text>
        <Text style={styles.albumMeta} numberOfLines={1}>
          {album.year}
        </Text>
      </View>
      {onArtistPress && (
        <TouchableOpacity onPress={onArtistPress} activeOpacity={0.8}>
          <View style={styles.albumArtistRow}>
            <Image
              source={{ uri: getArtistImage() }}
              style={styles.albumArtistImage}
              resizeMode="cover"
            />
            <Text style={styles.artistLink} numberOfLines={1}>
              {album.artistName}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  albumItem: {
    marginRight: 20,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: theme.backgroundCard,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1DB954",
  },
  albumTitle: {
    color: theme.textPrimary,
    marginTop: 10,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  albumMetadata: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  albumMeta: {
    color: theme.textTertiary,
    fontSize: 12,
    fontWeight: "600",
  },
  albumArtistRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  albumArtistImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  artistLink: {
    color: theme.textTertiary,
    fontSize: 14,
  },
});
