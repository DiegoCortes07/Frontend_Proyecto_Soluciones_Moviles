import React from "react";
import { Text, StyleSheet, Image, TouchableOpacity, View } from "react-native";
import Playlist from "../../../../interfaces/Playlist";
import { useTheme } from "../../../../contexts/ThemeContext";
import { getPlaylistImageUrl, logImageError } from "../../../../utils/imageHelper";

interface PlaylistCardProps {
  playlist: Playlist;
  coverImage: string;
  onPress: () => void;
  cantSongs: number;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  coverImage,
  onPress,
  cantSongs,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: getPlaylistImageUrl(coverImage),
          }}
          style={styles.image}
          onError={() => logImageError("PlaylistCard", coverImage)}
          progressiveRenderingEnabled={true}
        />
        <View style={styles.songBadge}>
          <Text style={styles.songBadgeText}>
            {cantSongs === 1 ? "1 canción" : `${cantSongs} canciones`}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {playlist.name}
      </Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {playlist.description?.trim() || "Sin descripción"}
      </Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    width: 140,
    marginRight: 12,
    alignItems: "flex-start",
    backgroundColor: theme.backgroundCard,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    gap: 6,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.backgroundElevated,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  songBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(3, 169, 244, 0.85)",
  },
  songBadgeText: {
    color: "#f7fbff",
    fontSize: 11,
    fontWeight: "800",
  },
  cardTitle: {
    color: theme.textPrimary,
    marginTop: 2,
    textAlign: "left",
    fontWeight: "800",
    fontSize: 14,
    lineHeight: 18,
  },
  cardDescription: {
    color: theme.textTertiary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "left",
  },
});
